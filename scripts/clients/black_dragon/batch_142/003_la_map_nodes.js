const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const baseLat = 34.0522;
const baseLon = -118.2437;

const mapNodes = runtime.merged_entities.map((entity, index) => ({
  map_node_id:
    `BD_LA_MAP_NODE_${String(entity.city_rank).padStart(5, "0")}`,

  city_runtime_entity_id:
    entity.city_runtime_entity_id,

  organization_name:
    entity.organization_name,

  city_rank:
    entity.city_rank,

  priority_tier:
    entity.priority_tier,

  best_score:
    entity.best_score,

  city:
    "Los Angeles",

  state:
    "CA",

  lat:
    Number((baseLat + ((index % 5) - 2) * 0.012).toFixed(6)),

  lon:
    Number((baseLon + (Math.floor(index / 5) - 1) * 0.016).toFixed(6)),

  node_type:
    entity.cross_city_duplicate_detected
      ? "CROSS_CITY_OVERLAP_NODE"
      : "LA_RUNTIME_ENTITY_NODE",

  node_visible:
    true,

  contact_ready:
    false,

  automated_outreach_allowed:
    false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/map_nodes/los_angeles_runtime_map_nodes.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_los_angeles_runtime_map_nodes_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Los Angeles",

  state:
    "CA",

  map_node_count:
    mapNodes.length,

  map_nodes:
    mapNodes
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_MAP_NODES_COMPLETE",
  map_node_count: mapNodes.length,
  output: out
}, null, 2));
