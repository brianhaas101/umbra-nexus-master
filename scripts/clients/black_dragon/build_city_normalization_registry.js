const fs = require("fs");
const path = require("path");

const OUT = "public/data/clients/black_dragon/city_normalization_registry.json";

const registry = {
  version: "black_dragon_city_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "City/state normalization must occur before geospatial export.",
  fields_required: ["city", "state"],
  normalization_rules: [
    "trim whitespace",
    "uppercase state code",
    "preserve official city name",
    "match against geocode_cache key CITY|STATE"
  ],
  blocked: [
    "missing city",
    "missing state",
    "unknown coordinate source",
    "pseudo-random coordinates"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[CITY NORMALIZATION] COMPLETE");
