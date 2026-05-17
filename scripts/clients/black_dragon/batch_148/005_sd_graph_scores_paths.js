const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const nodesData = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/nodes/san_diego_graph_nodes.json"
);

const edgesData = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/edges/san_diego_graph_edges.json"
);

const scores = nodesData.nodes.map(node => {

  const degree =
    edgesData.edges.filter(edge =>
      edge.source_graph_node_id === node.graph_node_id ||
      edge.target_graph_node_id === node.graph_node_id
    ).length;

  const influenceScore =
    Number((
      node.best_score * 0.7 +
      degree * 0.3
    ).toFixed(2));

  return {
    graph_node_id:
      node.graph_node_id,

    organization_name:
      node.organization_name,

    graph_degree:
      degree,

    influence_score:
      influenceScore,

    graph_influence_rank:
      0,

    cross_city_duplicate_detected:
      node.cross_city_duplicate_detected,

    influence_tier:
      influenceScore >= 9
        ? "GRAPH_HOT"
        : influenceScore >= 8
          ? "GRAPH_WARM"
          : "GRAPH_REVIEW"
  };
})
.sort((a,b) => b.influence_score - a.influence_score)
.map((score, index) => ({
  ...score,
  graph_influence_rank: index + 1
}));

const paths = scores.slice(0, 10).map((score, index) => ({
  propagation_path_id:
    `BD_SD_PROP_PATH_${String(index + 1).padStart(5, "0")}`,

  root_organization:
    score.organization_name,

  root_influence_score:
    score.influence_score,

  recommended_use:
    "MANUAL_REVIEW_THEN_ACTION",

  connected_target_count:
    edgesData.edges.filter(edge =>
      edge.source_organization === score.organization_name ||
      edge.target_organization === score.organization_name
    ).length,

  automated_outreach_allowed:
    false,

  runtime_mutation_allowed:
    false
}));

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/relationship_graph/san_diego/scores/san_diego_graph_influence_scores.json"
  ),
  JSON.stringify({
    version:
      "black_dragon_san_diego_graph_influence_scores_v1",

    generated_at:
      new Date().toISOString(),

    total_scored_nodes:
      scores.length,

    scores
  }, null, 2),
  "utf8"
);

fs.writeFileSync(
  path.join(
    ROOT,
    "public/data/clients/black_dragon/relationship_graph/san_diego/paths/san_diego_propagation_paths.json"
  ),
  JSON.stringify({
    version:
      "black_dragon_san_diego_propagation_paths_v1",

    generated_at:
      new Date().toISOString(),

    total_paths:
      paths.length,

    paths
  }, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "SAN_DIEGO_GRAPH_SCORES_PATHS_COMPLETE",
  scored_nodes: scores.length,
  propagation_paths: paths.length,
  top_node: scores[0]?.organization_name || null
}, null, 2));
