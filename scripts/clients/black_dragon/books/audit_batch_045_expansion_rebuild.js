const fs = require("fs");
const path = require("path");

const BOOKS = path.resolve("public/data/clients/black_dragon/books");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(BOOKS, rel), "utf8"));
}

const operational = readJson("operational/black_dragon_books_operational_targets.v1.json");
const queue = readJson("queue/outreach_ready_queue.v1.json");
const adaptive = readJson("adaptive_priority/adaptive_priority_index.v1.json");
const kpi = readJson("kpi/book_operational_kpis.v1.json");
const dashboard = readJson("dashboard/client_operator_dashboard.v1.json");
const mapLayer = readJson("map/layers/book_propagation_map_layer.v1.json");
const nodes = readJson("map/runtime/book_citymap_nodes.v1.json");
const clusters = readJson("map/clusters/book_regional_influence_clusters.v1.json");
const paths = readJson("map/paths/book_propagation_paths.v1.json");
const mergeReport = readJson("expansion/batch_045_merge_report.v1.json");

const ids = new Set(operational.map(t => t.entity_id));
const queueIds = new Set((queue.all_queue_items || []).map(q => q.entity_id));
const adaptiveIds = new Set((adaptive.targets || []).map(t => t.entity_id));
const kpiIds = new Set((kpi.targets || []).map(t => t.entity_id));
const nodeIds = new Set((nodes.nodes || []).map(n => n.entity_id));
const mapIds = new Set((mapLayer.features || []).map(f => f.properties && f.properties.entity_id));

const audit = {
  version: "black_dragon_books_batch_045_expansion_rebuild_audit_v1",
  generated_at: new Date().toISOString(),

  expansion: mergeReport,

  totals: {
    operational_targets: operational.length,
    queue_items: (queue.all_queue_items || []).length,
    adaptive_targets: (adaptive.targets || []).length,
    kpi_targets: (kpi.targets || []).length,
    map_features: (mapLayer.features || []).length,
    runtime_nodes: (nodes.nodes || []).length,
    clusters: (clusters.clusters || []).length,
    paths: (paths.paths || []).length
  },

  integrity: {
    operational_targets_exist: operational.length > 0,
    additions_non_negative: mergeReport.additions >= 0,

    missing_entity_ids: operational.filter(t => !t.entity_id).length,
    duplicate_entity_ids: operational.length - ids.size,
    missing_scores: operational.filter(t => typeof t.propagation_score !== "number").length,

    missing_queue_records: operational.filter(t => !queueIds.has(t.entity_id)).length,
    missing_adaptive_records: operational.filter(t => !adaptiveIds.has(t.entity_id)).length,
    missing_kpi_records: operational.filter(t => !kpiIds.has(t.entity_id)).length,
    missing_node_records: operational.filter(t => !nodeIds.has(t.entity_id)).length,
    missing_map_records: operational.filter(t => !mapIds.has(t.entity_id)).length,

    invalid_queue_scores: (queue.all_queue_items || []).filter(q =>
      typeof q.unified_priority_score !== "number" ||
      q.unified_priority_score < 0 ||
      q.unified_priority_score > 100
    ).length,

    invalid_adaptive_scores: (adaptive.targets || []).filter(t =>
      typeof t.adaptive_priority_score !== "number" ||
      t.adaptive_priority_score < 0 ||
      t.adaptive_priority_score > 100
    ).length,

    invalid_node_coords: (nodes.nodes || []).filter(n =>
      typeof n.lat !== "number" ||
      typeof n.lon !== "number"
    ).length,

    dashboard_scope_valid:
      dashboard.client &&
      dashboard.client.client_id === "black_dragon" &&
      dashboard.client.operator_mode === "CLIENT_SAFE",

    map_scope_valid:
      mapLayer.metadata &&
      mapLayer.metadata.client_id === "black_dragon"
  }
};

audit.pass =
  audit.integrity.operational_targets_exist &&
  audit.integrity.additions_non_negative &&
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.duplicate_entity_ids === 0 &&
  audit.integrity.missing_scores === 0 &&
  audit.integrity.missing_queue_records === 0 &&
  audit.integrity.missing_adaptive_records === 0 &&
  audit.integrity.missing_kpi_records === 0 &&
  audit.integrity.missing_node_records === 0 &&
  audit.integrity.missing_map_records === 0 &&
  audit.integrity.invalid_queue_scores === 0 &&
  audit.integrity.invalid_adaptive_scores === 0 &&
  audit.integrity.invalid_node_coords === 0 &&
  audit.integrity.dashboard_scope_valid &&
  audit.integrity.map_scope_valid;

fs.writeFileSync(
  path.join(BOOKS, "audits/batch_045_expansion_rebuild_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
