const fs = require("fs");
const path = require("path");

const checks = {
  commandDeck:
    "public/globe/command_deck_runtime.js",

  intelligencePanel:
    "public/globe/intelligence_panel_live_state.js",

  queueActions:
    "public/globe/clients/black_dragon/books/outreach_queue_actions.js",

  responseStore:
    "public/globe/clients/black_dragon/books/response_persistence_store.js",

  responseWorkflow:
    "public/globe/clients/black_dragon/books/response_workflow_runtime.js",

  selectionBus:
    "public/globe/clients/black_dragon/books/book_selection_bus.js",

  dossierSync:
    "public/globe/clients/black_dragon/books/dossier_sync_runtime.js",

  layerControls:
    "public/globe/clients/black_dragon/books/book_layer_controls.js",

  cityMapRenderer:
    "public/globe/clients/black_dragon/books/book_citymap_renderer.js",

  clusterRenderer:
    "public/globe/clients/black_dragon/books/book_cluster_renderer.js",

  pathRenderer:
    "public/globe/clients/black_dragon/books/book_path_renderer.js",

  movementPerformance:
    "public/globe/performance/movement_performance_mode.js",

  adaptivePostfx:
    "public/globe/performance/adaptive_postfx_performance_mode.js",

  resizeThrottle:
    "public/globe/performance/postfx_resize_throttle.js",

  finalAccess:
    "public/data/security/platform/final_post_expansion_client_access_checkpoint.json",

  batch054:
    "public/data/audits/hub/batch_054_hub_interaction_empty_state_audit.json",

  batch055:
    "public/data/clients/black_dragon/books/audits/batch_055_response_persistence_audit.json",

  batch056:
    "public/data/audits/hub/batch_056_command_deck_audit.json",

  batch057:
    "public/data/audits/hub/batch_057_intelligence_panel_live_state_audit.json",

  batch058:
    "public/data/audits/hub/batch_058_selection_sync_audit.json",

  batch059:
    "public/data/audits/hub/batch_059_outreach_queue_action_audit.json",

  batch060:
    "public/data/audits/hub/batch_060_response_workflow_audit.json",

  batch061:
    "public/data/audits/hub/batch_061_layer_controls_audit.json",

  batch062:
    "public/data/audits/hub/batch_062_dossier_sync_audit.json"
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

function safeJson(file) {
  try {
    return exists(file) ? readJson(file) : null;
  } catch (err) {
    return null;
  }
}

function safeText(file) {
  try {
    return exists(file) ? readText(file) : "";
  } catch (err) {
    return "";
  }
}

const text = Object.fromEntries(
  Object.entries(checks).map(([k, f]) => [k, safeText(f)])
);

const json = {
  finalAccess: safeJson(checks.finalAccess),
  batch054: safeJson(checks.batch054),
  batch055: safeJson(checks.batch055),
  batch056: safeJson(checks.batch056),
  batch057: safeJson(checks.batch057),
  batch058: safeJson(checks.batch058),
  batch059: safeJson(checks.batch059),
  batch060: safeJson(checks.batch060),
  batch061: safeJson(checks.batch061),
  batch062: safeJson(checks.batch062)
};

const audit = {
  version: "umbra_batch_063_final_hub_perfection_audit_v1",
  generated_at: new Date().toISOString(),

  file_integrity: Object.fromEntries(
    Object.entries(checks).map(([k, f]) => [k, exists(f)])
  ),

  repaired_surface_integrity: {
    command_deck_runtime:
      text.commandDeck.includes("window.UmbraCommandDeck") &&
      text.commandDeck.includes("umbra:moduleChanged"),

    intelligence_panel_runtime:
      text.intelligencePanel.includes("window.UmbraIntelligencePanel") &&
      text.intelligencePanel.includes("function getNodeCount"),

    queue_actions_runtime:
      text.queueActions.includes("window.BlackDragonBooksQueueActions") &&
      text.queueActions.includes("NO CONTACT ROUTE AVAILABLE") &&
      text.queueActions.includes("showFeedback"),

    response_store_runtime:
      text.responseStore.includes("window.BlackDragonBooksResponseStore") &&
      text.responseStore.includes("localStorage") &&
      text.responseStore.includes("saveRecord"),

    response_workflow_runtime:
      text.responseWorkflow.includes("window.BlackDragonBooksResponseWorkflow") &&
      text.responseWorkflow.includes("buildResponseRecord") &&
      text.responseWorkflow.includes("saveGeneratedRecord"),

    selection_bus_runtime:
      text.selectionBus.includes("window.BlackDragonBooksSelectionBus") &&
      text.selectionBus.includes("umbra:blackDragonSelectionChanged"),

    dossier_sync_runtime:
      text.dossierSync.includes("window.BlackDragonBooksDossierSync") &&
      text.dossierSync.includes("UMBRA_SELECTED_DOSSIER") &&
      text.dossierSync.includes("DIRECT_EXPORT_LOCK"),

    layer_controls_runtime:
      text.layerControls.includes("black_dragon_books_layer_controls_v2_batch_061") &&
      text.layerControls.includes("setLayerVisible") &&
      text.layerControls.includes("getLayerVisible"),

    map_renderer_optimized:
      text.cityMapRenderer.includes("batch_048") &&
      text.cityMapRenderer.includes("world_node_limit") &&
      text.cityMapRenderer.includes("world_pulses_enabled: false") &&
      text.cityMapRenderer.includes("world_halos_enabled: false"),

    movement_performance_runtime:
      text.movementPerformance.includes("umbra_movement_performance_v3_batch_053") &&
      text.movementPerformance.includes("hardMovementMode"),

    postfx_performance_runtime:
      text.adaptivePostfx.includes("window.UmbraPerformanceMode") &&
      text.resizeThrottle.includes("window.UmbraPostFXResizeThrottle")
  },

  prior_audit_integrity: {
    final_access_pass:
      json.finalAccess?.pass === true,

    batch054_pass:
      json.batch054?.pass === true,

    batch055_pass:
      json.batch055?.pass === true,

    batch056_pass:
      json.batch056?.pass === true,

    batch057_pass:
      json.batch057?.pass === true,

    batch058_pass:
      json.batch058?.pass === true,

    batch059_pass:
      json.batch059?.pass === true,

    batch060_pass:
      json.batch060?.pass === true,

    batch061_pass:
      json.batch061?.pass === true,

    batch062_pass:
      json.batch062?.pass === true
  },

  expected_runtime_console_checks: [
    "window.UmbraCommandDeck.getDebugState()",
    "window.UmbraIntelligencePanel.getDebugState()",
    "window.BlackDragonBooksLayerControls.getDebugState()",
    "window.BlackDragonBooksSelectionBus.getDebugState()",
    "window.BlackDragonBooksDossierSync.getDebugState()",
    "window.BlackDragonBooksQueueActions.getDebugState()",
    "window.BlackDragonBooksResponseWorkflow.getDebugState()",
    "window.BlackDragonBooksResponseStore.getDebugState()",
    "window.UmbraMovementPerformance.getDebugState()",
    "window.UmbraGlobe.getPostFXDebug()"
  ]
};

audit.pass =
  Object.values(audit.file_integrity).every(Boolean) &&
  Object.values(audit.repaired_surface_integrity).every(Boolean) &&
  Object.values(audit.prior_audit_integrity).every(Boolean);

audit.findings = [];

if (!audit.pass) {
  for (const [k, v] of Object.entries(audit.file_integrity)) {
    if (!v) audit.findings.push({ area: "file_integrity", key: k });
  }

  for (const [k, v] of Object.entries(audit.repaired_surface_integrity)) {
    if (!v) audit.findings.push({ area: "repaired_surface_integrity", key: k });
  }

  for (const [k, v] of Object.entries(audit.prior_audit_integrity)) {
    if (!v) audit.findings.push({ area: "prior_audit_integrity", key: k });
  }
}

fs.writeFileSync(
  path.resolve("public/data/audits/hub/batch_063_final_hub_perfection_audit.json"),
  JSON.stringify(audit, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/audits/hub/batch_063_final_hub_perfection_checkpoint.json"),
  JSON.stringify({
    checkpoint: "FINAL_HUB_PERFECTION_AUDIT",
    generated_at: new Date().toISOString(),
    pass: audit.pass,
    findings: audit.findings
  }, null, 2)
);

console.log(JSON.stringify({
  status: "BATCH_063_FINAL_HUB_PERFECTION_AUDIT_COMPLETE",
  pass: audit.pass,
  findings: audit.findings,
  checkpoint:
    "public/data/audits/hub/batch_063_final_hub_perfection_checkpoint.json"
}, null, 2));

if (!audit.pass) process.exit(1);
