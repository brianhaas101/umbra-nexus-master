const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const national = readJson(
  "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"
);

const graph = readJson(
  "public/data/clients/black_dragon/graph/runtime/national_propagation_graph_runtime.v1.json"
);

const index = readJson(
  "public/data/clients/black_dragon/graph/indexes/graph_index.v1.json"
);

const entities = national.runtime_entities || [];
const edges = graph.graph_edges || [];
const graphIndex = index.graph_index || {};

const regionBaseWeights = {
  CA: 1.00, TX: 0.99, FL: 0.97, NY: 0.96, GA: 0.94,
  AZ: 0.93, NV: 0.91, TN: 0.92, OH: 0.90, NC: 0.89,
  IL: 0.93, WA: 0.88, CO: 0.87, OR: 0.86
};

function avg(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp100(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

const regions = {};
const cities = {};

for (const entity of entities) {
  const region = entity.region;
  const cityKey = `${entity.city}, ${entity.region}`;

  if (!regions[region]) {
    regions[region] = {
      region,
      country: "USA",
      entity_count: 0,
      cities: new Set(),
      ecosystems: new Set(),
      source_categories: new Set(),
      priority_scores: [],
      propagation_scores: [],
      edge_count: 0
    };
  }

  if (!cities[cityKey]) {
    cities[cityKey] = {
      city: entity.city,
      region: entity.region,
      country: "USA",
      lat: entity.lat,
      lon: entity.lon,
      entity_count: 0,
      ecosystems: new Set(),
      source_categories: new Set(),
      priority_scores: [],
      propagation_scores: [],
      edge_count: 0
    };
  }

  const pScore = Number(entity.national_priority_score || 0);
  const gScore = Number(graphIndex[entity.entity_id]?.propagation_score || 0);

  regions[region].entity_count++;
  regions[region].cities.add(entity.city);
  regions[region].ecosystems.add(entity.ecosystem);
  regions[region].source_categories.add(entity.source_category);
  regions[region].priority_scores.push(pScore);
  regions[region].propagation_scores.push(gScore);

  cities[cityKey].entity_count++;
  cities[cityKey].ecosystems.add(entity.ecosystem);
  cities[cityKey].source_categories.add(entity.source_category);
  cities[cityKey].priority_scores.push(pScore);
  cities[cityKey].propagation_scores.push(gScore);
}

for (const edge of edges) {
  if (regions[edge.source_region]) regions[edge.source_region].edge_count++;
  const cityKey = `${edge.source_city}, ${edge.source_region}`;
  if (cities[cityKey]) cities[cityKey].edge_count++;
}

const regionScores = Object.values(regions).map(r => {
  const ecosystemCoverage = r.ecosystems.size / 5;
  const categoryDensity = Math.min(1, r.source_categories.size / 20);
  const cityDensity = Math.min(1, r.cities.size / 8);
  const priority = avg(r.priority_scores);
  const propagation = Math.min(100, avg(r.propagation_scores) / 2);
  const edgeDensity = Math.min(100, r.edge_count / 20);
  const base = regionBaseWeights[r.region] || 0.82;

  const influence_score = clamp100(
    (
      priority * 0.24 +
      propagation * 0.26 +
      edgeDensity * 0.18 +
      ecosystemCoverage * 100 * 0.16 +
      categoryDensity * 100 * 0.10 +
      cityDensity * 100 * 0.06
    ) * base
  );

  return {
    region: r.region,
    country: r.country,
    city_count: r.cities.size,
    entity_count: r.entity_count,
    ecosystem_count: r.ecosystems.size,
    source_category_count: r.source_categories.size,
    edge_count: r.edge_count,
    avg_priority_score: Number(priority.toFixed(2)),
    avg_propagation_score: Number(avg(r.propagation_scores).toFixed(2)),
    influence_score,
    influence_tier:
      influence_score >= 85 ? "NATIONAL_PRIORITY" :
      influence_score >= 72 ? "HIGH_INFLUENCE" :
      influence_score >= 58 ? "REGIONAL_INFLUENCE" :
      "WATCHLIST",
    outreach_allowed: false,
    next_action: "VERIFY_SOURCES_BEFORE_OUTREACH"
  };
}).sort((a, b) => b.influence_score - a.influence_score);

const cityScores = Object.values(cities).map(c => {
  const ecosystemCoverage = c.ecosystems.size / 5;
  const categoryDensity = Math.min(1, c.source_categories.size / 20);
  const priority = avg(c.priority_scores);
  const propagation = Math.min(100, avg(c.propagation_scores) / 2);
  const edgeDensity = Math.min(100, c.edge_count / 10);

  const influence_score = clamp100(
    priority * 0.25 +
    propagation * 0.27 +
    edgeDensity * 0.18 +
    ecosystemCoverage * 100 * 0.20 +
    categoryDensity * 100 * 0.10
  );

  return {
    city: c.city,
    region: c.region,
    country: c.country,
    lat: c.lat,
    lon: c.lon,
    entity_count: c.entity_count,
    ecosystem_count: c.ecosystems.size,
    source_category_count: c.source_categories.size,
    edge_count: c.edge_count,
    avg_priority_score: Number(priority.toFixed(2)),
    avg_propagation_score: Number(avg(c.propagation_scores).toFixed(2)),
    influence_score,
    influence_tier:
      influence_score >= 85 ? "NATIONAL_CITY_PRIORITY" :
      influence_score >= 72 ? "HIGH_CITY_INFLUENCE" :
      influence_score >= 58 ? "CITY_INFLUENCE" :
      "CITY_WATCHLIST",
    outreach_allowed: false,
    next_action: "VERIFY_CITY_SOURCES_BEFORE_OUTREACH"
  };
}).sort((a, b) => b.influence_score - a.influence_score);

const payload = {
  version: "black_dragon_regional_influence_scoring_v1_batch_079",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  module: "regional_influence_scoring_v1",
  totals: {
    regions: regionScores.length,
    cities: cityScores.length,
    entities: entities.length,
    graph_edges: edges.length,
    outreach_allowed: 0
  },
  top_regions: regionScores.slice(0, 15),
  top_cities: cityScores.slice(0, 20),
  regional_scores: regionScores,
  city_scores: cityScores
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/influence/runtime/regional_influence_scoring.v1.json"),
  JSON.stringify(payload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/influence/regions/regional_influence_index.v1.json"),
  JSON.stringify({
    version: "black_dragon_regional_influence_index_v1_batch_079",
    generated_at: new Date().toISOString(),
    totals: payload.totals,
    regions: regionScores
  }, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/influence/cities/city_influence_index.v1.json"),
  JSON.stringify({
    version: "black_dragon_city_influence_index_v1_batch_079",
    generated_at: new Date().toISOString(),
    totals: payload.totals,
    cities: cityScores
  }, null, 2)
);

console.log(JSON.stringify({
  status: "REGIONAL_INFLUENCE_SCORING_COMPLETE",
  totals: payload.totals,
  top_regions: payload.top_regions.slice(0, 5).map(r => ({
    region: r.region,
    score: r.influence_score,
    tier: r.influence_tier
  })),
  top_cities: payload.top_cities.slice(0, 5).map(c => ({
    city: c.city,
    region: c.region,
    score: c.influence_score,
    tier: c.influence_tier
  }))
}, null, 2));
