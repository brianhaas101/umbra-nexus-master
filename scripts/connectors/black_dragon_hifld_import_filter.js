// scripts/connectors/black_dragon_hifld_import_filter.js
// Filters HIFLD priority candidates into clean import candidates.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const inputPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.priority_review.json`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.import_candidates.json`
);

const EXCLUDE_PATTERNS = [
  /school district/i,
  /independent school/i,
  /university/i,
  /college/i,
  /campus/i,
  /airport/i,
  /park police/i,
  /transit police/i,
  /railroad/i,
  /tribal/i,
  /constable/i,
  /marshal/i
];

const INCLUDE_PATTERNS = [
  /police department/i,
  /sheriff/i,
  /department of public safety/i,
  /public safety/i
];

const PRIORITY_MAJOR_CITIES = new Set([
  "PHOENIX",
  "LOS ANGELES",
  "HOUSTON",
  "DALLAS",
  "PORTLAND",
  "EUGENE",
  "SEATTLE",
  "ALBUQUERQUE",
  "LAS VEGAS",
  "MIAMI",
  "ATLANTA",
  "CHARLOTTE"
]);

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

function isPrimaryAgency(candidate) {
  const name = clean(candidate.agency_name);
  const city = upper(candidate.city);
  const text = `${name} ${candidate.agency_type || ""}`;

  if (!matchesAny(text, INCLUDE_PATTERNS)) return false;
  if (matchesAny(text, EXCLUDE_PATTERNS)) return false;

  const isSheriff = /sheriff/i.test(name);
  const isMajorCityPolice =
    /police department/i.test(name) &&
    PRIORITY_MAJOR_CITIES.has(city);

  const isPublicSafety =
    /department of public safety|public safety/i.test(name);

  return isSheriff || isMajorCityPolice || isPublicSafety;
}

function normalizeImportCandidate(candidate, index) {
  const website = clean(candidate.website || candidate.raw_properties?.WEBSITE);
  const phone = clean(candidate.phone || candidate.raw_properties?.TELEPHONE);
  const sourceDate = clean(candidate.source_date || candidate.raw_properties?.SOURCEDATE);

  return {
    import_candidate_id: `HIFLD-IMPORT-${String(index + 1).padStart(4, "0")}`,
    source_candidate_id: candidate.candidate_id,
    source_id: SOURCE_ID,
    source_name: candidate.source_name,
    source_url: candidate.source_url,
    source_date: sourceDate,
    agency_name: clean(candidate.agency_name),
    agency_type: candidate.agency_type,
    city: clean(candidate.city),
    state: clean(candidate.state),
    county: clean(candidate.county),
    country: "US",
    lat: candidate.lat,
    lon: candidate.lon,
    address: clean(candidate.address),
    phone,
    website,
    contact_url: website,
    agency_size_estimate: candidate.agency_size_estimate || 0,
    priority_score: candidate.priority_score,
    priority_reasons: candidate.priority_reasons || [],
    import_recommendation: "import_candidate",
    review_status: "needs_signal_enrichment",
    required_next_sources: [
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases"
    ],
    notes: [
      "Real HIFLD-derived law enforcement entity.",
      "Approved as import candidate, but still requires signal enrichment before live lead import.",
      "No placeholder data allowed."
    ],
    raw_properties: candidate.raw_properties
  };
}

function main() {
  console.log("[HIFLD IMPORT FILTER] Starting...");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing priority review file: ${inputPath}`);
  }

  const input = readJson(inputPath);
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];

  const filtered = candidates
    .filter(isPrimaryAgency)
    .sort((a, b) => b.priority_score - a.priority_score)
    .map(normalizeImportCandidate);

  const output = {
    source_id: SOURCE_ID,
    generated_at: new Date().toISOString(),
    input_priority_count: candidates.length,
    import_candidate_count: filtered.length,
    import_rule: {
      include: [
        "major city police departments",
        "county sheriff offices",
        "public safety agencies"
      ],
      exclude: [
        "school police",
        "campus police",
        "airport/transit/rail police",
        "small suburban departments unless later manually approved"
      ],
      live_import_allowed: false
    },
    candidates: filtered
  };

  writeJson(outPath, output);

  console.log("[HIFLD IMPORT FILTER] Input priority:", candidates.length);
  console.log("[HIFLD IMPORT FILTER] Import candidates:", filtered.length);
  console.log("[HIFLD IMPORT FILTER] Output:", outPath);
}

main();