const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const nodes = runtime.merged_entities.map(entity => ({
  graph_node_id:
    `BD_SD_GRAPH_NODE_${String(entity.city_rank).padStart(5, "0")}`,

  organization_name:
    entity.organization_name,

  city_runtime_entity_id:
    entity.city_runtime_entity_id,

  graph_node_type:
    entity.organization_type,

  city_rank:
    entity.city_rank,

  best_score:
    entity.best_score,

  cross_city_duplicate_detected:
    entity.cross_city_duplicate_detected,

  graph_visible:
    true
}));

const edges = [];

for (let i = 0; i < nodes.length; i++) {
  for (let j = i + 1; j < nodes.length; j++) {

    const a = nodes[i];
    const b = nodes[j];

    const edgeWeight =
      Number(Math.min(
        1,
        (
          (a.best_score + b.best_score) / 20
        )
      ).toFixed(3));

    if (edgeWeight < 0.82) continue;

    edges.push({
      graph_edge_id:
        `BD_SD_GRAPH_EDGE_${String(edges.length + 1).padStart(6, "0")}`,

      source_graph_node_id:
        a.graph_node_id,

      target_graph_node_id:
        b.graph_node_id,

      source_organization:
        a.organization_name,

      target_organization:
        b.organization_name,

      relationship_type:
        a.cross_city_duplicate_detected ||
        b.cross_city_duplicate_detected
          ? "REGIONAL_CORRIDOR_OVERLAP"
          : "SAN_DIEGO_ECOSYSTEM_RELATIONSHIP",

      edge_weight:
        edgeWeight,

      propagation_capable:
        true,

      automated_outreach_allowed:
        false,

      runtime_mutation_allowed:
        false
    });
  }
}

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/relationship_graph/san_diego/nodes/san_diego_graph_nodes.json"
  ),
  JSON.stringify({
    version:
      "black_dragon_san_diego_graph_nodes_v1",

    generated_at:
      new Date().toISOString(),

    total_nodes:
      nodes.length,

    nodes
  }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/relationship_graph/san_diego/edges/san_diego_graph_edges.json"
  ),
  JSON.stringify({
    version:
      "black_dragon_san_diego_graph_edges_v1",

    generated_at:
      new Date().toISOString(),

    total_edges:
      edges.length,

    edges
  }, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "SAN_DIEGO_GRAPH_COMPLETE",
  graph_nodes: nodes.length,
  graph_edges: edges.length
}, null, 2));
