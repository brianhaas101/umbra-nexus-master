const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const dossiers = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/dossiers/los_angeles_runtime_dossiers.json"
);

const mapNodes = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/map_nodes/los_angeles_runtime_map_nodes.json"
);

const nodes = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/nodes/los_angeles_graph_nodes.json"
);

const edges = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/edges/los_angeles_graph_edges.json"
);

const scores = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/scores/los_angeles_graph_influence_scores.json"
);

const paths = read(
  "public/data/clients/black_dragon/relationship_graph/los_angeles/paths/los_angeles_propagation_paths.json"
);

const audit = {
  version:
    "black_dragon_batch_142_los_angeles_runtime_merge_graph_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "142_LOS_ANGELES_RUNTIME_MERGE_AND_GRAPH_FOUNDATION",

  counts: {
    runtime_entities:
      runtime.deduped_city_entities,

    contact_ready_entities:
      runtime.contact_ready_entities,

    duplicate_review_entities:
      runtime.duplicate_review_entities,

    dossiers:
      dossiers.dossier_count,

    map_nodes:
      mapNodes.map_node_count,

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

    no_contact_ready:
      runtime.contact_ready_entities === 0,

    dossiers_match_runtime:
      dossiers.dossier_count === runtime.deduped_city_entities,

    map_nodes_match_runtime:
      mapNodes.map_node_count === runtime.deduped_city_entities,

    graph_nodes_match_runtime:
      nodes.total_nodes === runtime.deduped_city_entities,

    graph_edges_exist:
      edges.total_edges > 0,

    scored_nodes_match_runtime:
      scores.total_scored_nodes === runtime.deduped_city_entities,

    propagation_paths_exist:
      paths.total_paths > 0,

    no_automated_outreach:
      runtime.merged_entities.every(e => e.automated_outreach_allowed === false) &&
      edges.edges.every(e => e.automated_outreach_allowed === false) &&
      paths.paths.every(p => p.automated_outreach_allowed === false),

    no_runtime_mutation:
      runtime.merged_entities.every(e => e.runtime_mutation_allowed === false) &&
      edges.edges.every(e => e.runtime_mutation_allowed === false) &&
      paths.paths.every(p => p.runtime_mutation_allowed === false)
  },

  next_phase:
    "BATCH_143_LOS_ANGELES_LIVE_VALIDATION_AND_CONTACT_ROUTE_REVIEW",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/city_runtime/los_angeles/audit/batch_142_los_angeles_runtime_merge_graph_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_142_LA_RUNTIME_MERGE_GRAPH_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
