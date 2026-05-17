const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const readinessPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/candidates/manual_outreach_readiness.json"
);

const readiness = JSON.parse(fs.readFileSync(readinessPath, "utf8"));

const approvalQueue = readiness.manual_outreach_candidates.map((row, index) => ({
  founder_approval_id:
    `BD_FOUNDER_OUTREACH_APPROVAL_${String(index + 1).padStart(4, "0")}`,

  manual_outreach_record_id:
    row.manual_outreach_record_id,

  verified_contact_route_id:
    row.verified_contact_route_id,

  organization_name:
    row.organization_name,

  official_contact_page_url:
    row.official_contact_page_url,

  official_contact_route:
    row.official_contact_route,

  official_contact_route_type:
    row.official_contact_route_type,

  official_contact_person_or_role:
    row.official_contact_person_or_role,

  founder_approved_for_manual_send:
    false,

  founder_approval_status:
    "PENDING_FOUNDER_APPROVAL",

  approval_note:
    null,

  approved_at:
    null,

  outreach_allowed:
    false,

  automated_send_allowed:
    false,

  promotion_allowed:
    false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/approvals/founder_manual_outreach_approval_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_founder_manual_outreach_approval_queue_v1",
  generated_at: new Date().toISOString(),
  total_approval_items: approvalQueue.length,
  approval_queue: approvalQueue
}, null, 2));

console.log(JSON.stringify({
  status: "FOUNDER_MANUAL_OUTREACH_APPROVAL_QUEUE_COMPLETE",
  total_approval_items: approvalQueue.length,
  output: out
}, null, 2));
