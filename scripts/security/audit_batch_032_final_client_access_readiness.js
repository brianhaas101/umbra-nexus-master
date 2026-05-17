const fs = require("fs");
const path = require("path");

const files = {
  dashboardRenderer: "public/globe/clients/black_dragon/books/client_dashboard_renderer.js",
  queueUi: "public/globe/clients/black_dragon/books/outreach_queue_ui.js",
  responseUi: "public/globe/clients/black_dragon/books/response_logging_ui.js",

  frontendGuard: "public/globe/security/frontend_runtime_guard.js",
  uiHook: "public/globe/security/ui_panel_security_hook.js",
  sessionGuard: "public/globe/security/session_recovery_guard.js",
  datasetGuard: "public/globe/security/dataset_access_guard.js",
  exportGuard: "public/globe/security/export_security_guard.js",

  dashboardData: "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json",
  widgetsData: "public/data/clients/black_dragon/books/dashboard/widgets/client_dashboard_widgets.v1.json",
  queueData: "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",
  responsesData: "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json",
  adaptiveData: "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json",
  kpiData: "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json",

  runtimeRoleModel: "public/data/security/runtime/runtime_role_model.v1.json",
  frontendPolicy: "public/data/security/frontend/frontend_role_policy.v1.json",
  sessionPolicy: "public/data/security/session/client_session_policy.v1.json",
  datasetPolicy: "public/data/security/datasets/dataset_access_policy.v1.json",
  exportPolicy: "public/data/security/exports/export_security_policy.v1.json",
  stabilityCheckpoint: "public/data/security/stability/post_black_dragon_books_v2_security_stability_pass.json"
};

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const file_checks = Object.entries(files).map(([key, file]) => ({
  key,
  file,
  exists: exists(file)
}));

const missing = file_checks.filter(f => !f.exists);

let audit = {
  version: "umbra_batch_032_final_client_access_readiness_audit_v1",
  generated_at: new Date().toISOString(),
  file_checks,
  pass: false
};

if (missing.length > 0) {
  audit.failure_reason = "MISSING_REQUIRED_FILES";
  audit.missing = missing;

  fs.writeFileSync(
    path.resolve("public/data/security/audit/batch_032_final_client_access_readiness_audit.json"),
    JSON.stringify(audit, null, 2)
  );

  console.log(JSON.stringify(audit, null, 2));
  process.exit(1);
}

const dashboardRenderer = readText(files.dashboardRenderer);
const queueUi = readText(files.queueUi);
const responseUi = readText(files.responseUi);

const frontendGuard = readText(files.frontendGuard);
const uiHook = readText(files.uiHook);
const sessionGuard = readText(files.sessionGuard);
const datasetGuard = readText(files.datasetGuard);
const exportGuard = readText(files.exportGuard);

const dashboardData = readJson(files.dashboardData);
const widgetsData = readJson(files.widgetsData);
const queueData = readJson(files.queueData);
const responsesData = readJson(files.responsesData);
const adaptiveData = readJson(files.adaptiveData);
const kpiData = readJson(files.kpiData);

const roleModel = readJson(files.runtimeRoleModel);
const frontendPolicy = readJson(files.frontendPolicy);
const sessionPolicy = readJson(files.sessionPolicy);
const datasetPolicy = readJson(files.datasetPolicy);
const exportPolicy = readJson(files.exportPolicy);
const stabilityCheckpoint = readJson(files.stabilityCheckpoint);

