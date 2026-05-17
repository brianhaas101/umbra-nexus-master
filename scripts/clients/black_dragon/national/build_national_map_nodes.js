const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const national = readJson(
  "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json"
);

const readiness = readJson(
  "public/data/clients/black_dragon/readiness/runtime/outreach_readiness_synthesis.v1.json"
);

const entities = national.runtime_entities || [];
const readinessById = Object.fromEntries(
  (readiness.synthesized_readiness || []).map(x => [x.entity_id, x])
);

const ecosystemOffset = {
  EDUCATION: [-0.018, 0.018],
  VETERAN: [0.018, 0.018],
  LAW_ENFORCEMENT_MOTOR: [-0.018, -0.018],
  DISTRIBUTION: [0.018, -0.018],
  EVENT_INFRASTRUCTURE: [0.000, 0.026]
};

const ecosystemRender = {
  EDUCATION: {
    node_type: "EDUCATION_NODE",
    layer_id: "NATIONAL_EDUCATION",
    visual_intensity: "INSTITUTIONAL"
  },
  VETERAN: {
    node_type: "VETERAN_NODE",
    layer_id: "NATIONAL_VETERAN",
    visual_intensity: "CULTURAL"
  },
  LAW_ENFORCEMENT_MOTOR: {
    node_type: "MOTOR_UNIT_NODE",
    layer_id: "NATIONAL_MOTOR_UNITS",
    visual_intensity: "PUBLIC_SAFETY"
  },
  DISTRIBUTION: {
    node_type: "DISTRIBUTION_NODE",
    layer_id: "NATIONAL_DISTRIBUTION",
    visual_intensity: "DISTRIBUTION"
  },
  EVENT_INFRASTRUCTURE: {
    node_type: "EVENT_NODE",
    layer_id: "NATIONAL_EVENTS",
    visual_intensity: "PROPAGATION"
  }
};

function hashOffset(id, scale) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  }

  const x = ((Math.abs(h) % 1000) / 1000 - 0.5) * scale;
  const y = ((Math.abs(h >> 7) % 1000) / 1000 - 0.5) * scale;

  return [x, y];
}

const nodes = entities.map((entity, index) => {
  const readinessRecord = readinessById[entity.entity_id] || {};
  const baseOffset = ecosystemOffset[entity.ecosystem] || [0, 0];
  const jitter = hashOffset(entity.entity_id, 0.012);

  const lat = Number((entity.lat + baseOffset[0] + jitter[0]).toFixed(6));
  const lon = Number((entity.lon + baseOffset[1] + jitter[1]).toFixed(6));

  const renderMeta = ecosystemRender[entity.ecosystem] || {
    node_type: "NATIONAL_ECOSYSTEM_NODE",
    layer_id: "NATIONAL_ECOSYSTEM",
    visual_intensity: "REVIEW"
  };

  return {
    node_id:
      `BD_NATIONAL_MAP_NODE_${String(index + 1).padStart(6, "0")}`,

    entity_id:
      entity.entity_id,

    client_id:
      "black_dragon",

    module:
      "national_ecosystem_expansion_v1",

    source:
      "BLACK_DRAGON_NATIONAL_ECOSYSTEM_RUNTIME",

    organization_name:
      entity.organization_name,

    label:
      entity.organization_name,

    city:
      entity.city,

    region:
      entity.region,

    country:
      entity.country,

    lat,
    lon,

    anchor_lat:
      entity.lat,

    anchor_lon:
      entity.lon,

    coordinate_precision:
      "CITY_LEVEL_DETERMINISTIC_OFFSET",

    coordinate_warning:
      "Seed entity is mapped to city-level anchor with deterministic offset. Not verified street-level location.",

    ecosystem:
      entity.ecosystem,

    entity_class:
      entity.entity_class,

    source_category:
      entity.source_category,

    readiness_score:
      readinessRecord.readiness_score || 0,

    readiness_tier:
      readinessRecord.readiness_tier || "HOLD",

    verification_status:
      entity.verification_status,

    contact_status:
      entity.contact_status,

    outreach_allowed:
      false,

    reason_outreach_blocked:
      entity.reason_outreach_blocked,

    render: {
      node_type:
        renderMeta.node_type,

      layer_id:
        renderMeta.layer_id,

      visible_in_world:
        true,

      visible_in_city_map:
        true,

      pickable:
        true,

      pulse_enabled:
        false,

      halo_enabled:
        false,

      verified_target:
        false,

      seed_runtime_node:
        true,

      visual_intensity:
        renderMeta.visual_intensity,

      visual_score:
        readinessRecord.readiness_score || entity.national_priority_score || 0
    },

    forbidden_actions:
      entity.forbidden_actions,

    next_action:
      "VERIFY_PUBLIC_SOURCE_BEFORE_OUTREACH",

    generated_at:
      new Date().toISOString()
  };
});

const layerControls = {
  version:
    "black_dragon_national_map_layer_controls_v1_batch_084",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "national_ecosystem_expansion_v1",

  layers: [
    {
      layer_id: "NATIONAL_EDUCATION",
      label: "Education / Training",
      default_visible: true,
      entity_count: nodes.filter(n => n.ecosystem === "EDUCATION").length
    },
    {
      layer_id: "NATIONAL_VETERAN",
      label: "Veteran Organizations",
      default_visible: true,
      entity_count: nodes.filter(n => n.ecosystem === "VETERAN").length
    },
    {
      layer_id: "NATIONAL_MOTOR_UNITS",
      label: "Law Enforcement Motor Units",
      default_visible: true,
      entity_count: nodes.filter(n => n.ecosystem === "LAW_ENFORCEMENT_MOTOR").length
    },
    {
      layer_id: "NATIONAL_DISTRIBUTION",
      label: "Dealership / Retail Distribution",
      default_visible: true,
      entity_count: nodes.filter(n => n.ecosystem === "DISTRIBUTION").length
    },
    {
      layer_id: "NATIONAL_EVENTS",
      label: "Rally / Event Infrastructure",
      default_visible: true,
      entity_count: nodes.filter(n => n.ecosystem === "EVENT_INFRASTRUCTURE").length
    }
  ]
};

const payload = {
  version:
    "black_dragon_national_map_nodes_v1_batch_084",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "national_ecosystem_expansion_v1",

  totals: {
    map_nodes:
      nodes.length,

    cities:
      new Set(nodes.map(n => `${n.city},${n.region}`)).size,

    ecosystems:
      new Set(nodes.map(n => n.ecosystem)).size,

    outreach_allowed:
      nodes.filter(n => n.outreach_allowed).length,

    verified_targets:
      nodes.filter(n => n.render.verified_target).length,

    seed_runtime_nodes:
      nodes.filter(n => n.render.seed_runtime_node).length
  },

  nodes
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/national/map/runtime/national_map_nodes.v1.json"),
  JSON.stringify(payload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/national/map/controls/national_map_layer_controls.v1.json"),
  JSON.stringify(layerControls, null, 2)
);

console.log(JSON.stringify({
  status: "NATIONAL_MAP_NODE_RUNTIME_CREATED",
  totals: payload.totals,
  layers: layerControls.layers
}, null, 2));
