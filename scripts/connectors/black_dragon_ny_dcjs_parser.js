// scripts/connectors/black_dragon_ny_dcjs_parser.js
// Parses cached NY DCJS Criminal Justice Agencies dataset into NYC expansion candidates.
// Does NOT write to live major_city_targets or leads_master.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "ny_dcjs_criminal_justice_agencies";

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const cachePath = path.join(cacheDir, `${SOURCE_ID}.cache.json`);
const outPath = path.join(cacheDir, `${SOURCE_ID}.candidates.json`);
const manifestPath = path.join(cacheDir, "state_directory_manifest.json");

const NYC_BOROUGHS = new Set([
  "NEW YORK",
  "MANHATTAN",
  "BRONX",
  "BROOKLYN",
  "QUEENS",
  "STATEN ISLAND",
  "RICHMOND"
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

function getField(record, names) {
  for (const name of names) {
    if (record[name] !== undefined && record[name] !== null && clean(record[name]) !== "") {
      return record[name];
    }
  }
  return "";
}

function isNycRecord(record) {
  const city = upper(getField(record, ["city", "City", "CITY", "municipality", "Municipality"]));
  const county = upper(getField(record, ["county", "County", "COUNTY"]));
  const address = upper(getField(record, ["address", "Address", "ADDRESS", "street_address"]));
  const agency = upper(getField(record, ["agency_name", "Agency Name", "agency", "name", "Name"]));

  return (
    NYC_BOROUGHS.has(city) ||
    NYC_BOROUGHS.has(county) ||
    address.includes("NEW YORK") ||
    agency.includes("NEW YORK CITY") ||
    agency.includes("NYPD")
  );
}

function isUsefulAgency(record) {
  const name = upper(getField(record, [
    "agency_name",
    "Agency Name",
    "agency",
    "name",
    "Name",
    "agencyname"
  ]));

  if (!name) return false;

  if (/SCHOOL|UNIVERSITY|COLLEGE|HOSPITAL|MEDICAL|CORRECTIONAL FACILITY|PRISON/i.test(name)) {
    return false;
  }

  return /POLICE|SHERIFF|DISTRICT ATTORNEY|PROBATION|CRIMINAL JUSTICE|PUBLIC SAFETY/i.test(name);
}

function inferAgencyType(name) {
  const t = upper(name);

  if (t.includes("SHERIFF")) return "sheriff_office";
  if (t.includes("POLICE")) return "police_department";
  if (t.includes("DISTRICT ATTORNEY")) return "prosecutor_office";
  if (t.includes("PROBATION")) return "probation_department";
  if (t.includes("PUBLIC SAFETY")) return "public_safety";
  return "criminal_justice_agency";
}

function normalizeCandidate(record, index) {
  const agencyName = clean(getField(record, [
    "agency_name",
    "Agency Name",
    "agency",
    "name",
    "Name",
    "agencyname"
  ]));

  const cityRaw = clean(getField(record, ["city", "City", "CITY", "municipality", "Municipality"]));
  const county = clean(getField(record, ["county", "County", "COUNTY"]));
  const address = clean(getField(record, ["address", "Address", "ADDRESS", "street_address"]));
  const phone = clean(getField(record, ["phone", "Phone", "PHONE", "telephone", "Telephone"]));
  const website = clean(getField(record, ["website", "Website", "WEB_SITE", "url", "URL"]));

  return {
    candidate_id: `NY-DCJS-CAND-${String(index + 1).padStart(5, "0")}`,
    source_id: SOURCE_ID,
    source_name: "New York Directory of Criminal Justice Agencies",
    source_url: "https://data.ny.gov/Public-Safety/Directory-of-Criminal-Justice-Agencies/gugp-n5ip",

    agency_name: agencyName,
    agency_type: inferAgencyType(agencyName),

    city: "New York",
    source_city: cityRaw,
    state: "NY",
    county,
    country: "US",
    address,
    phone,
    website,
    contact_url: website,

    priority_city: true,
    top_50_city: "New York",
    review_status: "state_directory_review_required",
    import_allowed: false,

    required_next_sources: [
      "agency_websites.json",
      "official_agency_sites",
      "local_public_safety_budgets",
      "fbi_doj_press_releases"
    ],

    notes: [
      "Real candidate extracted from New York DCJS official criminal justice agency directory.",
      "Review-only candidate. Not approved for client action until official contact path and signal enrichment are confirmed."
    ],

    raw_record: record
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
      parsed_file: `state_directories/${SOURCE_ID}.candidates.json`,
      candidate_file: `state_directories/${SOURCE_ID}.candidates.json`,
      parse_status: "parsed",
      candidate_count: count,
      last_parsed: now
    };
  });

  manifest.updated_at = now;
  writeJson(manifestPath, manifest);
}

function main() {
  console.log("[NY DCJS PARSER] Starting...");

  if (!fs.existsSync(cachePath)) {
    throw new Error(`Missing NY DCJS cache: ${cachePath}`);
  }

  const cache = readJson(cachePath);
  const records = Array.isArray(cache.records) ? cache.records : [];

  const sampleFields = records[0] ? Object.keys(records[0]) : [];

  const candidates = records
    .filter(isNycRecord)
    .filter(isUsefulAgency)
    .map(normalizeCandidate);

  const output = {
    source_id: SOURCE_ID,
    state: "NY",
    generated_at: new Date().toISOString(),
    input_record_count: records.length,
    candidate_count: candidates.length,
    top_50_city: "New York",
    sample_fields: sampleFields,
    live_import_allowed: false,
    candidates
  };

  writeJson(outPath, output);
  updateManifest(candidates.length);

  console.log("[NY DCJS PARSER] Input records:", records.length);
  console.log("[NY DCJS PARSER] Candidates:", candidates.length);
  console.log("[NY DCJS PARSER] Sample fields:", sampleFields.join(", "));
  console.log("[NY DCJS PARSER] Output:", outPath);
}

main();