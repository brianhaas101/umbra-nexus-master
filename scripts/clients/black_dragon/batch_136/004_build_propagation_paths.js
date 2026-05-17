const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/scores/long_beach_graph_influence_scores.json"
);

const edges = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

const top = scores.scores.slice(0, 15);

const paths = [];

for (const node of top) {
  const connectedEdges = edges.edges
    .filter(edge =>
      edge.source_graph_node_id === node.graph_node_id ||
      edge.target_graph_node_id === node.graph_node_id
    )
    .sort((a, b) => b.edge_weight - a.edge_weight)
    .slice(0, 5);

  paths.push({
    propagation_path_id:
      `BD_LB_PROP_PATH_${String(paths.length + 1).padStart(5, "0")}`,

    root_graph_node_id:
      node.graph_node_id,

    root_organization:
      node.organization_name,

    root_influence_score:
      node.influence_score,

    recommended_use:
      node.contact_ready
        ? "DIRECT_MANUAL_ACTION_PLUS_PROPAGATION"
        : "PROPAGATION_REVIEW_BEFORE_ACTION",

    connected_targets:
      connectedEdges.map(edge => ({
        relationship_type:
          edge.relationship_type,

        connected_organization:
          edge.source_graph_node_id === node.graph_node_id
            ? edge.target_organization
            : edge.source_organization,

        edge_weight:
          edge.edge_weight,

        propagation_capable:
          edge.propagation_capable,

        conversion_path_capable:
          edge.conversion_path_capable
      })),

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  });
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/paths/long_beach_propagation_paths.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_propagation_paths_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_paths: paths.length,
  paths
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LONG_BEACH_PROPAGATION_PATHS_COMPLETE",
  total_paths: paths.length,
  output: out
}, null, 2));
