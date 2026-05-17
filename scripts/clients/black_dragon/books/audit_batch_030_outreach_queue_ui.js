const fs = require("fs");
const path = require("path");

const files = {
  queueUi:
    "public/globe/clients/black_dragon/books/outreach_queue_ui.js",

  manifest:
    "public/data/clients/black_dragon/books/dashboard/outreach_queue_ui_manifest.v1.json",

  injectionReport:
    "public/data/clients/black_dragon/books/dashboard/outreach_queue_ui_injection_report.v1.json",

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

const uiText = read(files.queueUi);
const manifest = JSON.parse(read(files.manifest));
const injection = JSON.parse(read(files.injectionReport));
const queue = JSON.parse(read(files.queueData));

const audit = {
  version: "black_dragon_books_batch_030_outreach_queue_ui_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks,

  ui_integrity: {
    defines_global:
      uiText.includes("window.BlackDragonBooksQueueUI"),

    has_load:
      uiText.includes("function load"),

    has_render:
      uiText.includes("function render"),

    has_select_item:
      uiText.includes("selectItem"),

    has_copy_text:
      uiText.includes("copyText"),

    has_copy_subject_action:
      uiText.includes("Copy Subject"),

    has_copy_message_action:
      uiText.includes("Copy Message"),

    has_copy_full_outreach_action:
      uiText.includes("Copy Full Outreach"),

    has_copy_contact_route_action:
      uiText.includes("Copy Contact Route"),

    uses_frontend_security:
      uiText.includes("UmbraFrontendSecurity"),

    uses_dataset_security:
      uiText.includes("UmbraDatasetSecurity"),

    marks_outreach_panel:
      uiText.includes("data-outreach-queue")
  },

  manifest_integrity: {
    required_script_declared:
      manifest.required_script.includes("outreach_queue_ui.js"),

    required_global_declared:
      manifest.required_global === "window.BlackDragonBooksQueueUI",

    functions_declared:
      manifest.required_functions.length === 5,

    actions_declared:
      manifest.client_actions.length === 4
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    all_checked_have_queue_ui:
      injection.report.length > 0 &&
      injection.report.every(r => r.has_outreach_queue_ui)
  },

  queue_data_integrity: {
    queue_exists:
      !!queue,

    all_queue_items_array:
      Array.isArray(queue.all_queue_items),

    has_ready_or_enrichment_items:
      Array.isArray(queue.all_queue_items) &&
      queue.all_queue_items.length > 0
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.ui_integrity).every(Boolean) &&
  Object.values(audit.manifest_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean) &&
  Object.values(audit.queue_data_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_030_outreach_queue_ui_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
