const fs = require("fs");
const path = require("path");

const ROOT = path.resolve("public/data");
const BOOKS = path.resolve("public/data/clients/black_dragon/books");

function exists(file) {
  return fs.existsSync(file);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function rel(file) {
  return path.relative(process.cwd(), file).replace(/\\/g, "/");
}

function safeRead(file) {
  try {
    return readJson(file);
  } catch (err) {
    return null;
  }
}

const files = {
  operational:
    path.join(BOOKS, "operational/black_dragon_books_operational_targets.v1.json"),

  queue:
    path.join(BOOKS, "queue/outreach_ready_queue.v1.json"),

  adaptive:
    path.join(BOOKS, "adaptive_priority/adaptive_priority_index.v1.json"),

  kpi:
    path.join(BOOKS, "kpi/book_operational_kpis.v1.json"),

  dashboard:
    path.join(BOOKS, "dashboard/client_operator_dashboard.v1.json"),

  widgets:
    path.join(BOOKS, "dashboard/widgets/client_dashboard_widgets.v1.json"),

  mapLayer:
    path.join(BOOKS, "map/layers/book_propagation_map_layer.v1.json"),

  runtimeNodes:
    path.join(BOOKS, "map/runtime/book_citymap_nodes.v1.json"),

  clusters:
    path.join(BOOKS, "map/clusters/book_regional_influence_clusters.v1.json"),

  paths:
    path.join(BOOKS, "map/paths/book_propagation_paths.v1.json"),

  controls:
    path.join(BOOKS, "map/controls/citymap_layer_controls.v1.json"),

  readiness:
    path.resolve(
      "public/data/security/readiness/black_dragon_controlled_client_pilot_ready.json"
    )
};

const loaded = {};

for (const [key, file] of Object.entries(files)) {
  loaded[key] = safeRead(file);
}

const operational =
  Array.isArray(loaded.operational)
    ? loaded.operational
    : (loaded.operational && loaded.operational.targets) || [];

const queueItems =
  (loaded.queue && loaded.queue.all_queue_items) || [];

const adaptiveTargets =
  (loaded.adaptive && loaded.adaptive.targets) || [];

const kpiTargets =
  (loaded.kpi && loaded.kpi.targets) || [];

const runtimeNodes =
  (loaded.runtimeNodes && loaded.runtimeNodes.nodes) || [];

const clusters =
  (loaded.clusters && loaded.clusters.clusters) || [];

const paths =
  (loaded.paths && loaded.paths.paths) || [];

const widgets =
  (loaded.widgets && loaded.widgets.widgets) || [];

const mapFeatures =
  (loaded.mapLayer && loaded.mapLayer.features) || [];

const opIds = new Set(operational.map(x => x.entity_id));
const queueIds = new Set(queueItems.map(x => x.entity_id));
const adaptiveIds = new Set(adaptiveTargets.map(x => x.entity_id));
const kpiIds = new Set(kpiTargets.map(x => x.entity_id));
const nodeIds = new Set(runtimeNodes.map(x => x.entity_id));

const audit = {
  version:
    "black_dragon_post_expansion_access_audit_v1",

  generated_at:
    new Date().toISOString(),

  checkpoint:
    "POST_EXPANSION_PRE_CLIENT_ACCESS",

  totals: {
    operational_targets: operational.length,
    queue_items: queueItems.length,
    adaptive_targets: adaptiveTargets.length,
    kpi_targets: kpiTargets.length,
    map_features: mapFeatures.length,
    runtime_nodes: runtimeNodes.length,
    regional_clusters: clusters.length,
    propagation_paths: paths.length,
    dashboard_widgets: widgets.length
  },

  runtime_integrity: {
    operational_targets_loaded:
      operational.length > 0,

    queue_loaded:
      queueItems.length > 0,

    adaptive_loaded:
      adaptiveTargets.length > 0,

    kpi_loaded:
      kpiTargets.length > 0,

    map_layer_loaded:
      mapFeatures.length > 0,

    runtime_nodes_loaded:
      runtimeNodes.length > 0,

    clusters_loaded:
      clusters.length > 0,

    paths_loaded:
      paths.length > 0,

    controls_loaded:
      !!loaded.controls,

    dashboard_loaded:
      !!loaded.dashboard,

    widgets_loaded:
      widgets.length > 0
  },

  consistency_integrity: {
    missing_entity_ids:
      operational.filter(x => !x.entity_id).length,

    duplicate_entity_ids:
      operational.length - opIds.size,

    missing_queue_records:
      operational.filter(x => !queueIds.has(x.entity_id)).length,

    missing_adaptive_records:
      operational.filter(x => !adaptiveIds.has(x.entity_id)).length,

    missing_kpi_records:
      operational.filter(x => !kpiIds.has(x.entity_id)).length,

    missing_runtime_nodes:
      operational.filter(x => !nodeIds.has(x.entity_id)).length,

    invalid_scores:
      operational.filter(x =>
        typeof x.propagation_score !== "number" ||
        x.propagation_score < 0 ||
        x.propagation_score > 100
      ).length,

    invalid_coordinates:
      runtimeNodes.filter(x =>
        typeof x.lat !== "number" ||
        typeof x.lon !== "number"
      ).length
  },

  security_integrity: {
    client_scope_locked:
      operational.every(x => x.client_id === "black_dragon"),

    dashboard_scope_locked:
      loaded.dashboard &&
      loaded.dashboard.client &&
      loaded.dashboard.client.client_id === "black_dragon",

    controls_scope_locked:
      loaded.controls &&
      loaded.controls.client_id === "black_dragon",

    readiness_checkpoint_exists:
      !!loaded.readiness,

    no_cross_client_paths:
      paths.every(x => x.client_id === "black_dragon"),

    no_cross_client_clusters:
      clusters.every(x => x.client_id === "black_dragon")
  },

  operational_integrity: {
    ready_queue_present:
      queueItems.some(x => x.queue_status === "READY"),

    enrichment_queue_present:
      queueItems.some(x =>
        x.queue_status === "NEEDS_CONTACT_ENRICHMENT"
      ),

    critical_targets_present:
      adaptiveTargets.some(x =>
        x.adaptive_priority_tier === "CRITICAL"
      ),

    map_density_operational:
      runtimeNodes.length >= 1000,

    cluster_density_operational:
      clusters.length >= 25,

    propagation_operational:
      paths.length >= 25
  },

  ui_integrity: {
    dashboard_widgets_present:
      widgets.length >= 5,

    controls_have_three_layers:
      loaded.controls &&
      Array.isArray(loaded.controls.layers) &&
      loaded.controls.layers.length === 3,

    target_layer_present:
      loaded.controls &&
      loaded.controls.layers.some(x =>
        x.layer_id === "BOOK_TARGETS"
      ),

    cluster_layer_present:
      loaded.controls &&
      loaded.controls.layers.some(x =>
        x.layer_id === "REGIONAL_CLUSTERS"
      ),

    propagation_layer_present:
      loaded.controls &&
      loaded.controls.layers.some(x =>
        x.layer_id === "PROPAGATION_PATHS"
      )
  }
};

audit.pass =
  Object.values(audit.runtime_integrity).every(Boolean) &&
  audit.consistency_integrity.missing_entity_ids === 0 &&
  audit.consistency_integrity.duplicate_entity_ids === 0 &&
  audit.consistency_integrity.missing_queue_records === 0 &&
  audit.consistency_integrity.missing_adaptive_records === 0 &&
  audit.consistency_integrity.missing_kpi_records === 0 &&
  audit.consistency_integrity.missing_runtime_nodes === 0 &&
  audit.consistency_integrity.invalid_scores === 0 &&
  audit.consistency_integrity.invalid_coordinates === 0 &&
  Object.values(audit.security_integrity).every(Boolean) &&
  Object.values(audit.operational_integrity).every(Boolean) &&
  Object.values(audit.ui_integrity).every(Boolean);

const outPath = path.resolve(
  "public/data/security/platform/final_post_expansion_client_access_audit.json"
);

fs.writeFileSync(outPath, JSON.stringify(audit, null, 2));

const checkpointPath = path.resolve(
  "public/data/security/platform/final_post_expansion_client_access_checkpoint.json"
);

fs.writeFileSync(
  checkpointPath,
  JSON.stringify({
    checkpoint:
      "FINAL_POST_EXPANSION_CLIENT_ACCESS_READY",

    generated_at:
      new Date().toISOString(),

    pass:
      audit.pass,

    totals:
      audit.totals
  }, null, 2)
);

console.log(JSON.stringify({
  status:
    "FINAL_POST_EXPANSION_CLIENT_ACCESS_AUDIT_COMPLETE",

  pass:
    audit.pass,

  audit:
    rel(outPath),

  checkpoint:
    rel(checkpointPath)
}, null, 2));

if (!audit.pass) process.exit(1);
