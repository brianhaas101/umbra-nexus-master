const fs = require("fs");
const path = require("path");

const files = {
  store:
    "public/globe/clients/black_dragon/books/response_persistence_store.js",

  responseUi:
    "public/globe/clients/black_dragon/books/response_logging_ui.js",

  injection:
    "public/data/clients/black_dragon/books/audits/response_store_injection_report.v1.json"
};

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const store = readText(files.store);
const responseUi = readText(files.responseUi);
const injection = readJson(files.injection);

const audit = {
  version: "black_dragon_books_batch_055_response_persistence_audit_v1",
  generated_at: new Date().toISOString(),

  store_integrity: {
    defines_global:
      store.includes("window.BlackDragonBooksResponseStore"),

    uses_local_storage:
      store.includes("localStorage"),

    has_save_record:
      store.includes("saveRecord"),

    has_get_records:
      store.includes("getRecords"),

    has_export_records:
      store.includes("exportRecords"),

    has_clear_records:
      store.includes("clearRecords"),

    client_scoped:
      store.includes("black_dragon") &&
      store.includes("book_sales_v2")
  },

  bridge_integrity: {
    bridge_global:
      responseUi.includes("window.BlackDragonBooksResponsePersistence"),

    save_button_present:
      responseUi.includes("Save Response Locally"),

    export_button_present:
      responseUi.includes("Copy Local Response Backup"),

    store_reference_present:
      responseUi.includes("BlackDragonBooksResponseStore"),

    non_destructive:
      !responseUi.includes("fs.writeFileSync")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r => r.has_response_store)
  }
};

audit.pass =
  Object.values(audit.store_integrity).every(Boolean) &&
  Object.values(audit.bridge_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_055_response_persistence_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
