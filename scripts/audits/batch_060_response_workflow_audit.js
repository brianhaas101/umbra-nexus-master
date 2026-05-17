const fs = require("fs");
const path = require("path");

const runtime =
  fs.readFileSync(
    path.resolve(
      "public/globe/clients/black_dragon/books/response_workflow_runtime.js"
    ),
    "utf8"
  );

const injection =
  JSON.parse(
    fs.readFileSync(
      path.resolve(
        "public/data/audits/hub/batch_060_response_workflow_injection_report.json"
      ),
      "utf8"
    )
  );

const audit = {
  version:
    "umbra_batch_060_response_workflow_audit_v1",

  generated_at:
    new Date().toISOString(),

  runtime_integrity: {
    global_present:
      runtime.includes("window.BlackDragonBooksResponseWorkflow"),

    build_record_present:
      runtime.includes("buildResponseRecord"),

    save_record_present:
      runtime.includes("saveGeneratedRecord"),

    export_present:
      runtime.includes("exportResponses"),

    clipboard_present:
      runtime.includes("copyLatestResponseJson"),

    selection_sync_present:
      runtime.includes("getSelection"),

    persistence_present:
      runtime.includes("BlackDragonBooksResponseStore"),

    event_present:
      runtime.includes("umbra:blackDragonResponseGenerated"),

    debug_present:
      runtime.includes("getDebugState")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r =>
        r.has_response_workflow_runtime
      )
  }
};

audit.pass =
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/audits/hub/batch_060_response_workflow_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
