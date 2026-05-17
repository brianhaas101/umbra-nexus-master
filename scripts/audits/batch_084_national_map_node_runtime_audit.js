const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const mapNodes = readJson(
  "public/data/clients/black_dragon/national/map/runtime/national_map_nodes.v1.json"
);

const controls = readJson(
  "public/data/clients/black_dragon/national/map/controls/national_map_layer_controls.v1.json"
);

const nodes = mapNodes.nodes || [];
const layers = controls.layers || [];

const audit = {
  version:
    "umbra_batch_084_national_map_node_runtime_audit_v1",

  generated_at:
    new Date().toISOString(),

  map_integrity: {
    map_nodes:
      mapNodes.totals.map_nodes,

    cities:
      mapNodes.totals.cities,

    ecosystems:
      mapNodes.totals.ecosystems,

    all_have_node_ids:
      nodes.every(n => !!n.node_id),

    all_have_entity_ids:
      nodes.every(n => !!n.entity_id),

    all_have_coordinates:
      nodes.every(n =>
        typeof n.lat === "number" &&
        typeof n.lon === "number"
      ),

    all_have_anchor_coordinates:
      nodes.every(n =>
        typeof n.anchor_lat === "number" &&
        typeof n.anchor_lon === "number"
      ),

    all_have_city_level_precision:
      nodes.every(n =>
        n.coordinate_precision === "CITY_LEVEL_DETERMINISTIC_OFFSET"
      ),

    all_have_render_payload:
      nodes.every(n =>
        n.render &&
        n.render.visible_in_world === true &&
        n.render.visible_in_city_map === true &&
        n.render.pickable === true
      )
  },

  ecosystem_integrity: {
    has_education:
      nodes.some(n => n.ecosystem === "EDUCATION"),

    has_veteran:
      nodes.some(n => n.ecosystem === "VETERAN"),

    has_motor_units:
      nodes.some(n => n.ecosystem === "LAW_ENFORCEMENT_MOTOR"),

    has_distribution:
      nodes.some(n => n.ecosystem === "DISTRIBUTION"),

    has_events:
      nodes.some(n => n.ecosystem === "EVENT_INFRASTRUCTURE")
  },

  layer_integrity: {
    layer_count:
      layers.length,

    has_education_layer:
      layers.some(l => l.layer_id === "NATIONAL_EDUCATION"),

    has_veteran_layer:
      layers.some(l => l.layer_id === "NATIONAL_VETERAN"),

    has_motor_layer:
      layers.some(l => l.layer_id === "NATIONAL_MOTOR_UNITS"),

    has_distribution_layer:
      layers.some(l => l.layer_id === "NATIONAL_DISTRIBUTION"),

    has_event_layer:
      layers.some(l => l.layer_id === "NATIONAL_EVENTS"),

    all_layers_have_counts:
      layers.every(l =>
        typeof l.entity_count === "number" &&
        l.entity_count > 0
      )
  },

  safety_integrity: {
    outreach_allowed_zero:
      mapNodes.totals.outreach_allowed === 0,

    verified_targets_zero:
      mapNodes.totals.verified_targets === 0,

    all_seed_nodes:
      mapNodes.totals.seed_runtime_nodes === mapNodes.totals.map_nodes,

    all_outreach_blocked:
      nodes.every(n => n.outreach_allowed === false),

    all_verified_false:
      nodes.every(n => n.render.verified_target === false),

    all_have_coordinate_warning:
      nodes.every(n => !!n.coordinate_warning)
  }
};

audit.pass =
  audit.map_integrity.map_nodes >= 1000 &&
  audit.map_integrity.cities >= 50 &&
  audit.map_integrity.ecosystems === 5 &&
  audit.map_integrity.all_have_node_ids &&
  audit.map_integrity.all_have_entity_ids &&
  audit.map_integrity.all_have_coordinates &&
  audit.map_integrity.all_have_anchor_coordinates &&
  audit.map_integrity.all_have_city_level_precision &&
  audit.map_integrity.all_have_render_payload &&
  Object.values(audit.ecosystem_integrity).every(Boolean) &&
  audit.layer_integrity.layer_count === 5 &&
  audit.layer_integrity.has_education_layer &&
  audit.layer_integrity.has_veteran_layer &&
  audit.layer_integrity.has_motor_layer &&
  audit.layer_integrity.has_distribution_layer &&
  audit.layer_integrity.has_event_layer &&
  audit.layer_integrity.all_layers_have_counts &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.verified_targets_zero &&
  audit.safety_integrity.all_seed_nodes &&
  audit.safety_integrity.all_outreach_blocked &&
  audit.safety_integrity.all_verified_false &&
  audit.safety_integrity.all_have_coordinate_warning;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/national/map/audit/batch_084_national_map_node_runtime_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
