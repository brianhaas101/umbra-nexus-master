const fs = require("fs");
const path = require("path");

const auditPath = path.resolve(
  "public/data/security/audit/batch_035_full_nexus_pre_pilot_audit.json"
);

const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));

const checkpoint = {
  version: "umbra_pre_black_dragon_live_client_access_checkpoint_v1",
  checkpoint_id: "PRE_BLACK_DRAGON_LIVE_CLIENT_ACCESS",
  generated_at: new Date().toISOString(),

  pass: audit.pass,

  client: {
    client_id: "black_dragon",
    access_mode: "CONTROLLED_CLIENT_PILOT",
    founder_tools_exposed: false,
    raw_exports_allowed: false,
    unrestricted_enterprise_access: false,
    multi_client_expansion_ready: false
  },

  validated_systems: {
    runtime_integrity: audit.runtime_integrity,
    security_integrity: audit.security_integrity,
    ui_integrity: audit.ui_integrity,
    black_dragon_data_integrity: audit.black_dragon_data_integrity,
    operational_alignment: audit.operational_alignment,
    checkpoint_integrity: audit.checkpoint_integrity
  },

  remaining_required_after_first_access: [
    "live Black Dragon usability test",
    "real outreach response density",
    "long-session browser stress testing",
    "multi-client validation with a real second client",
    "deeper CITY_MAP rendering integration"
  ]
};

fs.writeFileSync(
  path.resolve("public/data/security/prepilot/pre_black_dragon_live_client_access.json"),
  JSON.stringify(checkpoint, null, 2)
);

console.log(JSON.stringify({
  status: checkpoint.pass
    ? "PRE_BLACK_DRAGON_LIVE_CLIENT_ACCESS_CHECKPOINT_CREATED"
    : "PRE_BLACK_DRAGON_LIVE_CLIENT_ACCESS_CHECKPOINT_FAILED",
  checkpoint: "public/data/security/prepilot/pre_black_dragon_live_client_access.json",
  pass: checkpoint.pass
}, null, 2));

if (!checkpoint.pass) process.exit(1);
