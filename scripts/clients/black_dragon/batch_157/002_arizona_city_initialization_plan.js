const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const cities = [
  {
    city: "Phoenix",
    runtime_priority: 1,
    target_density: "HIGH",
    ecosystem_focus: [
      "dealerships",
      "events",
      "veteran networks",
      "media",
      "riding communities"
    ]
  },
  {
    city: "Scottsdale",
    runtime_priority: 2,
    target_density: "HIGH",
    ecosystem_focus: [
      "luxury motorcycle culture",
      "events",
      "brand overlap",
      "regional influence"
    ]
  },
  {
    city: "Mesa",
    runtime_priority: 3,
    target_density: "MEDIUM",
    ecosystem_focus: [
      "community overlap",
      "dealership ecosystems",
      "rider propagation"
    ]
  },
  {
    city: "Tucson",
    runtime_priority: 4,
    target_density: "MEDIUM",
    ecosystem_focus: [
      "southern Arizona expansion",
      "cross-state travel overlap",
      "event propagation"
    ]
  }
];

const plan = {
  version:
    "black_dragon_arizona_city_initialization_plan_v1",

  generated_at:
    new Date().toISOString(),

  total_cities:
    cities.length,

  initialization_order:
    cities,

  expansion_rules: {
    city_must_complete_runtime_before_federation: true,
    city_requires_live_validation_before_production: true,
    city_requires_overlap_review_before_regional_boost: true,
    all_cities_inherit_hardlocks: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/cities/arizona_city_initialization_plan.json"
);

fs.writeFileSync(out, JSON.stringify(plan, null, 2), "utf8");

console.log(JSON.stringify({
  status: "ARIZONA_CITY_INITIALIZATION_PLAN_COMPLETE",
  total_cities: plan.total_cities,
  output: out
}, null, 2));
