const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const runtime =
  readJson(
    "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"
  );

const entities =
  runtime.runtime_entities || [];

const ecosystems = [
  "EDUCATION",
  "VETERAN",
  "LAW_ENFORCEMENT_MOTOR",
  "DISTRIBUTION",
  "EVENT_INFRASTRUCTURE"
];

const regionalWeights = {
  "CA": 1.00,
  "TX": 0.98,
  "FL": 0.97,
  "AZ": 0.91,
  "NV": 0.88,
  "TN": 0.93,
  "NY": 0.99,
  "IL": 0.95,
  "OH": 0.90,
  "GA": 0.94,
  "NC": 0.89,
  "WA": 0.88,
  "CO": 0.87
};

const graphEdges = [];
const graphIndex = {};
const propagationChains = [];

for (const entity of entities) {

  if (!graphIndex[entity.entity_id]) {
    graphIndex[entity.entity_id] = {
      outgoing_edges: [],
      incoming_edges: [],
      ecosystems: [],
      regions: [],
      propagation_score: 0
    };
  }

  graphIndex[entity.entity_id].ecosystems.push(entity.ecosystem);
  graphIndex[entity.entity_id].regions.push(entity.region);
}

for (let i = 0; i < entities.length; i++) {

  const a = entities[i];

  for (let j = i + 1; j < entities.length; j++) {

    const b = entities[j];

    const sameCity =
      a.city === b.city &&
      a.region === b.region;

    const sameRegion =
      a.region === b.region;

    const ecosystemOverlap =
      a.ecosystem !== b.ecosystem;

    if (!sameCity && !sameRegion) continue;
    if (!ecosystemOverlap) continue;

    let strength = 0;

    if (sameCity) strength += 0.55;
    if (sameRegion) strength += 0.25;

    strength += (
      (a.base_priority_weight || 0.5) +
      (b.base_priority_weight || 0.5)
    ) / 2;

    const regionalBoost =
      regionalWeights[a.region] || 0.82;

    strength =
      Math.min(
        1,
        Number((strength * regionalBoost).toFixed(4))
      );

    const edgeId =
      `BD_GRAPH_EDGE_${String(graphEdges.length + 1).padStart(7, "0")}`;

    const edge = {
      edge_id: edgeId,

      source_entity_id:
        a.entity_id,

      target_entity_id:
        b.entity_id,

      source_ecosystem:
        a.ecosystem,

      target_ecosystem:
        b.ecosystem,

      source_city:
        a.city,

      target_city:
        b.city,

      source_region:
        a.region,

      target_region:
        b.region,

      propagation_strength:
        strength,

      relationship_type:
        sameCity
          ? "INTRA_CITY_PROPAGATION"
          : "REGIONAL_PROPAGATION",

      propagation_path: [
        a.ecosystem,
        b.ecosystem
      ],

      outreach_allowed:
        false,

      generated_at:
        new Date().toISOString()
    };

    graphEdges.push(edge);

    graphIndex[a.entity_id].outgoing_edges.push(edgeId);
    graphIndex[b.entity_id].incoming_edges.push(edgeId);

    graphIndex[a.entity_id].propagation_score += strength;
    graphIndex[b.entity_id].propagation_score += strength;

    propagationChains.push({
      chain_id:
        `BD_CHAIN_${String(propagationChains.length + 1).padStart(6, "0")}`,

      ecosystems: [
        a.ecosystem,
        b.ecosystem
      ],

      cities: [
        a.city,
        b.city
      ],

      regions: [
        a.region,
        b.region
      ],

      strength
    });
  }
}

const runtimePayload = {
  version:
    "black_dragon_national_propagation_graph_runtime_v1_batch_078",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "national_propagation_graph_v1",

  totals: {
    entities:
      entities.length,

    ecosystems:
      ecosystems.length,

    graph_edges:
      graphEdges.length,

    propagation_chains:
      propagationChains.length,

    outreach_allowed:
      0
  },

  graph_runtime: {
    propagation_enabled: true,
    regional_weighting_enabled: true,
    cross_ecosystem_overlap_enabled: true,
    city_density_enabled: true,
    chain_scoring_enabled: true,

    blocked_features: [
      "auto_outreach",
      "auto_contact_generation",
      "auto_response_generation"
    ]
  },

  graph_edges:
    graphEdges
};

const graphIndexPayload = {
  version:
    "black_dragon_graph_index_v1_batch_078",

  generated_at:
    new Date().toISOString(),

  totals: {
    indexed_entities:
      Object.keys(graphIndex).length
  },

  graph_index:
    graphIndex
};

const chainPayload = {
  version:
    "black_dragon_propagation_chain_index_v1_batch_078",

  generated_at:
    new Date().toISOString(),

  totals: {
    propagation_chains:
      propagationChains.length
  },

  propagation_chains:
    propagationChains
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/graph/runtime/national_propagation_graph_runtime.v1.json"
  ),
  JSON.stringify(runtimePayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/graph/indexes/graph_index.v1.json"
  ),
  JSON.stringify(graphIndexPayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/graph/indexes/propagation_chain_index.v1.json"
  ),
  JSON.stringify(chainPayload, null, 2)
);

console.log(JSON.stringify({
  status:
    "NATIONAL_PROPAGATION_GRAPH_RUNTIME_COMPLETE",

  totals:
    runtimePayload.totals
}, null, 2));
