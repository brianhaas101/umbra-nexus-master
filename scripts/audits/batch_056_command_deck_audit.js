const fs = require("fs");
const path = require("path");

const runtime =
  fs.readFileSync(
    path.resolve("public/globe/command_deck_runtime.js"),
    "utf8"
  );

const injection =
  JSON.parse(
    fs.readFileSync(
      path.resolve(
        "public/data/audits/hub/batch_056_command_deck_injection_report.json"
      ),
      "utf8"
    )
  );

const audit = {
  version:
    "umbra_batch_056_command_deck_audit_v1",

  generated_at:
    new Date().toISOString(),

  runtime_integrity: {
    global_present:
      runtime.includes("window.UmbraCommandDeck"),

    active_state_present:
      runtime.includes("applyActiveState"),

    module_dispatch_present:
      runtime.includes("umbra:moduleChanged"),

    visual_state_present:
      runtime.includes("umbra-commanddeck-active"),

    debug_state_present:
      runtime.includes("getDebugState"),

    module_aliases_present:
      runtime.includes("LEADS_ENGINE") &&
      runtime.includes("CLIENTS") &&
      runtime.includes("OPERATIONS") &&
      runtime.includes("SAFEGUARDS")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r =>
        r.has_command_deck_runtime
      )
  }
};

audit.pass =
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/audits/hub/batch_056_command_deck_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
