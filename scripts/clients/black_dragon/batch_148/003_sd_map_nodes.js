const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const baseLat = 32.7157;
const baseLon = -117.1611;

const nodes = runtime.merged_entities.map((entity, index) => ({
  map_node_id:
    `BD_SD_MAP_NODE_${String(entity.city_rank).padStart(5, "0")}`,

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

  lat:
    Number((baseLat + ((index % 5) - 2) * 0.015).toFixed(6)),

  lon:
    Number((baseLon + (Math.floor(index / 5) - 1) * 0.02).toFixed(6)),

  node_type:
    entity.cross_city_duplicate_detected
      ? "CROSS_CITY_OVERLAP_NODE"
      : "SAN_DIEGO_RUNTIME_NODE",

  runtime_visible:
    true,

  contact_ready:
    false,

  automated_outreach_allowed:
    false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/san_diego/map_nodes/san_diego_runtime_map_nodes.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_san_diego_runtime_map_nodes_v1",

  generated_at:
    new Date().toISOString(),

  map_node_count:
    nodes.length,

  map_nodes:
    nodes
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_MAP_NODES_COMPLETE",
  map_node_count: nodes.length,
  output: out
}, null, 2));
