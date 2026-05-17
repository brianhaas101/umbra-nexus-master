const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const runtime = {
  version: "black_dragon_phoenix_runtime_shell_v1",
  generated_at: new Date().toISOString(),
  city: "Phoenix",
  state: "AZ",
  runtime_status: "SHELL_READY_ENTITY_IMPORT_PENDING",
  raw_layer_rows: 0,
  deduped_city_entities: 0,
  contact_ready_entities: 0,
  duplicate_review_entities: 0,
  merged_entities: [],
  inherited_laws: {
    no_placeholder_runtime_entities: true,
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete_without_quarantine: true,
    verified_route_required_for_contact_ready: true,
    cross_state_duplicates_require_founder_review: true
  }
};

const files = [
  {
    rel: "public/data/clients/black_dragon/city_runtime/phoenix/merged/phoenix_merged_city_entities.json",
    data: runtime
  },
  {
    rel: "public/data/clients/black_dragon/relationship_graph/phoenix/nodes/phoenix_graph_nodes.json",
    data: { version: "black_dragon_phoenix_graph_nodes_v1", generated_at: new Date().toISOString(), city: "Phoenix", state: "AZ", total_nodes: 0, nodes: [] }
  },
  {
    rel: "public/data/clients/black_dragon/relationship_graph/phoenix/edges/phoenix_graph_edges.json",
    data: { version: "black_dragon_phoenix_graph_edges_v1", generated_at: new Date().toISOString(), city: "Phoenix", state: "AZ", total_edges: 0, edges: [] }
  },
  {
    rel: "public/data/clients/black_dragon/relationship_graph/phoenix/scores/phoenix_graph_influence_scores.json",
    data: { version: "black_dragon_phoenix_graph_influence_scores_v1", generated_at: new Date().toISOString(), city: "Phoenix", state: "AZ", total_scored_nodes: 0, scores: [] }
  },
  {
    rel: "public/data/clients/black_dragon/relationship_graph/phoenix/paths/phoenix_propagation_paths.json",
    data: { version: "black_dragon_phoenix_propagation_paths_v1", generated_at: new Date().toISOString(), city: "Phoenix", state: "AZ", total_paths: 0, paths: [] }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/phoenix/manifests/live_validation_targets.json",
    data: { version: "black_dragon_phoenix_live_validation_targets_v1", generated_at: new Date().toISOString(), city: "Phoenix", state: "AZ", validation_targets: [], status: "PENDING_ENTITY_IMPORT" }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/phoenix/results/live_http_validation_results.json",
    data: { version: "black_dragon_phoenix_live_http_validation_results_v1", generated_at: new Date().toISOString(), validation_count: 0, validation_results: [] }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/phoenix/freshness/live_freshness_registry.json",
    data: { version: "black_dragon_phoenix_live_freshness_registry_v1", generated_at: new Date().toISOString(), freshness_records: [] }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/phoenix/dead_routes/dead_route_review_queue.json",
    data: { version: "black_dragon_phoenix_dead_route_review_queue_v1", generated_at: new Date().toISOString(), review_item_count: 0, dead_route_items: [] }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/phoenix/contact_review/contact_route_review.json",
    data: { version: "black_dragon_phoenix_contact_route_review_v1", generated_at: new Date().toISOString(), review_count: 0, contact_ready_candidates: 0, contact_review: [] }
  }
];

for (const file of files) {
  const full = path.join(ROOT, file.rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(file.data, null, 2), "utf8");
}

const audit = {
  version: "black_dragon_batch_158_phoenix_template_initialization_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "158_PHOENIX_RUNTIME_TEMPLATE_INITIALIZATION",
  counts: { shell_files: files.length, runtime_entities: 0 },
  gates: {
    runtime_shell_exists: true,
    graph_shell_exists: true,
    live_validation_shell_exists: true,
    no_placeholder_runtime_entities: true,
    no_auto_contact: runtime.inherited_laws.no_auto_contact === true,
    no_auto_promotion: runtime.inherited_laws.no_auto_promotion === true
  },
  next_phase: "BATCH_159_PHOENIX_ENTITY_DISCOVERY_IMPORT",
  status: "PASS"
};

const out = path.join(ROOT, "public/data/clients/black_dragon/city_runtime/phoenix/audit/batch_158_phoenix_template_initialization_audit.json");
fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_158_PHOENIX_TEMPLATE_INITIALIZATION_COMPLETE",
  audit_status: audit.status,
  gates: audit.gates,
  output: out
}, null, 2));
