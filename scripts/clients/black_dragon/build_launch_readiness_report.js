const fs = require("fs");

const AUDIT = "public/data/clients/black_dragon/black_dragon_full_account_audit.json";
const OUT = "public/data/clients/black_dragon/launch_readiness_report.json";

const audit = JSON.parse(fs.readFileSync(AUDIT, "utf8"));

const report = {
  version: "black_dragon_launch_readiness_report_v1",
  generated_at: new Date().toISOString(),
  status: audit.status === "PASS" ? "LAUNCH_READY_FOR_CONTROLLED_PILOT" : "NOT_READY",
  client_key: "black_dragon",
  readiness_summary: {
    verified_targets: audit.counts.national_verified_targets,
    dossiers: audit.counts.dossiers,
    globe_nodes: audit.counts.globe_nodes,
    states_active: ["AZ", "CA"],
    pilot_scope: "Controlled outreach pilot, verified contacts only."
  },
  hard_rules: [
    "No unverified contacts may enter outreach.",
    "No guessed emails.",
    "Phone-first official routing is allowed.",
    "Dossiers must derive from normalized verified intelligence outputs.",
    "Globe nodes must use declared geospatial cache, not pseudo-random coordinates."
  ],
  remaining_before_full_national_scale: [
    "Finish CA to 10 verified contacts.",
    "Build TX connector and verification queue.",
    "Build FL connector and verification queue.",
    "Build GA connector and verification queue.",
    "Wire budget, procurement, behavioral, and incident/risk layers."
  ]
};

fs.writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log("[LAUNCH]", report.status);
