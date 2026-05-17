const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const nodesData = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/nodes/long_beach_graph_nodes.json"
);

const edgesData = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

const nodes = nodesData.nodes;
const edges = edgesData.edges;

const degreeMap = new Map();
const weightMap = new Map();

for (const node of nodes) {
  degreeMap.set(node.graph_node_id, 0);
  weightMap.set(node.graph_node_id, 0);
}

for (const edge of edges) {
  degreeMap.set(
    edge.source_graph_node_id,
    degreeMap.get(edge.source_graph_node_id) + 1
  );

  degreeMap.set(
    edge.target_graph_node_id,
    degreeMap.get(edge.target_graph_node_id) + 1
  );

  weightMap.set(
    edge.source_graph_node_id,
    weightMap.get(edge.source_graph_node_id) + edge.edge_weight
  );

  weightMap.set(
    edge.target_graph_node_id,
    weightMap.get(edge.target_graph_node_id) + edge.edge_weight
  );
}

const scores = nodes.map(node => {
  const degree = degreeMap.get(node.graph_node_id);
  const weightedDegree = Number(weightMap.get(node.graph_node_id).toFixed(3));

  const centralityScore =
    Number(Math.min(10, degree * 0.35 + weightedDegree * 0.55).toFixed(2));

  const influenceScore =
    Number(Math.min(10,
      (node.best_score * 0.45) +
      (centralityScore * 0.35) +
      (node.source_layer_count * 0.20)
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
      degree,

    weighted_relationship_score:
      weightedDegree,

    graph_centrality_score:
      centralityScore,

    influence_score:
      influenceScore,

    influence_tier:
      influenceScore >= 8.75
        ? "GRAPH_HOT"
        : influenceScore >= 7.5
          ? "GRAPH_WARM"
          : "GRAPH_REVIEW",

    contact_ready:
      node.contact_ready,

    graph_visible:
      true
  };
})
.sort((a, b) => b.influence_score - a.influence_score)
.map((row, index) => ({
  ...row,
  graph_influence_rank: index + 1
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/scores/long_beach_graph_influence_scores.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_graph_influence_scores_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_scored_nodes: scores.length,
  scores
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LONG_BEACH_GRAPH_INFLUENCE_SCORES_COMPLETE",
  total_scored_nodes: scores.length,
  top_influence_node: scores[0]?.organization_name || null,
  output: out
}, null, 2));
