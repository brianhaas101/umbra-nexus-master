const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const cleanPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/placeholder_purge/exports/clean_black_dragon_expansion_seed.json"
);

const clean = JSON.parse(fs.readFileSync(cleanPath, "utf8"));

function extractCityState(name, state) {
  const value = String(name || "").trim();
  const directState = String(state || "").trim();

  const dashMatch = value.match(/—\s*([^,]+),\s*([A-Z]{2})\s*$/);
  if (dashMatch) {
    return {
      city: dashMatch[1].trim(),
      state: dashMatch[2].trim()
    };
  }

  const commaMatch = value.match(/^([^,]+),\s*([A-Z]{2})$/);
  if (commaMatch) {
    return {
      city: commaMatch[1].trim(),
      state: commaMatch[2].trim()
    };
  }

  if (directState && directState !== "National") {
    return {
      city: value,
      state: directState
    };
  }

  return {
    city: value,
    state: directState || "UNSPECIFIED_STATE"
  };
}

const normalized = clean.clean_expansion_seeds.map(row => {
  const loc = extractCityState(row.organization_or_city_name, row.state);

  return {
    ...row,
    expansion_city: loc.city,
    expansion_state: loc.state,
    expansion_country: "USA",
    expansion_visibility: "PLANNING_ONLY",
    verified_for_runtime: false
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_expansion_baseline.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_city_expansion_baseline_v1",
  generated_at: new Date().toISOString(),
  total_seed_records: normalized.length,
  seeds: normalized
}, null, 2));

console.log(JSON.stringify({
  status: "CITY_EXPANSION_BASELINE_COMPLETE",
  total_seed_records: normalized.length,
  output: out
}, null, 2));
