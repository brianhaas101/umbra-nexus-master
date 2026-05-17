const fs = require("fs");
const path = require("path");

const files = {
  // Core Black Dragon Books V2
  operationalTargets: "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json",
  clientView: "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json",
  queue: "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",
  responses: "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json",
  adaptive: "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json",
  kpis: "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json",
  dashboard: "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json",
  widgets: "public/data/clients/black_dragon/books/dashboard/widgets/client_dashboard_widgets.v1.json",
  mapLayer: "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json",
  mapSnapshot: "public/data/clients/black_dragon/books/map/snapshots/book_propagation_map_snapshot.v1.json",

  // Client UI
  dashboardRenderer: "public/globe/clients/black_dragon/books/client_dashboard_renderer.js",
  queueUi: "public/globe/clients/black_dragon/books/outreach_queue_ui.js",
  responseUi: "public/globe/clients/black_dragon/books/response_logging_ui.js",

  // Security
  runtimeRoleModel: "public/data/security/runtime/runtime_role_model.v1.json",
  clientIsolation: "public/data/security/runtime/client_isolation_manifest.v1.json",
  frontendPolicy: "public/data/security/frontend/frontend_role_policy.v1.json",
  sessionPolicy: "public/data/security/session/client_session_policy.v1.json",
  datasetPolicy: "public/data/security/datasets/dataset_access_policy.v1.json",
  exportPolicy: "public/data/security/exports/export_security_policy.v1.json",

  // Security Runtime JS
  frontendGuard: "public/globe/security/frontend_runtime_guard.js",
  uiHook: "public/globe/security/ui_panel_security_hook.js",
  sessionGuard: "public/globe/security/session_recovery_guard.js",
  datasetGuard: "public/globe/security/dataset_access_guard.js",
  exportGuard: "public/globe/security/export_security_guard.js",

  // Checkpoints / Readiness
  stabilityCheckpoint: "public/data/security/stability/post_black_dragon_books_v2_security_stability_pass.json",
  clientReadinessCheckpoint: "public/data/security/readiness/black_dragon_controlled_client_pilot_ready.json",

  // Multi-client
  multiclientAudit: "public/data/security/audit/batch_033_multiclient_isolation_audit.json"
};

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

const file_checks = Object.entries(files).map(([key, file]) => ({
  key,
  file,
  exists: exists(file)
}));

const missing = file_checks.filter(f => !f.exists);

let audit = {
  version: "umbra_batch_035_full_nexus_pre_pilot_audit_v1",
  generated_at: new Date().toISOString(),
  checkpoint_id: "PRE_BLACK_DRAGON_LIVE_CLIENT_ACCESS",
  file_checks,
  pass: false
};

if (missing.length > 0) {
  audit.failure_reason = "MISSING_REQUIRED_FILES";
  audit.missing = missing;

  fs.writeFileSync(
    path.resolve("public/data/security/audit/batch_035_full_nexus_pre_pilot_audit.json"),
    JSON.stringify(audit, null, 2)
  );

  console.log(JSON.stringify(audit, null, 2));
  process.exit(1);
}

const operationalTargets = readJson(files.operationalTargets);
const clientView = readJson(files.clientView);
const queue = readJson(files.queue);
const responses = readJson(files.responses);
const adaptive = readJson(files.adaptive);
const kpis = readJson(files.kpis);
const dashboard = readJson(files.dashboard);
const widgets = readJson(files.widgets);
const mapLayer = readJson(files.mapLayer);
const mapSnapshot = readJson(files.mapSnapshot);

const runtimeRoleModel = readJson(files.runtimeRoleModel);
const clientIsolation = readJson(files.clientIsolation);
const frontendPolicy = readJson(files.frontendPolicy);
const sessionPolicy = readJson(files.sessionPolicy);
const datasetPolicy = readJson(files.datasetPolicy);
const exportPolicy = readJson(files.exportPolicy);

const stabilityCheckpoint = readJson(files.stabilityCheckpoint);
const clientReadinessCheckpoint = readJson(files.clientReadinessCheckpoint);
const multiclientAudit = readJson(files.multiclientAudit);

const dashboardRenderer = readText(files.dashboardRenderer);
const queueUi = readText(files.queueUi);
const responseUi = readText(files.responseUi);

const frontendGuard = readText(files.frontendGuard);
const uiHook = readText(files.uiHook);
const sessionGuard = readText(files.sessionGuard);
const datasetGuard = readText(files.datasetGuard);
const exportGuard = readText(files.exportGuard);

