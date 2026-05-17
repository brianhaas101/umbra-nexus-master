const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const scoring = readJson(
  "public/data/clients/black_dragon/influence/runtime/regional_influence_scoring.v1.json"
);

const regionIndex = readJson(
  "public/data/clients/black_dragon/influence/regions/regional_influence_index.v1.json"
);

const cityIndex = readJson(
  "public/data/clients/black_dragon/influence/cities/city_influence_index.v1.json"
);

const regions = regionIndex.regions || [];
const cities = cityIndex.cities || [];

const audit = {
  version: "umbra_batch_079_regional_influence_scoring_audit_v1",
  generated_at: new Date().toISOString(),

  scoring_integrity: {
    regions: scoring.totals.regions,
    cities: scoring.totals.cities,
    entities: scoring.totals.entities,
    graph_edges: scoring.totals.graph_edges,
    has_top_regions: Array.isArray(scoring.top_regions) && scoring.top_regions.length > 0,
    has_top_cities: Array.isArray(scoring.top_cities) && scoring.top_cities.length > 0
  },

  region_integrity: {
    regions_present: regions.length > 0,
    all_have_scores: regions.every(r => typeof r.influence_score === "number"),
    all_have_tiers: regions.every(r => !!r.influence_tier),
    all_have_ecosystems: regions.every(r => r.ecosystem_count > 0),
    all_outreach_blocked: regions.every(r => r.outreach_allowed === false)
  },

  city_integrity: {
    cities_present: cities.length >= 50,
    all_have_scores: cities.every(c => typeof c.influence_score === "number"),
    all_have_tiers: cities.every(c => !!c.influence_tier),
    all_have_coordinates: cities.every(c => typeof c.lat === "number" && typeof c.lon === "number"),
    all_outreach_blocked: cities.every(c => c.outreach_allowed === false)
  },

  safety_integrity: {
    outreach_allowed_zero: scoring.totals.outreach_allowed === 0,
    all_regions_blocked: regions.every(r => r.next_action.includes("VERIFY")),
    all_cities_blocked: cities.every(c => c.next_action.includes("VERIFY"))
  }
};

audit.pass =
  audit.scoring_integrity.regions > 0 &&
  audit.scoring_integrity.cities >= 50 &&
  audit.scoring_integrity.entities >= 1000 &&
  audit.scoring_integrity.graph_edges > 10000 &&
  audit.scoring_integrity.has_top_regions &&
  audit.scoring_integrity.has_top_cities &&
  audit.region_integrity.regions_present &&
  audit.region_integrity.all_have_scores &&
  audit.region_integrity.all_have_tiers &&
  audit.region_integrity.all_have_ecosystems &&
  audit.region_integrity.all_outreach_blocked &&
  audit.city_integrity.cities_present &&
  audit.city_integrity.all_have_scores &&
  audit.city_integrity.all_have_tiers &&
  audit.city_integrity.all_have_coordinates &&
  audit.city_integrity.all_outreach_blocked &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.all_regions_blocked &&
  audit.safety_integrity.all_cities_blocked;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/influence/audit/batch_079_regional_influence_scoring_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
