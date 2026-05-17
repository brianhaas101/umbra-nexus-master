const fs = require("fs");
const path = require("path");

const files = {
  responseUi:
    "public/globe/clients/black_dragon/books/response_logging_ui.js",

  manifest:
    "public/data/clients/black_dragon/books/dashboard/response_logging_ui_manifest.v1.json",

  injectionReport:
    "public/data/clients/black_dragon/books/dashboard/response_logging_ui_injection_report.v1.json",

  queueData:
    "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",

  responsesData:
    "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
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

const uiText = read(files.responseUi);
const manifest = JSON.parse(read(files.manifest));
const injection = JSON.parse(read(files.injectionReport));
const queue = JSON.parse(read(files.queueData));
const responses = JSON.parse(read(files.responsesData));

const audit = {
  version: "black_dragon_books_batch_031_response_logging_ui_audit_v1",
  generated_at: new Date().toISOString(),

  file_checks,

  ui_integrity: {
    defines_global:
      uiText.includes("window.BlackDragonBooksResponseUI"),

    has_load:
      uiText.includes("function load"),

    has_render:
      uiText.includes("function render"),

    has_select_item:
      uiText.includes("selectItem"),

    has_payload_builder:
      uiText.includes("buildResultPayload"),

    has_copy_json_action:
      uiText.includes("Copy Response JSON"),

    has_generate_record_action:
      uiText.includes("Generate Response Record"),

    has_status_values:
      uiText.includes("STATUS_VALUES"),

    uses_frontend_security:
      uiText.includes("UmbraFrontendSecurity"),

    uses_dataset_security:
      uiText.includes("UmbraDatasetSecurity"),

    marks_response_panel:
      uiText.includes("data-response-log")
  },

  manifest_integrity: {
    required_script_declared:
      manifest.required_script.includes("response_logging_ui.js"),

    required_global_declared:
      manifest.required_global === "window.BlackDragonBooksResponseUI",

    functions_declared:
      manifest.required_functions.length === 6,

    actions_declared:
      manifest.client_actions.length === 2
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    all_checked_have_response_ui:
      injection.report.length > 0 &&
      injection.report.every(r => r.has_response_logging_ui)
  },

  data_integrity: {
    queue_exists:
      !!queue,

    all_queue_items_array:
      Array.isArray(queue.all_queue_items),

    responses_dataset_exists:
      !!responses,

    responses_array_exists:
      Array.isArray(responses.responses)
  }
};

audit.pass =
  file_checks.every(f => f.exists) &&
  Object.values(audit.ui_integrity).every(Boolean) &&
  Object.values(audit.manifest_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean) &&
  Object.values(audit.data_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_031_response_logging_ui_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