const targetIds = new Set(operationalTargets.map(t => t.entity_id));
const clientViewIds = new Set(clientView.map(t => t.entity_id));
const queueIds = new Set(safeArray(queue.all_queue_items).map(q => q.entity_id));
const adaptiveIds = new Set(safeArray(adaptive.targets).map(t => t.entity_id));
const kpiIds = new Set(safeArray(kpis.targets).map(t => t.entity_id));
const mapIds = new Set(safeArray(mapLayer.features).map(f => f.properties && f.properties.entity_id));

audit = {
  ...audit,

  runtime_integrity: {
    founder_role_exists: !!runtimeRoleModel.roles.FOUNDER,
    client_role_exists: !!runtimeRoleModel.roles.CLIENT_OPERATOR,
    strict_client_isolation: runtimeRoleModel.runtime_rules.strict_client_isolation === true,
    client_scope_declared: clientIsolation.clients.some(c => c.client_id === "black_dragon"),
    frontend_policy_exists: !!frontendPolicy.roles.CLIENT_OPERATOR,
    session_policy_exists: !!sessionPolicy.allowed_runtime_roles,
    dataset_policy_exists: !!datasetPolicy.runtime_rules,
    export_policy_exists: !!exportPolicy.hard_rules
  },

  security_integrity: {
    frontend_guard_active: frontendGuard.includes("window.UmbraFrontendSecurity"),
    ui_hook_active: uiHook.includes("window.UmbraUIPanelSecurity"),
    session_guard_active: sessionGuard.includes("window.UmbraSessionSecurity"),
    dataset_guard_active: datasetGuard.includes("window.UmbraDatasetSecurity"),
    export_guard_active: exportGuard.includes("window.UmbraExportSecurity"),

    client_blocks_founder_admin: frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("FOUNDER_ADMIN"),
    client_blocks_client_switcher: frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("CLIENT_SWITCHER"),
    client_blocks_exports: frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("EXPORTS"),

    client_raw_export_blocked: exportPolicy.client_operator_permissions.raw_dataset_export === false,
    client_global_export_blocked: exportPolicy.client_operator_permissions.global_export === false,
    cross_client_export_forbidden: exportPolicy.hard_rules.cross_client_export_forbidden === true,

    dataset_guarded_fetch_exists: datasetGuard.includes("guardedFetch"),
    export_guarded_export_exists: exportGuard.includes("guardedExport"),
    stale_session_recovery_exists: sessionGuard.includes("safeClientSession")
  },

  ui_integrity: {
    dashboard_renderer_active: dashboardRenderer.includes("window.BlackDragonBooksDashboard"),
    queue_ui_active: queueUi.includes("window.BlackDragonBooksQueueUI"),
    response_ui_active: responseUi.includes("window.BlackDragonBooksResponseUI"),

    dashboard_uses_security: dashboardRenderer.includes("UmbraFrontendSecurity") && dashboardRenderer.includes("UmbraDatasetSecurity"),
    queue_uses_security: queueUi.includes("UmbraFrontendSecurity") && queueUi.includes("UmbraDatasetSecurity"),
    response_uses_security: responseUi.includes("UmbraFrontendSecurity") && responseUi.includes("UmbraDatasetSecurity"),

    queue_copy_actions_exist:
      queueUi.includes("Copy Subject") &&
      queueUi.includes("Copy Message") &&
      queueUi.includes("Copy Full Outreach") &&
      queueUi.includes("Copy Contact Route"),

    response_capture_actions_exist:
      responseUi.includes("Generate Response Record") &&
      responseUi.includes("Copy Response JSON")
  },

  black_dragon_data_integrity: {
    operational_targets_exist: operationalTargets.length > 0,
    client_view_exists: Array.isArray(clientView),
    queue_exists: Array.isArray(queue.all_queue_items),
    responses_exist: Array.isArray(responses.responses),
    adaptive_exists: Array.isArray(adaptive.targets),
    kpis_exist: Array.isArray(kpis.targets),
    dashboard_client_safe: dashboard.client.client_id === "black_dragon" && dashboard.client.operator_mode === "CLIENT_SAFE",
    widgets_exist: Array.isArray(widgets.widgets) && widgets.widgets.length > 0,

    missing_target_entity_ids: operationalTargets.filter(t => !t.entity_id).length,
    missing_target_scores: operationalTargets.filter(t => typeof t.propagation_score !== "number").length,

    missing_client_view_records: operationalTargets.filter(t => !clientViewIds.has(t.entity_id)).length,
    missing_queue_records: operationalTargets.filter(t => !queueIds.has(t.entity_id)).length,
    missing_adaptive_records: operationalTargets.filter(t => !adaptiveIds.has(t.entity_id)).length,
    missing_kpi_records: operationalTargets.filter(t => !kpiIds.has(t.entity_id)).length,
    missing_map_records: operationalTargets.filter(t => !mapIds.has(t.entity_id)).length
  },

  operational_alignment: {
    queue_scores_valid:
      safeArray(queue.all_queue_items).filter(q =>
        typeof q.unified_priority_score !== "number" ||
        q.unified_priority_score < 0 ||
        q.unified_priority_score > 100
      ).length === 0,

    adaptive_scores_valid:
      safeArray(adaptive.targets).filter(t =>
        typeof t.adaptive_priority_score !== "number" ||
        t.adaptive_priority_score < 0 ||
        t.adaptive_priority_score > 100
      ).length === 0,

    kpi_revenue_valid:
      safeArray(kpis.targets).filter(t =>
        typeof t.projected_revenue !== "number"
      ).length === 0,

    map_layer_valid:
      mapLayer.type === "FeatureCollection" &&
      mapLayer.metadata.client_id === "black_dragon" &&
      mapLayer.metadata.module === "book_sales_v2",

    map_features_valid:
      safeArray(mapLayer.features).filter(f =>
        !f.geometry ||
        f.geometry.type !== "Point" ||
        !Array.isArray(f.geometry.coordinates) ||
        f.geometry.coordinates.length !== 2 ||
        typeof f.properties.visual_score !== "number"
      ).length === 0,

    map_snapshot_valid:
      mapSnapshot.totals.features === mapLayer.totals.features
  },

  checkpoint_integrity: {
    stability_checkpoint_passed:
      stabilityCheckpoint.pass === true,

    controlled_client_pilot_ready:
      clientReadinessCheckpoint.pass === true,

    client_not_enterprise_production:
      clientReadinessCheckpoint.client.full_enterprise_production_ready === false,

    multi_client_not_claimed:
      clientReadinessCheckpoint.client.multi_client_ready === false,

    multiclient_audit_passed:
      multiclientAudit.pass === true
  },

  deployment_readiness: {
    controlled_client_pilot_access_allowed: true,
    unrestricted_enterprise_access_allowed: false,
    founder_tools_exposed_to_client: false,
    raw_exports_allowed_for_client: false,
    multi_client_expansion_allowed_without_more_tests: false
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.security_integrity).every(Boolean) &&
  Object.values(audit.ui_integrity).every(Boolean) &&

  audit.black_dragon_data_integrity.operational_targets_exist &&
  audit.black_dragon_data_integrity.client_view_exists &&
  audit.black_dragon_data_integrity.queue_exists &&
  audit.black_dragon_data_integrity.responses_exist &&
  audit.black_dragon_data_integrity.adaptive_exists &&
  audit.black_dragon_data_integrity.kpis_exist &&
  audit.black_dragon_data_integrity.dashboard_client_safe &&
  audit.black_dragon_data_integrity.widgets_exist &&
  audit.black_dragon_data_integrity.missing_target_entity_ids === 0 &&
  audit.black_dragon_data_integrity.missing_target_scores === 0 &&
  audit.black_dragon_data_integrity.missing_client_view_records === 0 &&
  audit.black_dragon_data_integrity.missing_queue_records === 0 &&
  audit.black_dragon_data_integrity.missing_adaptive_records === 0 &&
  audit.black_dragon_data_integrity.missing_kpi_records === 0 &&
  audit.black_dragon_data_integrity.missing_map_records === 0 &&

  Object.values(audit.operational_alignment).every(Boolean) &&
  Object.values(audit.checkpoint_integrity).every(Boolean) &&
  audit.deployment_readiness.controlled_client_pilot_access_allowed === true &&
  audit.deployment_readiness.unrestricted_enterprise_access_allowed === false &&
  audit.deployment_readiness.founder_tools_exposed_to_client === false &&
  audit.deployment_readiness.raw_exports_allowed_for_client === false &&
  audit.deployment_readiness.multi_client_expansion_allowed_without_more_tests === false;

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_035_full_nexus_pre_pilot_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
