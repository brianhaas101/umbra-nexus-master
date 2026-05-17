const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const nodes = runtime.merged_entities.map(entity => ({
  graph_node_id:
    `BD_LB_GRAPH_NODE_${String(entity.city_rank).padStart(5, "0")}`,

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

  source_layer_count:
    entity.source_layer_count,

  source_layers:
    entity.source_layers,

  organization_types:
    entity.organization_types,

  contact_ready:
    entity.contact_ready,

  graph_node_type:
    entity.source_layers.includes("EVENT_MEDIA")
      ? "EVENT_MEDIA_NODE"
      : entity.source_layers.includes("ONLINE_DISTRIBUTION")
        ? "DIGITAL_PROPAGATION_NODE"
        : entity.source_layers.includes("RETAIL_PHYSICAL_CHANNEL")
          ? "RETAIL_PLACEMENT_NODE"
          : entity.source_layers.includes("CLUB_ASSOCIATION")
            ? "COMMUNITY_ASSOCIATION_NODE"
            : entity.source_layers.includes("CULTURE_PROPAGATION")
              ? "CULTURE_PROPAGATION_NODE"
              : "GENERAL_RUNTIME_NODE",

  runtime_visible:
    true,

  graph_visible:
    true
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/nodes/long_beach_graph_nodes.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_graph_nodes_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_nodes: nodes.length,
  nodes
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LONG_BEACH_GRAPH_NODES_COMPLETE",
  total_nodes: nodes.length,
  output: out
}, null, 2));
