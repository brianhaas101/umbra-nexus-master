const fs = require("fs");
const path = require("path");

const files = {
  rootIndex: "index.html",
  publicIndex: "public/index.html",
  globeIndex: "public/globe/index.html",

  ui: "public/globe/ui.js",
  core: "public/globe/core.js",
  cityMap: "public/globe/city_map.js",
  interaction: "public/globe/interaction.js",
  dataLoader: "public/globe/data_loader.js",
  dossiers: "public/globe/dossiers.js",

  dashboardRenderer:
    "public/globe/clients/black_dragon/books/client_dashboard_renderer.js",

  queueUi:
    "public/globe/clients/black_dragon/books/outreach_queue_ui.js",

  responseUi:
    "public/globe/clients/black_dragon/books/response_logging_ui.js",

  mapNodes:
    "public/globe/clients/black_dragon/books/book_map_nodes_runtime.js",

  cityMapRenderer:
    "public/globe/clients/black_dragon/books/book_citymap_renderer.js",

  clusterRenderer:
    "public/globe/clients/black_dragon/books/book_cluster_renderer.js",

  pathRenderer:
    "public/globe/clients/black_dragon/books/book_path_renderer.js",

  layerControls:
    "public/globe/clients/black_dragon/books/book_layer_controls.js",

  performancePostfx:
    "public/globe/performance/adaptive_postfx_performance_mode.js",

  performanceMovement:
    "public/globe/performance/movement_performance_mode.js",

  performanceResize:
    "public/globe/performance/postfx_resize_throttle.js",

  dashboardData:
    "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json",

  widgetsData:
    "public/data/clients/black_dragon/books/dashboard/widgets/client_dashboard_widgets.v1.json",

  queueData:
    "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",

  responseData:
    "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json",

  controlsData:
    "public/data/clients/black_dragon/books/map/controls/citymap_layer_controls.v1.json",

  finalAccess:
    "public/data/security/platform/final_post_expansion_client_access_checkpoint.json"
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

function maybeText(file) {
  return exists(file) ? readText(file) : "";
}

function maybeJson(file) {
  try {
    return exists(file) ? readJson(file) : null;
  } catch (err) {
    return null;
  }
}

function hasAny(text, tokens) {
  return tokens.some(t => text.includes(t));
}

function hasAll(text, tokens) {
  return tokens.every(t => text.includes(t));
}

const texts = {};
for (const [key, file] of Object.entries(files)) {
  if (file.endsWith(".js") || file.endsWith(".html")) {
    texts[key] = maybeText(file);
  }
}

const dashboard = maybeJson(files.dashboardData);
const widgets = maybeJson(files.widgetsData);
const queue = maybeJson(files.queueData);
const responses = maybeJson(files.responseData);
const controls = maybeJson(files.controlsData);
const finalAccess = maybeJson(files.finalAccess);

const htmlFiles = ["rootIndex", "publicIndex", "globeIndex"]
  .filter(k => exists(files[k]))
  .map(k => ({
    key: k,
    file: files[k],
    text: maybeText(files[k])
  }));

const expectedScripts = [
  "/globe/clients/black_dragon/books/client_dashboard_renderer.js",
  "/globe/clients/black_dragon/books/outreach_queue_ui.js",
  "/globe/clients/black_dragon/books/response_logging_ui.js",
  "/globe/clients/black_dragon/books/book_map_nodes_runtime.js",
  "/globe/clients/black_dragon/books/book_citymap_renderer.js",
  "/globe/clients/black_dragon/books/book_cluster_renderer.js",
  "/globe/clients/black_dragon/books/book_path_renderer.js",
  "/globe/clients/black_dragon/books/book_layer_controls.js",
  "/globe/performance/adaptive_postfx_performance_mode.js",
  "/globe/performance/movement_performance_mode.js"
];

const audit = {
  version: "umbra_batch_054_hub_interaction_empty_state_audit_v1",
  generated_at: new Date().toISOString(),
  audit_type: "READ_ONLY_INTERACTION_AND_EMPTY_STATE_DISCOVERY",

  file_integrity: Object.fromEntries(
    Object.entries(files).map(([key, file]) => [key, exists(file)])
  ),

  entrypoint_integrity: {
    entrypoints_found: htmlFiles.length,
    expected_scripts_missing_by_entrypoint: htmlFiles.map(entry => ({
      entrypoint: entry.file,
      missing: expectedScripts.filter(script => !entry.text.includes(script))
    })),
    all_existing_entrypoints_have_expected_scripts:
      htmlFiles.length > 0 &&
      htmlFiles.every(entry =>
        expectedScripts.every(script => entry.text.includes(script))
      )
  },

  command_deck_interaction: {
    access_label_present:
      hasAny(texts.ui || "", ["ACCESS", "Access"]),

    profile_label_present:
      hasAny(texts.ui || "", ["PROFILE", "Profile"]),

    account_label_present:
      hasAny(texts.ui || "", ["ACCOUNT", "Account"]),

    leads_engine_label_present:
      hasAny(texts.ui || "", ["Leads Engine", "LEADS_ENGINE"]),

    clients_label_present:
      hasAny(texts.ui || "", ["Clients", "CLIENTS"]),

    operations_label_present:
      hasAny(texts.ui || "", ["Operations", "OPERATIONS"]),

    safeguards_label_present:
      hasAny(texts.ui || "", ["Safeguards", "SAFEGUARDS"]),

    button_click_handlers_detected:
      hasAny(texts.ui || "", ["addEventListener", "onclick", "switchHub", "setActiveModule"]),

    active_module_state_detected:
      hasAny(texts.ui || "", ["activeModule", "ACTIVE_MODULE", "selectedHub"])
  },

  intelligence_panel_integrity: {
    status_present:
      hasAny(texts.ui || "", ["SYSTEM STATUS", "system status", "status"]),

    mode_present:
      hasAny(texts.ui || "", ["MODE", "mode"]),

    dataset_present:
      hasAny(texts.ui || "", ["DATASET", "datasetHash", "dataset"]),

    selection_present:
      hasAny(texts.ui || "", ["SELECTION", "selection"]),

    region_present:
      hasAny(texts.ui || "", ["REGION", "region"]),

    coordinates_present:
      hasAny(texts.ui || "", ["COORDINATES", "coordinates"]),

    nodes_present:
      hasAny(texts.ui || "", ["NODES", "nodes"]),

    live_update_hooks_detected:
      hasAny(texts.ui || "", ["render", "update", "refresh", "state.mode", "activeCityId"])
  },

  globe_interaction_integrity: {
    world_mode_present:
      hasAny(texts.core || "", ["WORLD"]),

    city_map_mode_present:
      hasAny(texts.core || "", ["CITY_MAP"]),

    city_map_ready_logic_present:
      hasAny(texts.cityMap || "", ["READY", "cityMap", "nodeGroup"]),

    interaction_pick_trace_present:
      hasAny(texts.interaction || "", ["PICK", "FOCUS", "raycaster", "entityNode"]),

    dossier_sync_present:
      hasAny(texts.dossiers || "", ["dossier", "selected", "entity"])
  },

  black_dragon_dashboard_integrity: {
    data_exists:
      !!dashboard,

    client_scope:
      dashboard?.client?.client_id === "black_dragon",

    operator_mode_client_safe:
      dashboard?.client?.operator_mode === "CLIENT_SAFE",

    widgets_exist:
      Array.isArray(widgets?.widgets) && widgets.widgets.length >= 5,

    renderer_global_present:
      hasAny(texts.dashboardRenderer || "", ["window.BlackDragonBooksDashboard"]),

    renderer_fetches_data:
      hasAny(texts.dashboardRenderer || "", ["fetch", "guardedFetch"]),

    renderer_mounts_dom:
      hasAny(texts.dashboardRenderer || "", ["appendChild", "innerHTML", "render"]),

    empty_state_handling_detected:
      hasAny(texts.dashboardRenderer || "", ["No ", "empty", "length"])
  },

  outreach_queue_integrity: {
    queue_exists:
      !!queue,

    queue_items:
      Array.isArray(queue?.all_queue_items) ? queue.all_queue_items.length : 0,

    ready_items:
      Array.isArray(queue?.ready_queue) ? queue.ready_queue.length : 0,

    renderer_global_present:
      hasAny(texts.queueUi || "", ["window.BlackDragonBooksQueueUI"]),

    copy_actions_present:
      hasAll(texts.queueUi || "", [
        "Copy Subject",
        "Copy Message",
        "Copy Full Outreach",
        "Copy Contact Route"
      ]),

    selection_list_present:
      hasAny(texts.queueUi || "", ["renderList", "selected", "active"]),

    empty_state_handling_detected:
      hasAny(texts.queueUi || "", ["No ", "empty", "length"])
  },

  response_logging_integrity: {
    response_data_exists:
      !!responses,

    response_records_array:
      Array.isArray(responses?.responses),

    renderer_global_present:
      hasAny(texts.responseUi || "", ["window.BlackDragonBooksResponseUI"]),

    generate_action_present:
      hasAny(texts.responseUi || "", ["Generate Response Record"]),

    copy_json_present:
      hasAny(texts.responseUi || "", ["Copy Response JSON"]),

    form_fields_present:
      hasAll(texts.responseUi || "", [
        "response",
        "books",
        "revenue",
        "notes"
      ]),

    persistence_warning:
      !hasAny(texts.responseUi || "", ["fs.writeFileSync", "POST", "localStorage"])
  },

  map_layer_controls_integrity: {
    controls_exist:
      !!controls,

    has_targets_layer:
      Array.isArray(controls?.layers) &&
      controls.layers.some(l => l.layer_id === "BOOK_TARGETS"),

    has_clusters_layer:
      Array.isArray(controls?.layers) &&
      controls.layers.some(l => l.layer_id === "REGIONAL_CLUSTERS"),

    has_paths_layer:
      Array.isArray(controls?.layers) &&
      controls.layers.some(l => l.layer_id === "PROPAGATION_PATHS"),

    controls_global_present:
      hasAny(texts.layerControls || "", ["window.BlackDragonBooksLayerControls"]),

    set_layer_visible_exposed:
      hasAny(texts.layerControls || "", ["G.setLayerVisible", "setLayerVisible"]),

    get_layer_visible_exposed:
      hasAny(texts.layerControls || "", ["G.getLayerVisible", "getLayerVisible"])
  },

  performance_runtime_integrity: {
    adaptive_postfx_present:
      hasAny(texts.performancePostfx || "", ["window.UmbraPerformanceMode"]),

    movement_performance_present:
      hasAny(texts.performanceMovement || "", ["window.UmbraMovementPerformance"]),

    hard_movement_mode_present:
      hasAny(texts.performanceMovement || "", ["hardMovementMode"]),

    resize_throttle_present:
      hasAny(texts.performanceResize || "", ["window.UmbraPostFXResizeThrottle"])
  },

  access_checkpoint_integrity: {
    final_access_exists:
      !!finalAccess,

    final_access_passed:
      finalAccess?.pass === true,

    final_access_targets:
      finalAccess?.totals?.operational_targets || 0
  }
};

audit.findings = [];

function addFinding(severity, area, issue, recommendation) {
  audit.findings.push({
    severity,
    area,
    issue,
    recommendation
  });
}

if (!audit.entrypoint_integrity.all_existing_entrypoints_have_expected_scripts) {
  addFinding(
    "HIGH",
    "Entrypoints",
    "One or more HTML entrypoints is missing expected runtime/client/performance scripts.",
    "Normalize script injection across active entrypoints only."
  );
}

if (!audit.command_deck_interaction.button_click_handlers_detected) {
  addFinding(
    "HIGH",
    "Command Deck",
    "Navigation labels exist but click/module switching handlers are not clearly detectable.",
    "Wire Command Deck buttons to deterministic active-module state."
  );
}

if (audit.response_logging_integrity.persistence_warning) {
  addFinding(
    "MEDIUM",
    "Response Logging",
    "Response logging appears to generate/copy records, but durable persistence is not detected.",
    "Decide whether response records are copy-only for pilot or should persist locally/server-side."
  );
}

if (!audit.map_layer_controls_integrity.set_layer_visible_exposed) {
  addFinding(
    "HIGH",
    "Map Layer Controls",
    "Layer control visibility setter is not clearly exposed.",
    "Repair BlackDragonBooksLayerControls.setLayerVisible binding."
  );
}

if (!audit.map_layer_controls_integrity.get_layer_visible_exposed) {
  addFinding(
    "MEDIUM",
    "Map Layer Controls",
    "Layer control visibility getter is not clearly exposed.",
    "Repair BlackDragonBooksLayerControls.getLayerVisible binding."
  );
}

if (!audit.performance_runtime_integrity.hard_movement_mode_present) {
  addFinding(
    "MEDIUM",
    "Movement Performance",
    "Hard movement mode not detected.",
    "Confirm Batch 053 remained installed after refresh."
  );
}

audit.pass =
  audit.file_integrity.ui &&
  audit.file_integrity.core &&
  audit.file_integrity.dataLoader &&
  audit.black_dragon_dashboard_integrity.data_exists &&
  audit.outreach_queue_integrity.queue_items > 0 &&
  audit.response_logging_integrity.renderer_global_present &&
  audit.map_layer_controls_integrity.controls_exist &&
  audit.access_checkpoint_integrity.final_access_passed &&
  audit.findings.filter(f => f.severity === "HIGH").length === 0;

const out = path.resolve(
  "public/data/audits/hub/batch_054_hub_interaction_empty_state_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_054_HUB_INTERACTION_EMPTY_STATE_AUDIT_COMPLETE",
  pass: audit.pass,
  high_findings: audit.findings.filter(f => f.severity === "HIGH").length,
  medium_findings: audit.findings.filter(f => f.severity === "MEDIUM").length,
  findings: audit.findings,
  output: "public/data/audits/hub/batch_054_hub_interaction_empty_state_audit.json"
}, null, 2));

if (!audit.pass) process.exit(1);
