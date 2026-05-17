// scripts/connectors/black_dragon_hifld_entity_consolidator.js
// Consolidates HIFLD import candidates into agency-level entities.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const inputPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.import_candidates.json`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.consolidated_entities.json`
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function upper(value) {
  return clean(value).toUpperCase();
}

function stableSlug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function normalizeAgencyName(name) {
  let n = upper(name);

  n = n.replace(/\s*\/\s*.*$/g, "");
  n = n.replace(/\s*-\s*(HEADQUARTERS|HQ|MAIN|CENTRAL|NORTH|SOUTH|EAST|WEST|NORTHEAST|NORTHWEST|SOUTHEAST|SOUTHWEST|CLEAR LAKE|FONDREN|WESTSIDE|EASTSIDE|DIVISION|DISTRICT|PRECINCT|SUBSTATION|STATION|JUSTICE CENTER).*$/gi, "");
  n = n.replace(/\s+\b(HEADQUARTERS|HQ)\b$/gi, "");
  n = n.replace(/\s+/g, " ").trim();

  return n;
}

function agencyGroupKey(candidate) {
  const agency = normalizeAgencyName(candidate.agency_name);
  const city = upper(candidate.city);
  const state = upper(candidate.state);

  return `${agency}|${city}|${state}`;
}

function recordQuality(candidate) {
  let score = Number(candidate.priority_score || 0);

  if (clean(candidate.website)) score += 8;
  if (clean(candidate.phone)) score += 4;
  if (Number.isFinite(Number(candidate.lat)) && Number.isFinite(Number(candidate.lon))) score += 4;
  if (!/-|\/|DIVISION|HEADQUARTERS|HQ|STATION|SUBSTATION/i.test(candidate.agency_name)) score += 6;

  return score;
}

function mergeReasons(records) {
  return Array.from(
    new Set(records.flatMap((r) => Array.isArray(r.priority_reasons) ? r.priority_reasons : []))
  );
}

function agencyTypeFromName(name, fallback) {
  const t = upper(name);

  if (t.includes("SHERIFF")) return "sheriff_office";
  if (t.includes("DEPARTMENT OF PUBLIC SAFETY")) return "state_law_enforcement";
  if (t.includes("PUBLIC SAFETY")) return "public_safety";
  if (t.includes("POLICE DEPARTMENT")) return "police_department";

  return fallback || "law_enforcement";
}

function consolidateGroup(groupKey, records, index) {
  const sorted = [...records].sort((a, b) => recordQuality(b) - recordQuality(a));
  const best = sorted[0];

  const normalizedName = normalizeAgencyName(best.agency_name);
  const city = clean(best.city);
  const state = clean(best.state);
  const entityId = `HIFLD-ENTITY-${String(index + 1).padStart(4, "0")}`;

  const websites = Array.from(new Set(sorted.map((r) => clean(r.website)).filter(Boolean)));
  const phones = Array.from(new Set(sorted.map((r) => clean(r.phone)).filter(Boolean)));

  return {
    entity_id: entityId,
    source_id: SOURCE_ID,
    source_entity_ids: sorted.map((r) => r.import_candidate_id),
    source_candidate_ids: sorted.map((r) => r.source_candidate_id).filter(Boolean),

    agency_name: normalizedName,
    display_name: clean(best.agency_name),
    agency_type: agencyTypeFromName(normalizedName, best.agency_type),

    city,
    state,
    county: clean(best.county),
    country: "US",
    lat: best.lat,
    lon: best.lon,
    address: clean(best.address),

    contact_url: websites[0] || "",
    websites,
    phones,

    agency_size_estimate: Math.max(...sorted.map((r) => Number(r.agency_size_estimate || 0))),
    priority_score: Math.max(...sorted.map((r) => Number(r.priority_score || 0))),
    priority_reasons: mergeReasons(sorted),

    source_name: "HIFLD Local Law Enforcement Locations",
    source_url: "https://catalog.data.gov/dataset/local-law-enforcement-locations",
    source_date: clean(best.source_date),

    consolidation: {
      group_key: groupKey,
      records_merged: sorted.length,
      selected_record: best.import_candidate_id,
      selected_quality_score: recordQuality(best),
      merged_from_names: sorted.map((r) => r.agency_name)
    },

    review_status: "consolidated_review_required",
    import_recommendation: "agency_level_import_candidate",
    required_next_sources: [
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases"
    ],
    notes: [
      "Consolidated from HIFLD import candidates.",
      "Agency-level entity candidate only.",
      "Requires official website/source enrichment before live lead import."
    ]
  };
}

function main() {
  console.log("[HIFLD CONSOLIDATOR] Starting...");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing import candidates: ${inputPath}`);
  }

  const input = readJson(inputPath);
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];

  const groups = new Map();

  candidates.forEach((candidate) => {
    const key = agencyGroupKey(candidate);

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(candidate);
  });

  const consolidated = Array.from(groups.entries())
    .map(([key, records], index) => consolidateGroup(key, records, index))
    .sort((a, b) => b.priority_score - a.priority_score);

  const output = {
    source_id: SOURCE_ID,
    generated_at: new Date().toISOString(),
    input_import_candidate_count: candidates.length,
    consolidated_entity_count: consolidated.length,
    duplicate_records_collapsed: candidates.length - consolidated.length,
    live_import_allowed: false,
    consolidation_rules: {
      group_key: "normalized_agency_name + city + state",
      subdivision_stripping: true,
      selected_record_rule: "highest priority/quality record",
      no_leads_master_write: true
    },
    entities: consolidated
  };

  writeJson(outPath, output);

  console.log("[HIFLD CONSOLIDATOR] Input candidates:", candidates.length);
  console.log("[HIFLD CONSOLIDATOR] Consolidated entities:", consolidated.length);
  console.log("[HIFLD CONSOLIDATOR] Duplicates collapsed:", output.duplicate_records_collapsed);
  console.log("[HIFLD CONSOLIDATOR] Output:", outPath);
}

main();
