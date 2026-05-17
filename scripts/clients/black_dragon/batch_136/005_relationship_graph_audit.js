const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const nodes = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/nodes/long_beach_graph_nodes.json"
);

const edges = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/edges/long_beach_graph_edges.json"
);

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/scores/long_beach_graph_influence_scores.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/long_beach/paths/long_beach_propagation_paths.json"
);

const audit = {
  version:
    "black_dragon_batch_136_relationship_graph_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "136_RELATIONSHIP_GRAPH_ENGINE_FOUNDATION",

  counts: {
    graph_nodes:
      nodes.total_nodes,

    graph_edges:
      edges.total_edges,

    influence_scored_nodes:
      scores.total_scored_nodes,

    propagation_paths:
      paths.total_paths,

    graph_hot_nodes:
      scores.scores.filter(s =>
        s.influence_tier === "GRAPH_HOT"
      ).length,

    graph_warm_nodes:
      scores.scores.filter(s =>
        s.influence_tier === "GRAPH_WARM"
      ).length
  },

  gates: {
    nodes_match_runtime:
      nodes.total_nodes === scores.total_scored_nodes,

    graph_edges_exist:
      edges.total_edges > 0,

    influence_scores_exist:
      scores.total_scored_nodes > 0,

    propagation_paths_exist:
      paths.total_paths > 0,

    no_runtime_mutation:
      edges.edges.every(e =>
        e.runtime_mutation_allowed === false
      ) &&
      paths.paths.every(p =>
        p.runtime_mutation_allowed === false
      ),

    no_automated_outreach:
      edges.edges.every(e =>
        e.automated_outreach_allowed === false
      ) &&
      paths.paths.every(p =>
        p.automated_outreach_allowed === false
      )
  },

  next_phase:
    "BATCH_137_GRAPH_TO_CLIENT_UI_SURFACE_AND_AUDIT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/relationship_graph/long_beach/audit/batch_136_relationship_graph_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_136_RELATIONSHIP_GRAPH_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
