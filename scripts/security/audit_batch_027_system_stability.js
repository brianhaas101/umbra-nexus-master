const fs = require("fs");
const path = require("path");

const requiredFiles = {
  runtimeRoleModel:
    "public/data/security/runtime/runtime_role_model.v1.json",

  clientIsolation:
    "public/data/security/runtime/client_isolation_manifest.v1.json",

  frontendPolicy:
    "public/data/security/frontend/frontend_role_policy.v1.json",

  sessionPolicy:
    "public/data/security/session/client_session_policy.v1.json",

  exportPolicy:
    "public/data/security/exports/export_security_policy.v1.json",

  datasetPolicy:
    "public/data/security/datasets/dataset_access_policy.v1.json",

  frontendGuard:
    "public/globe/security/frontend_runtime_guard.js",

  uiHook:
    "public/globe/security/ui_panel_security_hook.js",

  sessionGuard:
    "public/globe/security/session_recovery_guard.js",

  datasetGuard:
    "public/globe/security/dataset_access_guard.js",

  exportGuard:
    "public/globe/security/export_security_guard.js",

  bdOperationalTargets:
    "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json",

  bdQueue:
    "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",

  bdResponses:
    "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json",

  bdAdaptivePriority:
    "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json",

  bdClientView:
    "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json",

  bdKpis:
    "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json"
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

const file_checks = Object.entries(requiredFiles).map(([key, file]) => ({
  key,
  file,
  exists: exists(file)
}));

const missingFiles = file_checks.filter(f => !f.exists);

let audit = {
  version: "umbra_batch_027_system_stability_audit_v1",
  generated_at: new Date().toISOString(),
  file_checks,
  pass: false
};

if (missingFiles.length > 0) {
  audit.failure_reason = "MISSING_REQUIRED_FILES";
  audit.missing_files = missingFiles;

  fs.writeFileSync(
    path.resolve("public/data/security/audit/batch_027_system_stability_audit.json"),
    JSON.stringify(audit, null, 2)
  );

  console.log(JSON.stringify(audit, null, 2));
  process.exit(1);
}

const runtimeRoleModel = readJson(requiredFiles.runtimeRoleModel);
const clientIsolation = readJson(requiredFiles.clientIsolation);
const frontendPolicy = readJson(requiredFiles.frontendPolicy);
const sessionPolicy = readJson(requiredFiles.sessionPolicy);
const exportPolicy = readJson(requiredFiles.exportPolicy);
const datasetPolicy = readJson(requiredFiles.datasetPolicy);

const frontendGuardText = readText(requiredFiles.frontendGuard);
const uiHookText = readText(requiredFiles.uiHook);
const sessionGuardText = readText(requiredFiles.sessionGuard);
const datasetGuardText = readText(requiredFiles.datasetGuard);
const exportGuardText = readText(requiredFiles.exportGuard);

const targets = readJson(requiredFiles.bdOperationalTargets);
const queue = readJson(requiredFiles.bdQueue);
const responses = readJson(requiredFiles.bdResponses);
const adaptive = readJson(requiredFiles.bdAdaptivePriority);
const clientView = readJson(requiredFiles.bdClientView);
const kpis = readJson(requiredFiles.bdKpis);

const targetIds = new Set(targets.map(t => t.entity_id));
const queueIds = new Set((queue.all_queue_items || []).map(q => q.entity_id));
const adaptiveIds = new Set((adaptive.targets || []).map(t => t.entity_id));
const clientViewIds = new Set(clientView.map(t => t.entity_id));
const kpiIds = new Set((kpis.targets || []).map(t => t.entity_id));

audit = {
  ...audit,

  runtime_security_integrity: {
    founder_role_exists:
      !!runtimeRoleModel.roles.FOUNDER,

    client_role_exists:
      !!runtimeRoleModel.roles.CLIENT_OPERATOR,

    strict_client_isolation:
      runtimeRoleModel.runtime_rules.strict_client_isolation === true,

    cross_client_visibility_forbidden:
      runtimeRoleModel.runtime_rules.cross_client_visibility_forbidden === true,

    black_dragon_scope_declared:
      clientIsolation.clients.some(c => c.client_id === "black_dragon")
  },

  frontend_integrity: {
    frontend_guard_loaded:
      frontendGuardText.includes("window.UmbraFrontendSecurity"),

    ui_hook_loaded:
      uiHookText.includes("window.UmbraUIPanelSecurity"),

    client_blocks_founder_admin:
      frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("FOUNDER_ADMIN"),

    client_blocks_exports:
      frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("EXPORTS"),

    ui_hook_uses_mutation_observer:
      uiHookText.includes("MutationObserver")
  },

  session_integrity: {
    session_guard_loaded:
      sessionGuardText.includes("window.UmbraSessionSecurity"),

    safe_client_session_exists:
      sessionGuardText.includes("safeClientSession"),

    stale_session_rules_exist:
      sessionPolicy.stale_session_rules.client_stale_session_resets_to_safe_client_runtime === true,

    client_cannot_restore_founder:
      sessionPolicy.client_operator_rules.cannot_restore_founder_runtime === true,

    client_cannot_restore_global:
      sessionPolicy.client_operator_rules.cannot_restore_global_dataset === true
  },

  dataset_export_integrity: {
    dataset_guard_loaded:
      datasetGuardText.includes("window.UmbraDatasetSecurity"),

    export_guard_loaded:
      exportGuardText.includes("window.UmbraExportSecurity"),

    restricted_roots_exist:
      datasetPolicy.restricted_dataset_roots.length >= 5,

    client_raw_export_blocked:
      exportPolicy.client_operator_permissions.raw_dataset_export === false,

    client_global_export_blocked:
      exportPolicy.client_operator_permissions.global_export === false,

    guarded_fetch_exists:
      datasetGuardText.includes("guardedFetch"),

    guarded_export_exists:
      exportGuardText.includes("guardedExport")
  },

  black_dragon_integrity: {
    operational_targets_exist:
      targets.length > 0,

    queue_exists:
      Array.isArray(queue.all_queue_items),

    adaptive_priority_exists:
      Array.isArray(adaptive.targets),

    client_view_exists:
      Array.isArray(clientView),

    kpi_targets_exist:
      Array.isArray(kpis.targets),

    missing_queue_records_for_targets:
      targets.filter(t => !queueIds.has(t.entity_id)).length,

    missing_adaptive_records_for_targets:
      targets.filter(t => !adaptiveIds.has(t.entity_id)).length,

    missing_client_view_records_for_targets:
      targets.filter(t => !clientViewIds.has(t.entity_id)).length,

    missing_kpi_records_for_targets:
      targets.filter(t => !kpiIds.has(t.entity_id)).length
  },

  data_shape_integrity: {
    missing_target_entity_ids:
      targets.filter(t => !t.entity_id).length,

    missing_target_scores:
      targets.filter(t => typeof t.propagation_score !== "number").length,

    invalid_queue_scores:
      (queue.all_queue_items || []).filter(q =>
        typeof q.unified_priority_score !== "number" ||
        q.unified_priority_score < 0 ||
        q.unified_priority_score > 100
      ).length,

    invalid_adaptive_scores:
      (adaptive.targets || []).filter(t =>
        typeof t.adaptive_priority_score !== "number" ||
        t.adaptive_priority_score < 0 ||
        t.adaptive_priority_score > 100
      ).length,

    invalid_kpi_revenue:
      (kpis.targets || []).filter(t =>
        typeof t.projected_revenue !== "number"
      ).length
  },

  deterministic_recovery_state: {
    no_missing_files: missingFiles.length === 0,
    security_layers_present: true,
    black_dragon_books_v2_present: true,
    queue_adaptive_client_kpi_alignment_checked: true,
    runtime_recovery_guards_present: true
  }
};

audit.pass =
  Object.values(audit.runtime_security_integrity).every(Boolean) &&
  Object.values(audit.frontend_integrity).every(Boolean) &&
  Object.values(audit.session_integrity).every(Boolean) &&
  Object.values(audit.dataset_export_integrity).every(Boolean) &&
  audit.black_dragon_integrity.operational_targets_exist &&
  audit.black_dragon_integrity.queue_exists &&
  audit.black_dragon_integrity.adaptive_priority_exists &&
  audit.black_dragon_integrity.client_view_exists &&
  audit.black_dragon_integrity.kpi_targets_exist &&
  audit.black_dragon_integrity.missing_queue_records_for_targets === 0 &&
  audit.black_dragon_integrity.missing_adaptive_records_for_targets === 0 &&
  audit.black_dragon_integrity.missing_client_view_records_for_targets === 0 &&
  audit.black_dragon_integrity.missing_kpi_records_for_targets === 0 &&
  audit.data_shape_integrity.missing_target_entity_ids === 0 &&
  audit.data_shape_integrity.missing_target_scores === 0 &&
  audit.data_shape_integrity.invalid_queue_scores === 0 &&
  audit.data_shape_integrity.invalid_adaptive_scores === 0 &&
  audit.data_shape_integrity.invalid_kpi_revenue === 0 &&
  Object.values(audit.deterministic_recovery_state).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_027_system_stability_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