audit = {
  ...audit,

  client_ui_integrity: {
    dashboard_renderer_active:
      dashboardRenderer.includes("window.BlackDragonBooksDashboard"),

    queue_ui_active:
      queueUi.includes("window.BlackDragonBooksQueueUI"),

    response_ui_active:
      responseUi.includes("window.BlackDragonBooksResponseUI"),

    dashboard_uses_security:
      dashboardRenderer.includes("UmbraFrontendSecurity") &&
      dashboardRenderer.includes("UmbraDatasetSecurity"),

    queue_uses_security:
      queueUi.includes("UmbraFrontendSecurity") &&
      queueUi.includes("UmbraDatasetSecurity"),

    response_uses_security:
      responseUi.includes("UmbraFrontendSecurity") &&
      responseUi.includes("UmbraDatasetSecurity"),

    queue_has_copy_actions:
      queueUi.includes("Copy Subject") &&
      queueUi.includes("Copy Message") &&
      queueUi.includes("Copy Full Outreach") &&
      queueUi.includes("Copy Contact Route"),

    response_has_capture_actions:
      responseUi.includes("Generate Response Record") &&
      responseUi.includes("Copy Response JSON")
  },

  security_integrity: {
    frontend_guard_active:
      frontendGuard.includes("window.UmbraFrontendSecurity"),

    ui_hook_active:
      uiHook.includes("window.UmbraUIPanelSecurity"),

    session_guard_active:
      sessionGuard.includes("window.UmbraSessionSecurity"),

    dataset_guard_active:
      datasetGuard.includes("window.UmbraDatasetSecurity"),

    export_guard_active:
      exportGuard.includes("window.UmbraExportSecurity"),

    client_blocks_founder_admin:
      frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("FOUNDER_ADMIN"),

    client_blocks_exports:
      frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("EXPORTS"),

    client_raw_export_blocked:
      exportPolicy.client_operator_permissions.raw_dataset_export === false,

    client_global_export_blocked:
      exportPolicy.client_operator_permissions.global_export === false,

    restricted_dataset_roots_declared:
      datasetPolicy.restricted_dataset_roots.length >= 5,

    client_cannot_restore_founder:
      sessionPolicy.client_operator_rules.cannot_restore_founder_runtime === true,

    strict_client_isolation:
      roleModel.runtime_rules.strict_client_isolation === true
  },

  data_integrity: {
    dashboard_client_black_dragon:
      dashboardData.client.client_id === "black_dragon",

    dashboard_client_safe:
      dashboardData.client.operator_mode === "CLIENT_SAFE",

    widgets_exist:
      Array.isArray(widgetsData.widgets) && widgetsData.widgets.length >= 5,

    queue_exists:
      Array.isArray(queueData.all_queue_items),

    queue_has_items:
      Array.isArray(queueData.all_queue_items) && queueData.all_queue_items.length > 0,

    responses_exist:
      Array.isArray(responsesData.responses),

    adaptive_targets_exist:
      Array.isArray(adaptiveData.targets),

    kpi_targets_exist:
      Array.isArray(kpiData.targets)
  },

  workflow_integrity: {
    can_review_dashboard:
      true,

    can_review_queue:
      queueUi.includes("renderList") && queueUi.includes("renderPreview"),

    can_copy_outreach:
      queueUi.includes("copyText"),

    can_log_response:
      responseUi.includes("buildResultPayload"),

    can_copy_response_json:
      responseUi.includes("Copy Response JSON"),

    can_apply_role_suppression:
      uiHook.includes("applySecurity"),

    can_guard_fetches:
      datasetGuard.includes("guardedFetch"),

    can_guard_exports:
      exportGuard.includes("guardedExport")
  },

  stability_integrity: {
    stability_checkpoint_exists:
      !!stabilityCheckpoint,

    stability_checkpoint_passed:
      stabilityCheckpoint.pass === true,

    controlled_client_pilot_ready:
      stabilityCheckpoint.deployment_state.controlled_client_pilot_ready === true,

    full_enterprise_production_not_claimed:
      stabilityCheckpoint.deployment_state.full_enterprise_production_ready === false,

    multi_client_not_claimed:
      stabilityCheckpoint.deployment_state.multi_client_ready === false
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.client_ui_integrity).every(Boolean) &&
  Object.values(audit.security_integrity).every(Boolean) &&
  Object.values(audit.data_integrity).every(Boolean) &&
  Object.values(audit.workflow_integrity).every(Boolean) &&
  Object.values(audit.stability_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_032_final_client_access_readiness_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
