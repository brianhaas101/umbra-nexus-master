const fs = require("fs");
const path = require("path");

const files = {
  renderer:
    "public/globe/clients/black_dragon/books/client_dashboard_renderer.js",

  manifest:
    "public/data/clients/black_dragon/books/dashboard/dashboard_ui_manifest.v1.json",

  injectionReport:
    "public/data/clients/black_dragon/books/dashboard/dashboard_renderer_injection_report.v1.json",

  dashboardData:
    "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json",

  widgetsData:
    "public/data/clients/black_dragon/books/dashboard/widgets/client_dashboard_widgets.v1.json",

  queueData:
    "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
};

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

function read(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

const file_checks = Object.entries(files).map(([key, file]) => ({
  key,
  file,
  exists: exists(file)
}));

const rendererText = read(files.renderer);
const manifest = JSON.parse(read(files.manifest));
const injection = JSON.parse(read(files.injectionReport));
const dashboard = JSON.parse(read(files.dashboardData));
const widgets = JSON.parse(read(files.widgetsData));
const queue = JSON.parse(read(files.queueData));

const audit = {
  version: "black_dragon_books_batch_029_dashboard_ui_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks,

  renderer_integrity: {
    defines_global:
      rendererText.includes("window.BlackDragonBooksDashboard"),

    has_load:
      rendererText.includes("function load"),

    has_render:
      rendererText.includes("function render"),

    has_debug_state:
      rendererText.includes("getDebugState"),

    uses_frontend_security:
      rendererText.includes("UmbraFrontendSecurity"),

    uses_dataset_security:
      rendererText.includes("UmbraDatasetSecurity"),

    marks_black_dragon_panel:
      rendererText.includes("data-black-dragon-books"),

    marks_outreach_queue:
      rendererText.includes("data-outreach-queue")
  },

  manifest_integrity: {
    required_script_declared:
      manifest.required_script.includes("client_dashboard_renderer.js"),

    required_global_declared:
      manifest.required_global === "window.BlackDragonBooksDashboard",

    functions_declared:
      manifest.required_functions.length === 3,

    data_sources_declared:
      manifest.data_sources.length === 3
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    all_checked_have_renderer:
      injection.report.length > 0 &&
      injection.report.every(r => r.has_dashboard_renderer)
  },

  data_integrity: {
    dashboard_client_black_dragon:
      dashboard.client.client_id === "black_dragon",

    widgets_available:
      Array.isArray(widgets.widgets) &&
      widgets.widgets.length > 0,

    queue_available:
      Array.isArray(queue.all_queue_items),

    top_actions_available:
      Array.isArray(dashboard.top_operational_actions)
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.renderer_integrity).every(Boolean) &&
  Object.values(audit.manifest_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean) &&
  Object.values(audit.data_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_029_dashboard_ui_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
