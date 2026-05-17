const fs = require("fs");
const path = require("path");

const files = {
  bus:
    "public/globe/clients/black_dragon/books/book_selection_bus.js",
  queue:
    "public/globe/clients/black_dragon/books/outreach_queue_ui.js",
  response:
    "public/globe/clients/black_dragon/books/response_logging_ui.js",
  injection:
    "public/data/audits/hub/batch_058_selection_bus_injection_report.json"
};

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const bus = readText(files.bus);
const queue = readText(files.queue);
const response = readText(files.response);
const injection = readJson(files.injection);

const audit = {
  version: "umbra_batch_058_selection_sync_audit_v1",
  generated_at: new Date().toISOString(),

  bus_integrity: {
    global_present:
      bus.includes("window.BlackDragonBooksSelectionBus"),
    select_present:
      bus.includes("function select"),
    event_present:
      bus.includes("umbra:blackDragonSelectionChanged"),
    map_event_bridge_present:
      bus.includes("umbra:blackDragonBookTargetSelected"),
    debug_present:
      bus.includes("getDebugState")
  },

  bridge_integrity: {
    queue_bridge_present:
      queue.includes("BATCH_058_QUEUE_SELECTION_BUS_BRIDGE"),
    response_bridge_present:
      response.includes("BATCH_058_RESPONSE_SELECTION_BUS_BRIDGE"),
    queue_debug_patched:
      queue.includes("selection_bus_active"),
    response_debug_patched:
      response.includes("selection_bus_active")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,
    injected_everywhere:
      injection.report.every(r => r.has_selection_bus)
  }
};

audit.pass =
  Object.values(audit.bus_integrity).every(Boolean) &&
  Object.values(audit.bridge_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/audits/hub/batch_058_selection_sync_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
