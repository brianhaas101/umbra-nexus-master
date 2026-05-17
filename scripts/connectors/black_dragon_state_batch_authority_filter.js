const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const SOURCES = [
  {
    state: "AZ",
    source_id: "az_acjc_statewide_agency_directory",
    output_id: "az_acjc",
    cities: [
  "Phoenix", "Tucson", "Mesa", "Glendale", "Scottsdale", "Chandler",
  "Tempe", "Peoria", "Surprise", "Yuma", "Flagstaff", "Prescott",
  "Kingman", "Casa Grande", "Sierra Vista", "Nogales", "Safford",
  "Globe", "Parker", "Holbrook", "Bisbee", "Avondale", "Goodyear",
  "Buckeye", "Gilbert", "Maricopa", "Apache Junction", "Bullhead City",
  "Benson", "Show Low", "Cottonwood", "Sedona", "Eloy", "Florence",
  "Coolidge", "Douglas", "Willcox"
]
  },
  {
    state: "IL",
    source_id: "il_sheriffs_association_directory",
    output_id: "il_sheriffs",
    cities: ["Chicago"]
  },
  {
    state: "OH",
    source_id: "oh_ag_law_enforcement_directory",
    output_id: "oh_ag",
    cities: ["Columbus"]
  },
  {
    state: "NC",
    source_id: "nc_cjin_law_enforcement_agencies",
    output_id: "nc_cjin",
    cities: ["Charlotte", "Raleigh"]
  }
];

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const outPath = path.join(
  cacheDir,
  "state_batch_az_il_oh_nc.authority_targets.json"
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

function cityFromName(name, cities) {
  const n = clean(name).toUpperCase();

  for (const city of cities) {
    if (n.includes(city.toUpperCase())) return city;
  }

  if (n.includes("MARICOPA COUNTY SHERIFF")) return "Phoenix";
  if (n.includes("PIMA COUNTY SHERIFF")) return "Tucson";
  if (n.includes("COOK COUNTY SHERIFF")) return "Chicago";
  if (n.includes("FRANKLIN COUNTY SHERIFF")) return "Columbus";
  if (n.includes("MECKLENBURG COUNTY SHERIFF")) return "Charlotte";
  if (n.includes("WAKE COUNTY SHERIFF")) return "Raleigh";

  return "";
}

function authorityType(name) {
  if (/SHERIFF/i.test(name)) return "county_sheriff_authority";
  if (/TRIBAL POLICE/i.test(name)) return "tribal_police_authority";
  if (/POLICE/i.test(name)) return "municipal_police_authority";
  if (/PROSECUTOR/i.test(name)) return "prosecutor_authority";
  if (/ATTORNEY/i.test(name)) return "county_attorney_authority";
  if (/COURT/i.test(name)) return "court_authority";
  if (/HIDTA|TASK FORCE/i.test(name)) return "task_force_authority";
  if (/PUBLIC SAFETY|DPS/i.test(name)) return "public_safety_authority";
  return "justice_public_safety_authority";
}

function tierFor(name, city) {
  if (
    /PHOENIX POLICE|CHICAGO POLICE|COLUMBUS POLICE|CHARLOTTE-MECKLENBURG POLICE|RALEIGH POLICE/i.test(name)
  ) {
    return "TIER_1";
  }

  if (/SHERIFF/i.test(name)) return "TIER_2";
  if (/POLICE/i.test(name)) return "TIER_2";

  return "TIER_3";
}

function isBad(name) {
  return /HOSPITAL|MEDICAL|AIRPORT|AVIATION|TRANSIT|RAILROAD|PARK|TRAINING|ACADEMY|REGISTRAR OF CONTRACTORS|DEPARTMENT OF AGRICULTURE|AUDITOR GENERAL|COMMISSIONERS$/i.test(
    name
  );
}

function isGood(name) {
  if (isBad(name)) return false;

  return /POLICE|SHERIFF|PROSECUTOR|ATTORNEY|COURT|HIDTA|TASK FORCE|PUBLIC SAFETY|DPS|CONSTABLE|MARSHAL/i.test(
    name
  );
}

function parseSource(source) {
  const inPath = path.join(cacheDir, `${source.source_id}.candidates.json`);

  if (!fs.existsSync(inPath)) {
    console.warn(`[BATCH AUTHORITY] Missing candidates file: ${inPath}`);
    return [];
  }

  const input = readJson(inPath);
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];
  const targets = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const agencyName = clean(candidate.agency_name);
    if (!agencyName || !isGood(agencyName)) continue;

    const city = cityFromName(agencyName, source.cities);
    if (!city) continue;

    const key = `${agencyName.toUpperCase()}|${city}|${source.state}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const tier = tierFor(agencyName, city);

    targets.push({
      authority_target_id: `${source.output_id.toUpperCase()}-AUTH-${String(targets.length + 1).padStart(4, "0")}`,
      source_candidate_id: candidate.candidate_id,
      source_id: source.source_id,
      source_name: source.source_id,
      source_url: "",
      agency_name: agencyName,
      authority_type: authorityType(agencyName),
      agency_type: authorityType(agencyName),
      city,
      state: source.state,
      country: "US",
      website: candidate.website || "",
      contact_url: candidate.contact_url || candidate.website || "",
      validated_tier: tier,
      actionability: tier === "TIER_1" ? "prime_target" : "strong_target",
      review_status: "state_batch_authority_review_required",
      live_import_allowed: false,
      required_next_sources: [
        "agency_websites.json",
        "official_agency_sites",
        "local_public_safety_budgets",
        "fbi_doj_press_releases"
      ],
      notes: [
        "Filtered from cached state directory batch candidate file.",
        "Review-only until official contact and signal enrichment are confirmed."
      ]
    });
  }

  console.log(`[BATCH AUTHORITY] ${source.source_id}: ${candidates.length} → ${targets.length}`);
  return targets;
}

function main() {
  console.log("[BATCH AUTHORITY] Starting...");

  const allTargets = SOURCES.flatMap(parseSource);

  const output = {
    source_id: "state_batch_az_il_oh_nc",
    generated_at: new Date().toISOString(),
    states: SOURCES.map((s) => s.state),
    input_sources: SOURCES.map((s) => s.source_id),
    authority_target_count: allTargets.length,
    live_import_allowed: false,
    targets: allTargets
  };

  writeJson(outPath, output);

  console.log("[BATCH AUTHORITY] Total targets:", allTargets.length);
  console.log("[BATCH AUTHORITY] Output:", outPath);
}

main();