const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const national = readJson(
  "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"
);

const influence = readJson(
  "public/data/clients/black_dragon/influence/runtime/regional_influence_scoring.v1.json"
);

const entities = national.runtime_entities || [];
const distributionEntities = entities.filter(e =>
  e.ecosystem === "DISTRIBUTION" ||
  e.entity_class === "DEALERSHIP_NODE" ||
  e.entity_class === "RETAIL_NODE" ||
  e.entity_class === "DISTRIBUTION_NODE" ||
  e.source_category === "CUSTOM_MOTORCYCLE_SHOP"
);

const regionInfluence = Object.fromEntries(
  (influence.regional_scores || []).map(r => [r.region, r])
);

const cityInfluence = Object.fromEntries(
  (influence.city_scores || []).map(c => [`${c.city}, ${c.region}`, c])
);

function clamp100(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function tier(score) {
  if (score >= 85) return "NATIONAL_DISTRIBUTION_PRIORITY";
  if (score >= 72) return "HIGH_DISTRIBUTION_DENSITY";
  if (score >= 58) return "REGIONAL_DISTRIBUTION_DENSITY";
  return "DISTRIBUTION_WATCHLIST";
}

const regions = {};
const cities = {};

for (const entity of distributionEntities) {
  const rKey = entity.region;
  const cKey = `${entity.city}, ${entity.region}`;

  if (!regions[rKey]) {
    regions[rKey] = {
      region: entity.region,
      country: "USA",
      distribution_entities: 0,
      dealerships: 0,
      retail_nodes: 0,
      shops: 0,
      source_categories: new Set(),
      cities: new Set(),
      priority_scores: []
    };
  }

  if (!cities[cKey]) {
    cities[cKey] = {
      city: entity.city,
      region: entity.region,
      country: "USA",
      lat: entity.lat,
      lon: entity.lon,
      distribution_entities: 0,
      dealerships: 0,
      retail_nodes: 0,
      shops: 0,
      source_categories: new Set(),
      priority_scores: []
    };
  }

  for (const bucket of [regions[rKey], cities[cKey]]) {
    bucket.distribution_entities++;
    bucket.source_categories.add(entity.source_category);
    bucket.priority_scores.push(Number(entity.national_priority_score || 0));

    if (entity.entity_class === "DEALERSHIP_NODE") bucket.dealerships++;
    if (entity.entity_class === "RETAIL_NODE" || entity.entity_class === "DISTRIBUTION_NODE") bucket.retail_nodes++;
    if (entity.source_category === "CUSTOM_MOTORCYCLE_SHOP") bucket.shops++;
  }

  regions[rKey].cities.add(entity.city);
}

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const regionalDensity = Object.values(regions).map(r => {
  const influenceScore = Number(regionInfluence[r.region]?.influence_score || 0);
  const categoryCoverage = Math.min(1, r.source_categories.size / 4);
  const cityCoverage = Math.min(1, r.cities.size / 6);
  const densityBase = Math.min(100, r.distribution_entities * 5);
  const priorityAvg = avg(r.priority_scores);

  const score = clamp100(
    densityBase * 0.28 +
    influenceScore * 0.28 +
    priorityAvg * 0.20 +
    categoryCoverage * 100 * 0.14 +
    cityCoverage * 100 * 0.10
  );

  return {
    region: r.region,
    country: r.country,
    city_count: r.cities.size,
    distribution_entities: r.distribution_entities,
    dealerships: r.dealerships,
    retail_nodes: r.retail_nodes,
    shops: r.shops,
    source_category_count: r.source_categories.size,
    avg_priority_score: Number(priorityAvg.toFixed(2)),
    regional_influence_score: influenceScore,
    distribution_density_score: score,
    distribution_density_tier: tier(score),
    outreach_allowed: false,
    next_action: "VERIFY_DISTRIBUTION_SOURCES_BEFORE_OUTREACH"
  };
}).sort((a, b) => b.distribution_density_score - a.distribution_density_score);

const cityDensity = Object.values(cities).map(c => {
  const influenceScore = Number(cityInfluence[`${c.city}, ${c.region}`]?.influence_score || 0);
  const categoryCoverage = Math.min(1, c.source_categories.size / 4);
  const densityBase = Math.min(100, c.distribution_entities * 14);
  const priorityAvg = avg(c.priority_scores);

  const score = clamp100(
    densityBase * 0.32 +
    influenceScore * 0.30 +
    priorityAvg * 0.22 +
    categoryCoverage * 100 * 0.16
  );

  return {
    city: c.city,
    region: c.region,
    country: c.country,
    lat: c.lat,
    lon: c.lon,
    distribution_entities: c.distribution_entities,
    dealerships: c.dealerships,
    retail_nodes: c.retail_nodes,
    shops: c.shops,
    source_category_count: c.source_categories.size,
    avg_priority_score: Number(priorityAvg.toFixed(2)),
    city_influence_score: influenceScore,
    distribution_density_score: score,
    distribution_density_tier: tier(score),
    outreach_allowed: false,
    next_action: "VERIFY_CITY_DISTRIBUTION_SOURCES_BEFORE_OUTREACH"
  };
}).sort((a, b) => b.distribution_density_score - a.distribution_density_score);

const payload = {
  version: "black_dragon_distribution_density_mapping_v1_batch_080",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  module: "distribution_density_mapping_v1",

  totals: {
    distribution_entities: distributionEntities.length,
    regions: regionalDensity.length,
    cities: cityDensity.length,
    outreach_allowed: 0
  },

  top_distribution_regions: regionalDensity.slice(0, 15),
  top_distribution_cities: cityDensity.slice(0, 20),
  regional_distribution_density: regionalDensity,
  city_distribution_density: cityDensity
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/distribution_density/runtime/distribution_density_mapping.v1.json"),
  JSON.stringify(payload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/distribution_density/regions/regional_distribution_density_index.v1.json"),
  JSON.stringify({
    version: "black_dragon_regional_distribution_density_index_v1_batch_080",
    generated_at: new Date().toISOString(),
    totals: payload.totals,
    regions: regionalDensity
  }, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/distribution_density/cities/city_distribution_density_index.v1.json"),
  JSON.stringify({
    version: "black_dragon_city_distribution_density_index_v1_batch_080",
    generated_at: new Date().toISOString(),
    totals: payload.totals,
    cities: cityDensity
  }, null, 2)
);

console.log(JSON.stringify({
  status: "DISTRIBUTION_DENSITY_MAPPING_COMPLETE",
  totals: payload.totals,
  top_regions: payload.top_distribution_regions.slice(0, 5).map(r => ({
    region: r.region,
    score: r.distribution_density_score,
    tier: r.distribution_density_tier
  })),
  top_cities: payload.top_distribution_cities.slice(0, 5).map(c => ({
    city: c.city,
    region: c.region,
    score: c.distribution_density_score,
    tier: c.distribution_density_tier
  }))
}, null, 2));
