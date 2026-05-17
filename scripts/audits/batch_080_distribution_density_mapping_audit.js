const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const mapping = readJson(
  "public/data/clients/black_dragon/distribution_density/runtime/distribution_density_mapping.v1.json"
);

const regions = readJson(
  "public/data/clients/black_dragon/distribution_density/regions/regional_distribution_density_index.v1.json"
).regions || [];

const cities = readJson(
  "public/data/clients/black_dragon/distribution_density/cities/city_distribution_density_index.v1.json"
).cities || [];

const audit = {
  version: "umbra_batch_080_distribution_density_mapping_audit_v1",
  generated_at: new Date().toISOString(),

  mapping_integrity: {
    distribution_entities: mapping.totals.distribution_entities,
    regions: mapping.totals.regions,
    cities: mapping.totals.cities,
    has_top_regions: Array.isArray(mapping.top_distribution_regions) && mapping.top_distribution_regions.length > 0,
    has_top_cities: Array.isArray(mapping.top_distribution_cities) && mapping.top_distribution_cities.length > 0
  },

  region_integrity: {
    regions_present: regions.length > 0,
    all_have_scores: regions.every(r => typeof r.distribution_density_score === "number"),
    all_have_tiers: regions.every(r => !!r.distribution_density_tier),
    all_have_distribution_entities: regions.every(r => r.distribution_entities > 0),
    all_outreach_blocked: regions.every(r => r.outreach_allowed === false)
  },

  city_integrity: {
    cities_present: cities.length >= 50,
    all_have_scores: cities.every(c => typeof c.distribution_density_score === "number"),
    all_have_tiers: cities.every(c => !!c.distribution_density_tier),
    all_have_coordinates: cities.every(c => typeof c.lat === "number" && typeof c.lon === "number"),
    all_outreach_blocked: cities.every(c => c.outreach_allowed === false)
  },

  safety_integrity: {
    outreach_allowed_zero: mapping.totals.outreach_allowed === 0,
    all_regions_verify_first: regions.every(r => r.next_action.includes("VERIFY")),
    all_cities_verify_first: cities.every(c => c.next_action.includes("VERIFY"))
  }
};

audit.pass =
  audit.mapping_integrity.distribution_entities >= 200 &&
  audit.mapping_integrity.regions > 0 &&
  audit.mapping_integrity.cities >= 50 &&
  audit.mapping_integrity.has_top_regions &&
  audit.mapping_integrity.has_top_cities &&
  audit.region_integrity.regions_present &&
  audit.region_integrity.all_have_scores &&
  audit.region_integrity.all_have_tiers &&
  audit.region_integrity.all_have_distribution_entities &&
  audit.region_integrity.all_outreach_blocked &&
  audit.city_integrity.cities_present &&
  audit.city_integrity.all_have_scores &&
  audit.city_integrity.all_have_tiers &&
  audit.city_integrity.all_have_coordinates &&
  audit.city_integrity.all_outreach_blocked &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.all_regions_verify_first &&
  audit.safety_integrity.all_cities_verify_first;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/distribution_density/audit/batch_080_distribution_density_mapping_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
