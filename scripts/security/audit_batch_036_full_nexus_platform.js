const fs = require("fs");
const path = require("path");

const files = {
  // Core app / globe
  indexRoot: "index.html",
  indexPublic: "public/index.html",
  indexGlobe: "public/globe/index.html",

  core: "public/globe/core.js",
  layers: "public/globe/layers.js",
  textures: "public/globe/textures.js",
  dataLoader: "public/globe/data_loader.js",
  dossiers: "public/globe/dossiers.js",
  ui: "public/globe/ui.js",
  cityMap: "public/globe/city_map.js",
  umbraData: "public/globe/umbra_data.v1.js",

  // Intelligence system
  intelRegistry: "public/globe/intel/registry.js",
  intelPipeline: "public/globe/intel/pipeline.js",
  intelligenceCheckpoint: "public/data/intelligence/checkpoints/post_first_5_operational_pass.json",

  // Black Dragon core/client bridges
  blackDragonClientBridge: "public/globe/intel/clients/black_dragon.client_preset.bridge.js",
  blackDragonIntegrity: "public/globe/intel/clients/black_dragon.integrity.check.js",

  // Black Dragon books
  bdBooksOperational: "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json",
  bdBooksQueue: "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",
  bdBooksResponses: "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json",
  bdBooksAdaptive: "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json",
  bdBooksKpi: "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json",
  bdBooksDashboard: "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json",
  bdBooksMapLayer: "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json",

  // Black Dragon UI
  bdDashboardRenderer: "public/globe/clients/black_dragon/books/client_dashboard_renderer.js",
  bdQueueUi: "public/globe/clients/black_dragon/books/outreach_queue_ui.js",
  bdResponseUi: "public/globe/clients/black_dragon/books/response_logging_ui.js",

  // Security hardening
  runtimeRoleModel: "public/data/security/runtime/runtime_role_model.v1.json",
  clientIsolation: "public/data/security/runtime/client_isolation_manifest.v1.json",
  frontendPolicy: "public/data/security/frontend/frontend_role_policy.v1.json",
  sessionPolicy: "public/data/security/session/client_session_policy.v1.json",
  datasetPolicy: "public/data/security/datasets/dataset_access_policy.v1.json",
  exportPolicy: "public/data/security/exports/export_security_policy.v1.json",

  frontendGuard: "public/globe/security/frontend_runtime_guard.js",
  uiPanelHook: "public/globe/security/ui_panel_security_hook.js",
  sessionGuard: "public/globe/security/session_recovery_guard.js",
  datasetGuard: "public/globe/security/dataset_access_guard.js",
  exportGuard: "public/globe/security/export_security_guard.js",

  // Recent checkpoints
  stabilityCheckpoint: "public/data/security/stability/post_black_dragon_books_v2_security_stability_pass.json",
  clientPilotCheckpoint: "public/data/security/readiness/black_dragon_controlled_client_pilot_ready.json",
  prePilotCheckpoint: "public/data/security/prepilot/pre_black_dragon_live_client_access.json",
  multiClientAudit: "public/data/security/audit/batch_033_multiclient_isolation_audit.json"
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

function tryReadJson(file) {
  try {
    return readJson(file);
  } catch (err) {
    return null;
  }
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function jsHas(text, token) {
  return typeof text === "string" && text.includes(token);
}

const fileChecks = Object.entries(files).map(([key, file]) => ({
  key,
  file,
  exists: exists(file)
}));

const missingCritical = fileChecks.filter(f => {
  if (["indexRoot", "indexPublic", "indexGlobe"].includes(f.key)) {
    return false;
  }
  return !f.exists;
});

let audit = {
  version: "umbra_batch_036_full_nexus_platform_audit_v1",
  generated_at: new Date().toISOString(),
  audit_type: "READ_ONLY_PLATFORM_SURFACE_AUDIT",
  file_checks: fileChecks,
  pass: false
};

if (missingCritical.length > 0) {
  audit.failure_reason = "MISSING_CRITICAL_PLATFORM_FILES";
  audit.missing_critical = missingCritical;

  fs.writeFileSync(
    path.resolve("public/data/security/audit/batch_036_full_nexus_platform_audit.json"),
    JSON.stringify(audit, null, 2)
  );

  console.log(JSON.stringify(audit, null, 2));
  process.exit(1);
}

const coreText = readText(files.core);
const layersText = readText(files.layers);
const texturesText = readText(files.textures);
const dataLoaderText = readText(files.dataLoader);
const dossiersText = readText(files.dossiers);
const uiText = readText(files.ui);
const cityMapText = readText(files.cityMap);
const umbraDataText = readText(files.umbraData);

const intelRegistryText = readText(files.intelRegistry);
const intelPipelineText = readText(files.intelPipeline);
const bdBridgeText = readText(files.blackDragonClientBridge);
const bdIntegrityText = readText(files.blackDragonIntegrity);

const bdOperational = readJson(files.bdBooksOperational);
const bdQueue = readJson(files.bdBooksQueue);
const bdResponses = readJson(files.bdBooksResponses);
const bdAdaptive = readJson(files.bdBooksAdaptive);
const bdKpi = readJson(files.bdBooksKpi);
const bdDashboard = readJson(files.bdBooksDashboard);
const bdMapLayer = readJson(files.bdBooksMapLayer);

const dashboardRendererText = readText(files.bdDashboardRenderer);
const queueUiText = readText(files.bdQueueUi);
const responseUiText = readText(files.bdResponseUi);

const runtimeRoleModel = readJson(files.runtimeRoleModel);
const clientIsolation = readJson(files.clientIsolation);
const frontendPolicy = readJson(files.frontendPolicy);
const sessionPolicy = readJson(files.sessionPolicy);
const datasetPolicy = readJson(files.datasetPolicy);
const exportPolicy = readJson(files.exportPolicy);

const frontendGuardText = readText(files.frontendGuard);
const uiPanelHookText = readText(files.uiPanelHook);
const sessionGuardText = readText(files.sessionGuard);
const datasetGuardText = readText(files.datasetGuard);
const exportGuardText = readText(files.exportGuard);

const stabilityCheckpoint = readJson(files.stabilityCheckpoint);
const clientPilotCheckpoint = readJson(files.clientPilotCheckpoint);
const prePilotCheckpoint = readJson(files.prePilotCheckpoint);
const multiClientAudit = readJson(files.multiClientAudit);
const intelligenceCheckpoint = tryReadJson(files.intelligenceCheckpoint);

const bdTargetIds = new Set(bdOperational.map(t => t.entity_id));
const queueIds = new Set(safeArray(bdQueue.all_queue_items).map(q => q.entity_id));
const adaptiveIds = new Set(safeArray(bdAdaptive.targets).map(t => t.entity_id));
const kpiIds = new Set(safeArray(bdKpi.targets).map(t => t.entity_id));
const mapIds = new Set(safeArray(bdMapLayer.features).map(f => f.properties && f.properties.entity_id));

const htmlEntries = ["indexRoot", "indexPublic", "indexGlobe"]
  .filter(k => exists(files[k]))
  .map(k => ({
    key: k,
    file: files[k],
    html: readText(files[k])
  }));

const requiredInjectedScripts = [
  "/globe/security/frontend_runtime_guard.js",
  "/globe/security/ui_panel_security_hook.js",
  "/globe/security/session_recovery_guard.js",
  "/globe/security/dataset_access_guard.js",
  "/globe/security/export_security_guard.js",
  "/globe/clients/black_dragon/books/client_dashboard_renderer.js",
  "/globe/clients/black_dragon/books/outreach_queue_ui.js",
  "/globe/clients/black_dragon/books/response_logging_ui.js"
];

audit = {
  ...audit,

  entrypoint_integrity: {
    at_least_one_entrypoint_exists:
      htmlEntries.length > 0,

    all_existing_entrypoints_have_security_scripts:
      htmlEntries.length > 0 &&
      htmlEntries.every(entry =>
        requiredInjectedScripts
          .slice(0, 5)
          .every(script => entry.html.includes(script))
      ),

    all_existing_entrypoints_have_client_ui_scripts:
      htmlEntries.length > 0 &&
      htmlEntries.every(entry =>
        requiredInjectedScripts
          .slice(5)
          .every(script => entry.html.includes(script))
      )
  },

  core_runtime_integrity: {
    core_defines_umbra_global:
      jsHas(coreText, "UmbraGlobe") || jsHas(coreText, "window.UmbraGlobe"),

    core_mentions_world_mode:
      jsHas(coreText, "WORLD"),

    core_mentions_city_map_mode:
      jsHas(coreText, "CITY_MAP"),

    layers_module_present:
      layersText.length > 100,

    textures_module_present:
      texturesText.length > 100,

    data_loader_module_present:
      dataLoaderText.length > 100,

    dossiers_module_present:
      dossiersText.length > 100,

    ui_module_present:
      uiText.length > 100,

    city_map_module_present:
      cityMapText.length > 100,

    umbra_data_present:
      umbraDataText.length > 100
  },

  intelligence_system_integrity: {
    registry_present:
      intelRegistryText.length > 100,

    pipeline_present:
      intelPipelineText.length > 100,

    registry_mentions_layers:
      jsHas(intelRegistryText, "layer") || jsHas(intelRegistryText, "Layer"),

    pipeline_mentions_fusion_or_pipeline:
      jsHas(intelPipelineText, "pipeline") || jsHas(intelPipelineText, "fusion"),

    first_5_checkpoint_available:
      !!intelligenceCheckpoint,

    first_5_checkpoint_pass_like:
      !intelligenceCheckpoint ||
      JSON.stringify(intelligenceCheckpoint).includes("PASS")
  },

  black_dragon_books_integrity: {
    operational_targets_exist:
      bdOperational.length > 0,

    queue_exists:
      Array.isArray(bdQueue.all_queue_items),

    responses_exist:
      Array.isArray(bdResponses.responses),

    adaptive_exists:
      Array.isArray(bdAdaptive.targets),

    kpi_exists:
      Array.isArray(bdKpi.targets),

    dashboard_scope_correct:
      bdDashboard.client &&
      bdDashboard.client.client_id === "black_dragon" &&
      bdDashboard.client.operator_mode === "CLIENT_SAFE",

    map_layer_valid:
      bdMapLayer.type === "FeatureCollection" &&
      bdMapLayer.metadata &&
      bdMapLayer.metadata.client_id === "black_dragon",

    missing_entity_ids:
      bdOperational.filter(t => !t.entity_id).length,

    missing_propagation_scores:
      bdOperational.filter(t => typeof t.propagation_score !== "number").length,

    missing_queue_records:
      bdOperational.filter(t => !queueIds.has(t.entity_id)).length,

    missing_adaptive_records:
      bdOperational.filter(t => !adaptiveIds.has(t.entity_id)).length,

    missing_kpi_records:
      bdOperational.filter(t => !kpiIds.has(t.entity_id)).length,

    missing_map_records:
      bdOperational.filter(t => !mapIds.has(t.entity_id)).length
  },

  black_dragon_client_bridge_integrity: {
    bridge_present:
      bdBridgeText.length > 100,

    integrity_check_present:
      bdIntegrityText.length > 100,

    bridge_mentions_black_dragon:
      jsHas(bdBridgeText, "black_dragon") || jsHas(bdBridgeText, "blackDragon"),

    integrity_mentions_pass_or_check:
      jsHas(bdIntegrityText, "PASS") || jsHas(bdIntegrityText, "check")
  },

  client_ui_integrity: {
    dashboard_renderer_global:
      jsHas(dashboardRendererText, "window.BlackDragonBooksDashboard"),

    queue_ui_global:
      jsHas(queueUiText, "window.BlackDragonBooksQueueUI"),

    response_ui_global:
      jsHas(responseUiText, "window.BlackDragonBooksResponseUI"),

    dashboard_uses_security:
      jsHas(dashboardRendererText, "UmbraFrontendSecurity") &&
      jsHas(dashboardRendererText, "UmbraDatasetSecurity"),

    queue_uses_security:
      jsHas(queueUiText, "UmbraFrontendSecurity") &&
      jsHas(queueUiText, "UmbraDatasetSecurity"),

    response_uses_security:
      jsHas(responseUiText, "UmbraFrontendSecurity") &&
      jsHas(responseUiText, "UmbraDatasetSecurity"),

    queue_copy_actions_exist:
      jsHas(queueUiText, "Copy Subject") &&
      jsHas(queueUiText, "Copy Message") &&
      jsHas(queueUiText, "Copy Full Outreach") &&
      jsHas(queueUiText, "Copy Contact Route"),

    response_capture_actions_exist:
      jsHas(responseUiText, "Generate Response Record") &&
      jsHas(responseUiText, "Copy Response JSON")
  },

  security_integrity: {
    runtime_roles_present:
      !!runtimeRoleModel.roles.FOUNDER &&
      !!runtimeRoleModel.roles.CLIENT_OPERATOR,

    strict_client_isolation:
      runtimeRoleModel.runtime_rules.strict_client_isolation === true,

    black_dragon_client_scope_declared:
      clientIsolation.clients.some(c => c.client_id === "black_dragon"),

    frontend_client_blocks_founder_admin:
      frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("FOUNDER_ADMIN"),

    frontend_client_blocks_exports:
      frontendPolicy.roles.CLIENT_OPERATOR.blocked_panels.includes("EXPORTS"),

    session_blocks_founder_restore:
      sessionPolicy.client_operator_rules.cannot_restore_founder_runtime === true,

    dataset_cross_client_fetch_forbidden:
      datasetPolicy.runtime_rules.cross_client_dataset_fetch_forbidden === true,

    export_cross_client_forbidden:
      exportPolicy.hard_rules.cross_client_export_forbidden === true,

    frontend_guard_global:
      jsHas(frontendGuardText, "window.UmbraFrontendSecurity"),

    ui_panel_hook_global:
      jsHas(uiPanelHookText, "window.UmbraUIPanelSecurity"),

    session_guard_global:
      jsHas(sessionGuardText, "window.UmbraSessionSecurity"),

    dataset_guard_global:
      jsHas(datasetGuardText, "window.UmbraDatasetSecurity"),

    export_guard_global:
      jsHas(exportGuardText, "window.UmbraExportSecurity")
  },

  checkpoint_integrity: {
    stability_checkpoint_passed:
      stabilityCheckpoint.pass === true,

    client_pilot_checkpoint_passed:
      clientPilotCheckpoint.pass === true,

    pre_pilot_checkpoint_passed:
      prePilotCheckpoint.pass === true,

    multi_client_audit_passed:
      multiClientAudit.pass === true,

    no_unrestricted_enterprise_claim:
      prePilotCheckpoint.client.unrestricted_enterprise_access === false,

    no_multi_client_expansion_claim:
      prePilotCheckpoint.client.multi_client_expansion_ready === false
  },

  operational_score_integrity: {
    queue_scores_valid:
      safeArray(bdQueue.all_queue_items).filter(q =>
        typeof q.unified_priority_score !== "number" ||
        q.unified_priority_score < 0 ||
        q.unified_priority_score > 100
      ).length === 0,

    adaptive_scores_valid:
      safeArray(bdAdaptive.targets).filter(t =>
        typeof t.adaptive_priority_score !== "number" ||
        t.adaptive_priority_score < 0 ||
        t.adaptive_priority_score > 100
      ).length === 0,

    kpi_revenue_valid:
      safeArray(bdKpi.targets).filter(t =>
        typeof t.projected_revenue !== "number"
      ).length === 0,

    map_scores_valid:
      safeArray(bdMapLayer.features).filter(f =>
        !f.properties ||
        typeof f.properties.visual_score !== "number"
      ).length === 0
  }
};

const numericZeroChecks = [
  audit.black_dragon_books_integrity.missing_entity_ids,
  audit.black_dragon_books_integrity.missing_propagation_scores,
  audit.black_dragon_books_integrity.missing_queue_records,
  audit.black_dragon_books_integrity.missing_adaptive_records,
  audit.black_dragon_books_integrity.missing_kpi_records,
  audit.black_dragon_books_integrity.missing_map_records
];

audit.pass =
  fileChecks
    .filter(f => !["indexRoot", "indexPublic", "indexGlobe"].includes(f.key))
    .every(f => f.exists) &&

  Object.values(audit.entrypoint_integrity).every(Boolean) &&
  Object.values(audit.core_runtime_integrity).every(Boolean) &&
  Object.values(audit.intelligence_system_integrity).every(Boolean) &&

  audit.black_dragon_books_integrity.operational_targets_exist &&
  audit.black_dragon_books_integrity.queue_exists &&
  audit.black_dragon_books_integrity.responses_exist &&
  audit.black_dragon_books_integrity.adaptive_exists &&
  audit.black_dragon_books_integrity.kpi_exists &&
  audit.black_dragon_books_integrity.dashboard_scope_correct &&
  audit.black_dragon_books_integrity.map_layer_valid &&
  numericZeroChecks.every(n => n === 0) &&

  Object.values(audit.black_dragon_client_bridge_integrity).every(Boolean) &&
  Object.values(audit.client_ui_integrity).every(Boolean) &&
  Object.values(audit.security_integrity).every(Boolean) &&
  Object.values(audit.checkpoint_integrity).every(Boolean) &&
  Object.values(audit.operational_score_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/security/audit/batch_036_full_nexus_platform_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
