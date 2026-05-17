const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const readinessPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/candidates/manual_outreach_readiness.json"
);

const readiness = JSON.parse(
  fs.readFileSync(readinessPath, "utf8")
);

const gate = readiness.manual_outreach_candidates.map(
  row => ({

    manual_outreach_record_id:
      row.manual_outreach_record_id,

    verified_contact_route_id:
      row.verified_contact_route_id,

    organization_name:
      row.organization_name,

    founder_send_approval:
      false,

    automated_send_allowed:
      false,

    outreach_execution_mode:
      "MANUAL_ONLY",

    founder_review_required:
      true
  })
);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/review_queue/founder_manual_send_gate.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_founder_manual_send_gate_v1",

  generated_at:
    new Date().toISOString(),

  total_records:
    gate.length,

  gate_records:
    gate

}, null, 2));

console.log(JSON.stringify({
  status:
    "FOUNDER_MANUAL_SEND_GATE_COMPLETE",

  total_records:
    gate.length,

  output:
    out

}, null, 2));
