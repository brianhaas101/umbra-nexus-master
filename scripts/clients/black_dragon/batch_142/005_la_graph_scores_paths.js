const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const nodesData = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/nodes/los_angeles_graph_nodes.json"
);

const edgesData = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json"
);

const nodes = nodesData.nodes;
const edges = edgesData.edges;

const degree = new Map();
const weighted = new Map();

for (const node of nodes) {
  degree.set(node.graph_node_id, 0);
  weighted.set(node.graph_node_id, 0);
}

for (const edge of edges) {
  degree.set(edge.source_graph_node_id, degree.get(edge.source_graph_node_id) + 1);
  degree.set(edge.target_graph_node_id, degree.get(edge.target_graph_node_id) + 1);
  weighted.set(edge.source_graph_node_id, weighted.get(edge.source_graph_node_id) + edge.edge_weight);
  weighted.set(edge.target_graph_node_id, weighted.get(edge.target_graph_node_id) + edge.edge_weight);
}

const scores = nodes.map(node => {
  const graphDegree = degree.get(node.graph_node_id);
  const weightedScore = Number(weighted.get(node.graph_node_id).toFixed(3));

  const influenceScore =
    Number(Math.min(10,
      node.best_score * 0.55 +
      graphDegree * 0.18 +
      weightedScore * 0.22
    ).toFixed(2));

  return {
    graph_node_id:
      node.graph_node_id,

    organization_name:
      node.organization_name,

    city_rank:
      node.city_rank,

    priority_tier:
      node.priority_tier,

    graph_degree:
      graphDegree,

    weighted_relationship_score:
      weightedScore,

    influence_score:
      influenceScore,

    influence_tier:
      influenceScore >= 8.75
        ? "GRAPH_HOT"
        : influenceScore >= 7.5
          ? "GRAPH_WARM"
          : "GRAPH_REVIEW",

    contact_ready:
      false,

    cross_city_duplicate_detected:
      node.cross_city_duplicate_detected
  };
})
.sort((a, b) => b.influence_score - a.influence_score)
.map((row, index) => ({
  ...row,
  graph_influence_rank: index + 1
}));

const paths = scores.slice(0, 10).map((score, index) => {
  const connected = edges
    .filter(edge =>
      edge.source_graph_node_id === score.graph_node_id ||
      edge.target_graph_node_id === score.graph_node_id
    )
    .sort((a, b) => b.edge_weight - a.edge_weight)
    .slice(0, 5);

  return {
    propagation_path_id:
      `BD_LA_PROP_PATH_${String(index + 1).padStart(5, "0")}`,

    root_graph_node_id:
      score.graph_node_id,

    root_organization:
      score.organization_name,

    root_influence_score:
      score.influence_score,

    recommended_use:
      "REVIEW_BEFORE_MANUAL_ACTION",

    connected_targets:
      connected.map(edge => ({
        relationship_type:
          edge.relationship_type,

        connected_organization:
          edge.source_graph_node_id === score.graph_node_id
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
  };
});

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/los_angeles/scores/los_angeles_graph_influence_scores.json"),
  JSON.stringify({
    version: "black_dragon_los_angeles_graph_influence_scores_v1",
    generated_at: new Date().toISOString(),
    city: "Los Angeles",
    state: "CA",
    total_scored_nodes: scores.length,
    scores
  }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json"),
  JSON.stringify({
    version: "black_dragon_los_angeles_propagation_paths_v1",
    generated_at: new Date().toISOString(),
    city: "Los Angeles",
    state: "CA",
    total_paths: paths.length,
    paths
  }, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "LOS_ANGELES_GRAPH_SCORES_PATHS_COMPLETE",
  scored_nodes: scores.length,
  propagation_paths: paths.length,
  top_node: scores[0]?.organization_name || null
}, null, 2));
