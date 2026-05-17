const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const normalizedPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_normalized_expansion_baseline.json"
);

const normalized = JSON.parse(fs.readFileSync(normalizedPath, "utf8"));

const map = new Map();

for (const row of normalized.seeds) {
  if (row.city_normalization_status !== "CITY_EXTRACTED") continue;

  const city = row.normalized_city;
  const state = row.normalized_state || "UNSPECIFIED_STATE";
  const key = `${city}__${state}`;

  if (!map.has(key)) {
    map.set(key, {
      city,
      state,
      country: "USA",
      clean_seed_count: 0,
      organization_names: [],
      target_goal: 20
    });
  }

  const bucket = map.get(key);
  bucket.clean_seed_count += 1;
  bucket.organization_names.push(row.organization_or_city_name);
}

const cities = Array.from(map.values()).map(city => ({
  ...city,
  expansion_gap: Math.max(0, city.target_goal - city.clean_seed_count),
  expansion_status:
    city.clean_seed_count >= city.target_goal
      ? "HAS_20_PLUS_CLEAN_SEEDS"
      : "NEEDS_EXPANSION"
})).sort((a,b) => {
  if (a.state !== b.state) return a.state.localeCompare(b.state);
  return a.city.localeCompare(b.city);
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/normalized_city_target_counts.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_normalized_city_target_counts_v1",
  generated_at: new Date().toISOString(),
  target_goal_per_city: 20,
  total_cities: cities.length,
  cities
}, null, 2));

console.log(JSON.stringify({
  status: "NORMALIZED_CITY_TARGET_COUNTS_COMPLETE",
  total_cities: cities.length,
  cities_at_or_above_goal: cities.filter(c => c.clean_seed_count >= 20).length,
  cities_needing_expansion: cities.filter(c => c.clean_seed_count < 20).length,
  output: out
}, null, 2));
