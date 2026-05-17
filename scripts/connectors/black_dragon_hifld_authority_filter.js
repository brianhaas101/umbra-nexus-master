// scripts/connectors/black_dragon_hifld_authority_filter.js
// Filters consolidated HIFLD entities to true agency-level authority targets.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const inputPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.consolidated_entities.json`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.authority_targets.json`
);

const EXCLUDE_PATTERNS = [
  /SCHOOL/i,
  /DISTRICT POLICE/i,
  /UNIVERSITY/i,
  /COLLEGE/i,
  /SEMINARY/i,
  /MEDICAL/i,
  /HOSPITAL/i,
  /HEALTH/i,
  /AIRPORT/i,
  /TRANSIT/i,
  /RAILROAD/i,
  /PARK POLICE/i,
  /TRIBAL/i,
  /CONSTABLE/i,
  /MARSHAL/i,
  /JUSTICE CENTER/i,
  /JAIL/i,
  /DETENTION/i,
  /CORRECTION/i,
  /PRECINCT/i,
  /SUBSTATION/i,
  /STATION$/i,
  /DIVISION/i,
  /REGION/i,
  /AREA \d/i,
  /COMPANY [A-Z]/i,
  /HEADQUARTERS/i,
  /HQ/i
];

const INCLUDE_PATTERNS = [
  /POLICE DEPARTMENT$/i,
  /SHERIFFS? OFFICE$/i,
  /DEPARTMENT OF PUBLIC SAFETY$/i,
  /STATE POLICE$/i,
  /HIGHWAY PATROL$/i
];

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

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function isAuthorityTarget(entity) {
  const name = clean(entity.agency_name);
  const display = clean(entity.display_name);
  const text = `${name} ${display}`;

  if (!name) return false;
  if (matchesAny(text, EXCLUDE_PATTERNS)) return false;

  if (matchesAny(name, INCLUDE_PATTERNS)) return true;

  // Allow county sheriff names that include extra legal suffixes after normalization.
  if (/COUNTY SHERIFFS? OFFICE/i.test(name)) return true;

  // Allow major municipal police names even if punctuation/spacing differs.
  if (/^[A-Z\s.'-]+ POLICE DEPARTMENT$/i.test(name)) return true;

  return false;
}

function authorityType(entity) {
  const name = upper(entity.agency_name);

  if (name.includes("SHERIFF")) return "county_sheriff_authority";
  if (name.includes("DEPARTMENT OF PUBLIC SAFETY")) return "state_public_safety_authority";
  if (name.includes("STATE POLICE")) return "state_police_authority";
  if (name.includes("HIGHWAY PATROL")) return "state_highway_patrol_authority";
  if (name.includes("POLICE DEPARTMENT")) return "municipal_police_authority";

  return "law_enforcement_authority";
}

function normalizeTarget(entity, index) {
  return {
    authority_target_id: `HIFLD-AUTH-${String(index + 1).padStart(4, "0")}`,
    source_entity_id: entity.entity_id,
    source_id: SOURCE_ID,

    agency_name: entity.agency_name,
    display_name: entity.display_name,
    authority_type: authorityType(entity),
    agency_type: entity.agency_type,

    city: entity.city,
    state: entity.state,
    county: entity.county,
    country: entity.country || "US",
    lat: entity.lat,
    lon: entity.lon,
    address: entity.address,

    contact_url: entity.contact_url || "",
    websites: entity.websites || [],
    phones: entity.phones || [],

    agency_size_estimate: entity.agency_size_estimate || 0,
    priority_score: entity.priority_score || 0,
    priority_reasons: entity.priority_reasons || [],

    source_name: entity.source_name,
    source_url: entity.source_url,
    source_date: entity.source_date,

    review_status: "authority_target_review_required",
    live_import_allowed: false,
    required_next_sources: [
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases",
      "state_post_boards"
    ],
    notes: [
      "Filtered as a true agency-level authority target.",
      "Not yet approved for live leads_master import.",
      "Requires official agency-source confirmation and signal enrichment before import."
    ],
    consolidation: entity.consolidation || null
  };
}

function main() {
  console.log("[HIFLD AUTHORITY FILTER] Starting...");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing consolidated entities: ${inputPath}`);
  }

  const input = readJson(inputPath);
  const entities = Array.isArray(input.entities) ? input.entities : [];

  const authorityTargets = entities
    .filter(isAuthorityTarget)
    .sort((a, b) => Number(b.priority_score || 0) - Number(a.priority_score || 0))
    .map(normalizeTarget);

  const output = {
    source_id: SOURCE_ID,
    generated_at: new Date().toISOString(),
    input_consolidated_count: entities.length,
    authority_target_count: authorityTargets.length,
    rejected_count: entities.length - authorityTargets.length,
    live_import_allowed: false,
    authority_rules: {
      keep: [
        "municipal police departments",
        "county sheriff offices",
        "state public safety agencies",
        "state police agencies",
        "highway patrol agencies"
      ],
      reject: [
        "campus/school/seminary police",
        "hospital/medical police",
        "airport/transit/railroad police",
        "jail/detention/corrections facilities",
        "substations/divisions/precincts/headquarters",
        "task-specific or facility-specific branches"
      ],
      no_leads_master_write: true
    },
    targets: authorityTargets
  };

  writeJson(outPath, output);

  console.log("[HIFLD AUTHORITY FILTER] Input consolidated:", entities.length);
  console.log("[HIFLD AUTHORITY FILTER] Authority targets:", authorityTargets.length);
  console.log("[HIFLD AUTHORITY FILTER] Rejected:", output.rejected_count);
  console.log("[HIFLD AUTHORITY FILTER] Output:", outPath);
}

main();