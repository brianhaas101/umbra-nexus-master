const fs = require("fs");

const ROOT = "public/data/clients/black_dragon";
const OUT = `${ROOT}/client_handoff_package.json`;

function read(p, fallback = null) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const readiness = read(`${ROOT}/launch_readiness_report.json`, {});
const shortlist = read(`${ROOT}/national_verified_outreach_shortlist.json`, { targets: [] });
const dossierIndex = read(`${ROOT}/client_dossier_index.json`, { index: [] });
const ui = read(`${ROOT}/operational_ui_state.json`, { summary: {} });

const handoff = {
  version: "black_dragon_client_handoff_package_v1",
  generated_at: new Date().toISOString(),
  client_key: "black_dragon",
  status: readiness.status || "UNKNOWN",
  summary: ui.summary || {},
  included_assets: {
    verified_outreach_targets: shortlist.targets.length,
    dossier_index: dossierIndex.index.length,
    operational_ui_state: true,
    runtime_integrity_audit: true,
    launch_readiness_report: true
  },
  client_visible_scope: [
    "Verified agency targets",
    "Phone-first contact paths",
    "Agency dossiers",
    "Training/command relevance",
    "Operational status tracking"
  ],
  internal_only_scope: [
    "Source validators",
    "Parser code",
    "Manual verification scripts",
    "Founder controls",
    "Raw source cache"
  ],
  next_client_actions: [
    "Begin calls with verified AZ batch.",
    "Log call outcomes in outreach_execution_log.json.",
    "Promote interested agencies into follow-up state.",
    "Continue CA verification toward 10 verified contacts."
  ]
};

fs.writeFileSync(OUT, JSON.stringify(handoff, null, 2));
console.log("[HANDOFF]", handoff.status, handoff.included_assets.verified_outreach_targets);
