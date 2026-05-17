const fs = require("fs");
const path = require("path");

const files = {
  runtime:
    "public/globe/clients/black_dragon/books/outreach_queue_actions.js",
  injection:
    "public/data/audits/hub/batch_059_queue_actions_injection_report.json",
  queueData:
    "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
};

function readText(file) {
  return fs.readFileSync(path.resolve(file), "utf8");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const runtime = readText(files.runtime);
const injection = readJson(files.injection);
const queueData = readJson(files.queueData);

const queueItems = queueData.all_queue_items || [];

const audit = {
  version: "umbra_batch_059_outreach_queue_action_audit_v1",
  generated_at: new Date().toISOString(),

  data_integrity: {
    queue_items_exist:
      queueItems.length > 0,

    has_subjects:
      queueItems.some(q => !!q.message_subject),

    has_messages:
      queueItems.some(q => !!q.message_body),

    has_ready_items:
      queueItems.some(q => q.queue_status === "READY"),

    missing_contact_route_items_exist:
      queueItems.some(q => !q.best_contact_route)
  },

  runtime_integrity: {
    global_present:
      runtime.includes("window.BlackDragonBooksQueueActions"),

    copy_subject_present:
      runtime.includes("copySubject"),

    copy_message_present:
      runtime.includes("copyMessage"),

    copy_contact_route_present:
      runtime.includes("copyContactRoute"),

    copy_full_outreach_present:
      runtime.includes("copyFullOutreach"),

    feedback_present:
      runtime.includes("showFeedback"),

    missing_contact_route_handling:
      runtime.includes("NO CONTACT ROUTE AVAILABLE"),

    selection_bus_bridge:
      runtime.includes("BlackDragonBooksSelectionBus"),

    debug_present:
      runtime.includes("getDebugState")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r =>
        r.has_outreach_queue_actions
      )
  }
};

audit.pass =
  Object.values(audit.data_integrity).every(Boolean) &&
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve("public/data/audits/hub/batch_059_outreach_queue_action_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
