const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const graphShells = [
  {
    rel: "public/data/clients/black_dragon/relationship_graph/los_angeles/nodes/los_angeles_graph_nodes.json",
    data: {
      version: "black_dragon_los_angeles_graph_nodes_v1",
      generated_at: new Date().toISOString(),
      city: "Los Angeles",
      state: "CA",
      total_nodes: 0,
      nodes: []
    }
  },
  {
    rel: "public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json",
    data: {
      version: "black_dragon_los_angeles_graph_edges_v1",
      generated_at: new Date().toISOString(),
      city: "Los Angeles",
      state: "CA",
      total_edges: 0,
      edges: []
    }
  },
  {
    rel: "public/data/clients/black_dragon/relationship_graph/los_angeles/scores/los_angeles_graph_influence_scores.json",
    data: {
      version: "black_dragon_los_angeles_graph_influence_scores_v1",
      generated_at: new Date().toISOString(),
      city: "Los Angeles",
      state: "CA",
      total_scored_nodes: 0,
      scores: []
    }
  },
  {
    rel: "public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json",
    data: {
      version: "black_dragon_los_angeles_propagation_paths_v1",
      generated_at: new Date().toISOString(),
      city: "Los Angeles",
      state: "CA",
      total_paths: 0,
      paths: []
    }
  }
];

for (const item of graphShells) {
  const full = path.join(ROOT, item.rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(item.data, null, 2), "utf8");
}

console.log(JSON.stringify({
  status: "LOS_ANGELES_GRAPH_SHELL_COMPLETE",
  graph_shell_files: graphShells.length
}, null, 2));
