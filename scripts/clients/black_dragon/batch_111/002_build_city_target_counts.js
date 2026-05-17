const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const baselinePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_expansion_baseline.json"
);

const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

const map = new Map();

for (const row of baseline.seeds) {
  const city = row.expansion_city || "UNSPECIFIED_CITY";
  const state = row.expansion_state || "UNSPECIFIED_STATE";
  const key = `${city}__${state}`;

  if (!map.has(key)) {
    map.set(key, {
      city,
      state,
      country: "USA",
      clean_seed_count: 0,
      verified_runtime_targets: 0,
      target_goal: 20,
      expansion_gap: 20,
      expansion_status: "UNASSESSED"
    });
  }

  map.get(key).clean_seed_count += 1;
}

const cities = Array.from(map.values()).map(city => ({
  ...city,
  expansion_gap: Math.max(0, city.target_goal - city.clean_seed_count),
  expansion_status:
    city.clean_seed_count >= city.target_goal
      ? "HAS_20_PLUS_CLEAN_SEEDS"
      : "NEEDS_EXPANSION"
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/planning/city_target_counts.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_city_target_counts_v1",
  generated_at: new Date().toISOString(),
  target_goal_per_city: 20,
  total_cities: cities.length,
  cities
}, null, 2));

console.log(JSON.stringify({
  status: "CITY_TARGET_COUNTS_COMPLETE",
  total_cities: cities.length,
  cities_at_or_above_goal: cities.filter(c => c.clean_seed_count >= 20).length,
  cities_needing_expansion: cities.filter(c => c.clean_seed_count < 20).length,
  output: out
}, null, 2));
