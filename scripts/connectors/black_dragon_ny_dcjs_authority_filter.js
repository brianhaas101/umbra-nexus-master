// scripts/connectors/black_dragon_ny_dcjs_authority_filter.js
// Filters NY DCJS candidates into clean New York authority targets.
// Does NOT write to live major_city_targets or leads_master.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "ny_dcjs_criminal_justice_agencies";

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const inputPath = path.join(cacheDir, `${SOURCE_ID}.candidates.json`);
const outPath = path.join(cacheDir, `${SOURCE_ID}.authority_targets.json`);
const manifestPath = path.join(cacheDir, "state_directory_manifest.json");

const EXCLUDE_PATTERNS = [
  /AMTRAK/i,
  /TRANSPORTATION/i,
  /\bMTA\b/i,
  /RAPID TRANSIT/i,
  /LABORATORY/i,
  /LAB\b/i,
  /PROBATION.*BRONX/i,
  /PROBATION.*MANHATTAN/i,
  /PROBATION.*EXECUTIVE/i,
  /GENERAL COUNSEL/i,
  /FAMILY COURT/i,
  /SCHOOL/i,
  /UNIVERSITY/i,
  /COLLEGE/i,
  /HOSPITAL/i,
  /MEDICAL/i,
  /CORRECTIONAL FACILITY/i,
  /PRISON/i
];

const INCLUDE_PATTERNS = [
  /NEW YORK CITY POLICE DEPARTMENT$/i,
  /NEW YORK COUNTY SHERIFF/i,
  /BRONX COUNTY SHERIFF/i,
  /KINGS COUNTY SHERIFF/i,
  /NEW YORK STATE POLICE/i,
  /DISTRICT ATTORNEY/i
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

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function authorityType(name) {
  if (/SHERIFF/i.test(name)) return "county_sheriff_authority";
  if (/STATE POLICE/i.test(name)) return "state_police_authority";
  if (/POLICE/i.test(name)) return "municipal_police_authority";
  if (/DISTRICT ATTORNEY/i.test(name)) return "prosecutor_authority";
  return "criminal_justice_authority";
}

function tierFor(name) {
  if (/NEW YORK CITY POLICE DEPARTMENT$/i.test(name)) return "TIER_1";
  if (/NEW YORK STATE POLICE/i.test(name)) return "TIER_1";
  if (/DISTRICT ATTORNEY/i.test(name)) return "TIER_2";
  if (/SHERIFF/i.test(name)) return "TIER_2";
  return "TIER_3";
}

function actionabilityFor(tier) {
  if (tier === "TIER_1") return "prime_target";
  if (tier === "TIER_2") return "strong_target";
  if (tier === "TIER_3") return "review_target";
  return "hold";
}

function isAuthorityTarget(candidate) {
  const name = clean(candidate.agency_name);
  if (!name) return false;
  if (matchesAny(name, EXCLUDE_PATTERNS)) return false;
  return matchesAny(name, INCLUDE_PATTERNS);
}

function normalizeTarget(candidate, index) {
  const tier = tierFor(candidate.agency_name);

  return {
    authority_target_id: `NY-DCJS-AUTH-${String(index + 1).padStart(4, "0")}`,
    source_candidate_id: candidate.candidate_id,
    source_id: SOURCE_ID,
    source_name: candidate.source_name,
    source_url: candidate.source_url,

    agency_name: candidate.agency_name,
    authority_type: authorityType(candidate.agency_name),
    agency_type: candidate.agency_type,

    city: "New York",
    state: "NY",
    county: candidate.county || "",
    country: "US",
    address: candidate.address || "",
    phone: candidate.phone || "",
    website: candidate.website || "",
    contact_url: candidate.contact_url || candidate.website || "",

    validated_tier: tier,
    actionability: actionabilityFor(tier),
    review_status: "ny_authority_review_required",
    live_import_allowed: false,

    required_next_sources: [
      "agency_websites.json",
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases"
    ],

    notes: [
      "Filtered from official NY DCJS criminal justice agency directory.",
      "Authority-level New York target candidate.",
      "Review-only until official website/contact and signal enrichment are confirmed."
    ],

    raw_record: candidate.raw_record || null
  };
}

function updateManifest(count) {
  if (!fs.existsSync(manifestPath)) return;

  const manifest = readJson(manifestPath);
  const now = new Date().toISOString();

  manifest.sources = (manifest.sources || []).map((src) => {
    if (src.source_id !== SOURCE_ID) return src;

    return {
      ...src,
      authority_file: `state_directories/${SOURCE_ID}.authority_targets.json`,
      authority_filter_status: "filtered",
      authority_target_count: count,
      last_authority_filtered: now
    };
  });

  manifest.updated_at = now;
  writeJson(manifestPath, manifest);
}

function main() {
  console.log("[NY DCJS AUTHORITY FILTER] Starting...");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing NY DCJS candidates file: ${inputPath}`);
  }

  const input = readJson(inputPath);
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];

  const targets = candidates
    .filter(isAuthorityTarget)
    .map(normalizeTarget)
    .sort((a, b) => {
      const rank = { TIER_1: 1, TIER_2: 2, TIER_3: 3 };
      return (rank[a.validated_tier] || 99) - (rank[b.validated_tier] || 99);
    });

  const output = {
    source_id: SOURCE_ID,
    state: "NY",
    generated_at: new Date().toISOString(),
    input_candidate_count: candidates.length,
    authority_target_count: targets.length,
    rejected_count: candidates.length - targets.length,
    live_import_allowed: false,
    authority_rules: {
      keep: [
        "New York City Police Department",
        "New York State Police - Troop NYC",
        "county sheriff offices",
        "district attorney offices"
      ],
      reject: [
        "transit / MTA / Amtrak police",
        "laboratories",
        "probation sub-offices",
        "schools, hospitals, prisons, and non-buyer subunits"
      ]
    },
    targets
  };

  writeJson(outPath, output);
  updateManifest(targets.length);

  console.log("[NY DCJS AUTHORITY FILTER] Input candidates:", candidates.length);
  console.log("[NY DCJS AUTHORITY FILTER] Authority targets:", targets.length);
  console.log("[NY DCJS AUTHORITY FILTER] Rejected:", output.rejected_count);
  console.log("[NY DCJS AUTHORITY FILTER] Output:", outPath);
}

main();