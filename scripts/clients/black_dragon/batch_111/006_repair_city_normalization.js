const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const baselinePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_expansion_baseline.json"
);

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

const KNOWN_CITIES = [
  "ALBUQUERQUE","ARLINGTON","ATLANTA","AUSTIN","BAKERSFIELD","BALTIMORE",
  "BOSTON","CHARLOTTE","CHICAGO","CLEVELAND","COLORADO SPRINGS","COLUMBUS",
  "DALLAS","DENVER","DETROIT","EL PASO","FORT WORTH","FRESNO","HOUSTON",
  "INDIANAPOLIS","JACKSONVILLE","KANSAS CITY","LAS VEGAS","LONG BEACH",
  "LOS ANGELES","LOUISVILLE","MEMPHIS","MESA","MIAMI","MILWAUKEE",
  "MINNEAPOLIS","NASHVILLE","NEW ORLEANS","NEW YORK","OAKLAND",
  "OKLAHOMA CITY","OMAHA","PHILADELPHIA","PHOENIX","PORTLAND","RALEIGH",
  "SACRAMENTO","SAN ANTONIO","SAN DIEGO","SAN FRANCISCO","SAN JOSE",
  "SEATTLE","TAMPA","TUCSON","TULSA","VIRGINIA BEACH","WASHINGTON",
  "WICHITA","TALLAHASSEE","SALEM"
];

function titleCaseCity(v) {
  return String(v || "")
    .toLowerCase()
    .split(" ")
    .map(w => w ? w[0].toUpperCase() + w.slice(1) : w)
    .join(" ")
    .replace(/\bDc\b/g, "DC");
}

function extractCity(name, state) {
  const upper = String(name || "").toUpperCase();

  for (const city of KNOWN_CITIES.sort((a,b) => b.length - a.length)) {
    if (upper === city || upper.startsWith(city + " ") || upper.includes(city + " ")) {
      return titleCaseCity(city);
    }
  }

  return null;
}

const repaired = baseline.seeds.map(row => {
  const city = extractCity(
    row.organization_or_city_name,
    row.state
  );

  const state =
    row.state && row.state !== "National"
      ? row.state
      : row.expansion_state && row.expansion_state !== "National"
        ? row.expansion_state
        : "UNSPECIFIED_STATE";

  return {
    ...row,
    normalized_city:
      city || row.expansion_city || row.organization_or_city_name,

    normalized_state:
      state,

    city_normalization_status:
      city ? "CITY_EXTRACTED" : "CITY_UNRESOLVED_REVIEW_REQUIRED"
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_normalized_expansion_baseline.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_city_normalized_expansion_baseline_v1",
  generated_at: new Date().toISOString(),
  total_seed_records: repaired.length,
  city_extracted: repaired.filter(r => r.city_normalization_status === "CITY_EXTRACTED").length,
  unresolved: repaired.filter(r => r.city_normalization_status !== "CITY_EXTRACTED").length,
  seeds: repaired
}, null, 2));

console.log(JSON.stringify({
  status: "CITY_NORMALIZATION_REPAIR_COMPLETE",
  total_seed_records: repaired.length,
  city_extracted: repaired.filter(r => r.city_normalization_status === "CITY_EXTRACTED").length,
  unresolved: repaired.filter(r => r.city_normalization_status !== "CITY_EXTRACTED").length,
  output: out
}, null, 2));
