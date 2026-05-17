const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "fl_fdle_criminal_justice_agency_websites";

const inPath = path.resolve(ROOT, `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.candidates.json`);
const outPath = path.resolve(ROOT, `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.authority_targets.json`);

const FL_TOP50 = ["Jacksonville", "Miami", "Tampa"];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(v) {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

function cityFromName(name) {
  const n = clean(name).toUpperCase();

  for (const city of FL_TOP50) {
    if (n.includes(city.toUpperCase())) return city;
  }

  if (n.includes("MIAMI-DADE") || n.includes("MIAMI DADE")) return "Miami";
  if (n.includes("DUVAL COUNTY SHERIFF") || n.includes("JACKSONVILLE SHERIFF")) return "Jacksonville";
  if (n.includes("HILLSBOROUGH COUNTY SHERIFF")) return "Tampa";

  return "";
}

function authorityType(name) {
  if (/SHERIFF/i.test(name)) return "county_sheriff_authority";
  return "municipal_police_authority";
}

function tierFor(name) {
  if (/JACKSONVILLE SHERIFF|MIAMI POLICE|MIAMI-DADE|MIAMI DADE|TAMPA POLICE|HILLSBOROUGH COUNTY SHERIFF/i.test(name)) {
    return "TIER_1";
  }
  return "TIER_2";
}

function absoluteUrl(url) {
  const u = clean(url);
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `https://www.fdle.state.fl.us${u}`;
  return u;
}

function isGood(name) {
  if (!/POLICE|SHERIFF/i.test(name)) return false;
  if (/SCHOOL|UNIVERSITY|COLLEGE|HOSPITAL|AIRPORT|TRANSIT|RAILROAD|PARK|TRAINING|ACADEMY|ASSOCIATION|CORRECTIONS|PROBATION/i.test(name)) return false;
  return Boolean(cityFromName(name));
}

function main() {
  console.log("[FL AUTHORITY FILTER] Starting...");

  const input = readJson(inPath);
  const raw = Array.isArray(input.candidates) ? input.candidates : [];

  const seen = new Set();
  const targets = [];

  for (const c of raw) {
    const agencyName = clean(c.agency_name);
    if (!isGood(agencyName)) continue;

    const city = cityFromName(agencyName);
    const key = `${agencyName.toUpperCase()}|${city}|FL`;
    if (seen.has(key)) continue;
    seen.add(key);

    const tier = tierFor(agencyName);
    const url = absoluteUrl(c.website);

    targets.push({
      authority_target_id: `FL-FDLE-AUTH-${String(targets.length + 1).padStart(4, "0")}`,
      source_candidate_id: c.candidate_id,
      source_id: SOURCE_ID,
      source_name: "Florida Criminal Justice Agency Websites",
      source_url: "https://www.fdle.state.fl.us/cjstc/publications/criminal-justice-agency-links",
      agency_name: agencyName,
      authority_type: authorityType(agencyName),
      agency_type: authorityType(agencyName),
      city,
      state: "FL",
      country: "US",
      website: url,
      contact_url: url,
      validated_tier: tier,
      actionability: tier === "TIER_1" ? "prime_target" : "strong_target",
      review_status: "fl_fdle_authority_review_required",
      live_import_allowed: false,
      required_next_sources: ["agency_websites.json", "official_agency_sites", "local_public_safety_budgets", "fbi_doj_press_releases"],
      notes: [
        "Filtered from official FDLE criminal justice agency website source.",
        "Review-only until contact and signal enrichment are confirmed."
      ]
    });
  }

  const output = {
    source_id: SOURCE_ID,
    state: "FL",
    generated_at: new Date().toISOString(),
    input_candidate_count: raw.length,
    authority_target_count: targets.length,
    rejected_count: raw.length - targets.length,
    live_import_allowed: false,
    targets
  };

  writeJson(outPath, output);

  console.log("[FL AUTHORITY FILTER] Input:", raw.length);
  console.log("[FL AUTHORITY FILTER] Targets:", targets.length);
  console.log("[FL AUTHORITY FILTER] Output:", outPath);
}

main();