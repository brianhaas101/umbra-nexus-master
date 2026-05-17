const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "ca_post_law_enforcement_agencies";

const inPath = path.resolve(ROOT, `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.candidates.json`);
const outPath = path.resolve(ROOT, `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.authority_targets.json`);

const CA_TOP50 = [
  "Los Angeles",
  "San Diego",
  "San Jose",
  "San Francisco",
  "Fresno",
  "Sacramento",
  "Long Beach",
  "Oakland",
  "Bakersfield"
];

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

  for (const city of CA_TOP50) {
    const c = city.toUpperCase();
    if (n.includes(c) && /POLICE|SHERIFF/i.test(n)) return city;
  }

  if (n.includes("LOS ANGELES COUNTY SHERIFF")) return "Los Angeles";
  if (n.includes("SAN DIEGO COUNTY SHERIFF")) return "San Diego";
  if (n.includes("SAN FRANCISCO SHERIFF")) return "San Francisco";
  if (n.includes("SACRAMENTO COUNTY SHERIFF")) return "Sacramento";
  if (n.includes("ALAMEDA COUNTY SHERIFF")) return "Oakland";
  if (n.includes("KERN COUNTY SHERIFF")) return "Bakersfield";
  if (n.includes("FRESNO COUNTY SHERIFF")) return "Fresno";
  if (n.includes("SANTA CLARA COUNTY SHERIFF")) return "San Jose";

  return "";
}

function authorityType(name) {
  if (/SHERIFF/i.test(name)) return "county_sheriff_authority";
  return "municipal_police_authority";
}

function tierFor(name) {
  if (/LOS ANGELES POLICE|SAN DIEGO POLICE|SAN JOSE POLICE|SAN FRANCISCO POLICE|LOS ANGELES COUNTY SHERIFF/i.test(name)) {
    return "TIER_1";
  }
  if (/POLICE|SHERIFF/i.test(name)) return "TIER_2";
  return "TIER_3";
}

function isGood(name) {
  if (!/POLICE|SHERIFF/i.test(name)) return false;
  if (/SCHOOL|UNIVERSITY|COLLEGE|COMMUNITY COLLEGE|HOSPITAL|AIRPORT|TRANSIT|RAILROAD|PARK|RESERVE|TRAINING|ACADEMY|ASSOCIATION/i.test(name)) return false;
  return Boolean(cityFromName(name));
}

function main() {
  console.log("[CA AUTHORITY FILTER] Starting...");

  const input = readJson(inPath);
  const raw = Array.isArray(input.candidates) ? input.candidates : [];

  const seen = new Set();
  const targets = [];

  for (const c of raw) {
    const agencyName = clean(c.agency_name);
    if (!isGood(agencyName)) continue;

    const city = cityFromName(agencyName);
    const key = `${agencyName.toUpperCase()}|${city}|CA`;
    if (seen.has(key)) continue;
    seen.add(key);

    const tier = tierFor(agencyName);

    targets.push({
      authority_target_id: `CA-POST-AUTH-${String(targets.length + 1).padStart(4, "0")}`,
      source_candidate_id: c.candidate_id,
      source_id: SOURCE_ID,
      source_name: "California POST Law Enforcement Agencies",
      source_url: "https://post.ca.gov/le-agencies",
      agency_name: agencyName,
      authority_type: authorityType(agencyName),
      agency_type: authorityType(agencyName),
      city,
      state: "CA",
      country: "US",
      validated_tier: tier,
      actionability: tier === "TIER_1" ? "prime_target" : "strong_target",
      review_status: "ca_post_authority_review_required",
      live_import_allowed: false,
      contact_url: "",
      required_next_sources: ["agency_websites.json", "official_agency_sites", "local_public_safety_budgets", "fbi_doj_press_releases"],
      notes: [
        "Filtered from official California POST law enforcement agency source.",
        "Review-only until website/contact and signal enrichment are confirmed."
      ]
    });
  }

  const output = {
    source_id: SOURCE_ID,
    state: "CA",
    generated_at: new Date().toISOString(),
    input_candidate_count: raw.length,
    authority_target_count: targets.length,
    rejected_count: raw.length - targets.length,
    live_import_allowed: false,
    targets
  };

  writeJson(outPath, output);

  console.log("[CA AUTHORITY FILTER] Input:", raw.length);
  console.log("[CA AUTHORITY FILTER] Targets:", targets.length);
  console.log("[CA AUTHORITY FILTER] Output:", outPath);
}

main();