const fs = require("fs");
const path = require("path");

const runtime = fs.readFileSync(
  path.resolve("public/globe/intelligence_panel_live_state.js"),
  "utf8"
);

const injection = JSON.parse(
  fs.readFileSync(
    path.resolve(
      "public/data/audits/hub/batch_057_intelligence_panel_injection_report.json"
    ),
    "utf8"
  )
);

const audit = {
  version: "umbra_batch_057_intelligence_panel_live_state_audit_v1",
  generated_at: new Date().toISOString(),

  runtime_integrity: {
    global_present:
      runtime.includes("window.UmbraIntelligencePanel"),

    status_function_present:
      runtime.includes("function getStatus"),

    mode_function_present:
      runtime.includes("function getMode"),

    dataset_function_present:
      runtime.includes("function getDatasetHash"),

    selection_function_present:
      runtime.includes("function getSelectedEntity"),

    node_count_present:
      runtime.includes("function getNodeCount"),

    render_loop_present:
      runtime.includes("setInterval(render, 1000)"),

    event_hooks_present:
      runtime.includes("umbra:moduleChanged") &&
      runtime.includes("umbra:blackDragonBookTargetSelected"),

    debug_state_present:
      runtime.includes("getDebugState")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r =>
        r.has_intelligence_panel_live_state
      )
  }
};

audit.pass =
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/audits/hub/batch_057_intelligence_panel_live_state_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
