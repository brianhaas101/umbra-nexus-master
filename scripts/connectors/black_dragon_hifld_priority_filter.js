// scripts/connectors/black_dragon_hifld_priority_filter.js
// Filters HIFLD candidate entities into Black Dragon priority review sets.
// Does NOT write to leads_master.json.

const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "hifld_local_law_enforcement_locations";

const inputPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.candidates.json`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/${SOURCE_ID}.priority_review.json`
);

const PRIORITY_STATES = new Set([
  "AZ",
  "CA",
  "TX",
  "OR",
  "WA",
  "NM",
  "NV",
  "FL",
  "GA",
  "NC"
]);

const PRIORITY_CITIES = new Set([
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

const PRIORITY_COUNTIES = new Set([
  "MARICOPA",
  "LOS ANGELES",
  "HARRIS",
  "DALLAS",
  "MULTNOMAH",
  "LANE",
  "KING",
  "BERNALILLO",
  "CLARK",
  "MIAMI-DADE",
  "FULTON",
  "MECKLENBURG"
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

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getAgencySize(candidate) {
  const props = candidate.raw_properties || {};
  const sworn =
    number(props.FTSWORN) +
    number(props.PTSWORN);

  const civilian =
    number(props.FTCIV) +
    number(props.PTCIV);

  const total = sworn + civilian;

  return total > 0 ? total : number(props.POPULATION);
}

function hasWebsite(candidate) {
  return Boolean(clean(candidate.raw_properties?.WEBSITE));
}

function hasPhone(candidate) {
  return Boolean(clean(candidate.raw_properties?.TELEPHONE));
}

function priorityScore(candidate) {
  const props = candidate.raw_properties || {};
  const name = upper(candidate.agency_name);
  const city = upper(candidate.city);
  const county = upper(props.COUNTY);
  const state = upper(candidate.state);
  const type = upper(props.TYPE);
  const subtype1 = upper(props.SUBTYPE1);
  const subtype2 = upper(props.SUBTYPE2);
  const agencySize = getAgencySize(candidate);

  let score = 0;
  const reasons = [];

  if (PRIORITY_STATES.has(state)) {
    score += 10;
    reasons.push("priority_state");
  }

  if (PRIORITY_CITIES.has(city)) {
    score += 15;
    reasons.push("priority_city");
  }

  if (PRIORITY_COUNTIES.has(county)) {
    score += 12;
    reasons.push("priority_county");
  }

  if (name.includes("POLICE")) {
    score += 8;
    reasons.push("police_department");
  }

  if (name.includes("SHERIFF")) {
    score += 8;
    reasons.push("sheriff_office");
  }

  if (name.includes("PUBLIC SAFETY")) {
    score += 5;
    reasons.push("public_safety");
  }

  if (type.includes("LOCAL") || type.includes("LAW")) {
    score += 4;
    reasons.push("law_enforcement_type");
  }

  if (subtype1.includes("POLICE") || subtype2.includes("POLICE")) {
    score += 4;
    reasons.push("police_subtype");
  }

  if (subtype1.includes("SHERIFF") || subtype2.includes("SHERIFF")) {
    score += 4;
    reasons.push("sheriff_subtype");
  }

  if (agencySize >= 1000) {
    score += 10;
    reasons.push("large_agency_1000_plus");
  } else if (agencySize >= 300) {
    score += 7;
    reasons.push("large_agency_300_plus");
  } else if (agencySize >= 100) {
    score += 4;
    reasons.push("mid_size_agency_100_plus");
  }

  if (hasWebsite(candidate)) {
    score += 6;
    reasons.push("website_available");
  }

  if (hasPhone(candidate)) {
    score += 3;
    reasons.push("phone_available");
  }

  return { score, reasons, agencySize };
}

function toReviewRecord(candidate) {
  const ranked = priorityScore(candidate);
  const props = candidate.raw_properties || {};

  return {
    ...candidate,
    priority_score: ranked.score,
    priority_reasons: ranked.reasons,
    agency_size_estimate: ranked.agencySize,
    website: clean(props.WEBSITE),
    phone: clean(props.TELEPHONE),
    county: clean(props.COUNTY),
    source_date: clean(props.SOURCEDATE),
    review_status: "priority_review_required",
    import_recommendation:
      ranked.score >= 45
        ? "strong_candidate"
        : ranked.score >= 30
          ? "review_candidate"
          : "hold"
  };
}

function main() {
  console.log("[HIFLD PRIORITY] Starting...");

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing HIFLD candidates: ${inputPath}`);
  }

  const input = readJson(inputPath);
  const candidates = Array.isArray(input.candidates) ? input.candidates : [];

  const reviewed = candidates
    .map(toReviewRecord)
    .filter((candidate) => candidate.priority_score >= 25)
    .sort((a, b) => b.priority_score - a.priority_score);

  const output = {
    source_id: SOURCE_ID,
    generated_at: new Date().toISOString(),
    input_candidate_count: candidates.length,
    priority_review_count: reviewed.length,
    strong_candidate_count: reviewed.filter((c) => c.import_recommendation === "strong_candidate").length,
    review_candidate_count: reviewed.filter((c) => c.import_recommendation === "review_candidate").length,
    hold_count: reviewed.filter((c) => c.import_recommendation === "hold").length,
    criteria: {
      priority_states: Array.from(PRIORITY_STATES),
      priority_cities: Array.from(PRIORITY_CITIES),
      priority_counties: Array.from(PRIORITY_COUNTIES),
      minimum_priority_score: 25
    },
    candidates: reviewed
  };

  writeJson(outPath, output);

  console.log("[HIFLD PRIORITY] Input candidates:", candidates.length);
  console.log("[HIFLD PRIORITY] Priority review:", reviewed.length);
  console.log("[HIFLD PRIORITY] Strong candidates:", output.strong_candidate_count);
  console.log("[HIFLD PRIORITY] Output:", outPath);
}

main();