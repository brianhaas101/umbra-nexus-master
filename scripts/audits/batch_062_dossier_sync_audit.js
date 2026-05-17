const fs = require("fs");
const path = require("path");

const runtime =
  fs.readFileSync(
    path.resolve(
      "public/globe/clients/black_dragon/books/dossier_sync_runtime.js"
    ),
    "utf8"
  );

const injection =
  JSON.parse(
    fs.readFileSync(
      path.resolve(
        "public/data/audits/hub/batch_062_dossier_sync_injection_report.json"
      ),
      "utf8"
    )
  );

const audit = {
  version:
    "umbra_batch_062_dossier_sync_audit_v1",

  generated_at:
    new Date().toISOString(),

  runtime_integrity: {
    global_present:
      runtime.includes("window.BlackDragonBooksDossierSync"),

    build_dossier_present:
      runtime.includes("function buildDossier"),

    sync_present:
      runtime.includes("function sync"),

    selection_bus_event_present:
      runtime.includes("umbra:blackDragonSelectionChanged"),

    map_event_present:
      runtime.includes("umbra:blackDragonBookTargetSelected"),

    global_target_present:
      runtime.includes("UMBRA_SELECTED_CLIENT_TARGET"),

    global_dossier_present:
      runtime.includes("UMBRA_SELECTED_DOSSIER"),

    intelligence_panel_refresh_present:
      runtime.includes("UmbraIntelligencePanel"),

    debug_present:
      runtime.includes("getDebugState")
  },

  injection_integrity: {
    entrypoints_checked:
      injection.report.length > 0,

    injected_everywhere:
      injection.report.every(r =>
        r.has_dossier_sync_runtime
      )
  }
};

audit.pass =
  Object.values(audit.runtime_integrity).every(Boolean) &&
  Object.values(audit.injection_integrity).every(Boolean);

fs.writeFileSync(
  path.resolve(
    "public/data/audits/hub/batch_062_dossier_sync_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
