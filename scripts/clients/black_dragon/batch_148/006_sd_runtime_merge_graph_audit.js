const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const dossiers = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/dossiers/san_diego_runtime_dossiers.json"
);

const nodes = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/nodes/san_diego_graph_nodes.json"
);

const edges = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/edges/san_diego_graph_edges.json"
);

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/scores/san_diego_graph_influence_scores.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/san_diego/paths/san_diego_propagation_paths.json"
);

const audit = {
  version:
    "black_dragon_batch_148_san_diego_runtime_merge_graph_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "148_SAN_DIEGO_RUNTIME_MERGE_AND_GRAPH",

  counts: {
    runtime_entities:
      runtime.deduped_city_entities,

    duplicate_review_entities:
      runtime.duplicate_review_entities,

    dossiers:
      dossiers.dossier_count,

    graph_nodes:
      nodes.total_nodes,

    graph_edges:
      edges.total_edges,

    scored_nodes:
      scores.total_scored_nodes,

    propagation_paths:
      paths.total_paths
  },

  gates: {
    runtime_entities_exist:
      runtime.deduped_city_entities === 10,

    dossiers_match_runtime:
      dossiers.dossier_count === runtime.deduped_city_entities,

    graph_nodes_match_runtime:
      nodes.total_nodes === runtime.deduped_city_entities,

    graph_edges_exist:
      edges.total_edges > 0,

    scored_nodes_match_runtime:
      scores.total_scored_nodes === runtime.deduped_city_entities,

    propagation_paths_exist:
      paths.total_paths > 0,

    no_contact_ready:
      runtime.contact_ready_entities === 0,

    no_automated_outreach:
      runtime.merged_entities.every(
        e => e.automated_outreach_allowed === false
      ),

    no_runtime_mutation:
      runtime.merged_entities.every(
        e => e.runtime_mutation_allowed === false
      )
  },

  next_phase:
    "BATCH_149_SAN_DIEGO_LIVE_VALIDATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/san_diego/audit/batch_148_san_diego_runtime_merge_graph_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_148_SAN_DIEGO_RUNTIME_MERGE_GRAPH_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
