const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const readinessPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/candidates/manual_outreach_readiness.json"
);

const readiness = JSON.parse(fs.readFileSync(readinessPath, "utf8"));

const workflow = readiness.manual_outreach_candidates.map((row, index) => ({
  client_contact_workflow_id:
    `BD_CLIENT_CONTACT_WORKFLOW_${String(index + 1).padStart(4, "0")}`,

  client_id:
    "black_dragon_omg_cert_v1",

  client_account:
    "BLACK_DRAGON",

  assigned_client_user_id:
    null,

  assigned_sales_role:
    "CLIENT_SALES_TEAM",

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

  client_action_status:
    "AVAILABLE_FOR_CLIENT_REVIEW",

  client_authorized_for_manual_contact:
    false,

  manual_contact_allowed:
    false,

  automated_contact_allowed:
    false,

  founder_integrity_lock:
    true,

  founder_contact_approval_required:
    false,

  verified_route_required:
    true,

  dossier_visible_to_client:
    true,

  city_map_node_visible_to_client:
    true,

  promotion_allowed:
    false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/approvals/client_manual_contact_workflow.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_client_manual_contact_workflow_v1",
  generated_at: new Date().toISOString(),
  repair_batch: "108_REPAIR_CLIENT_CONTROLLED_MANUAL_OUTREACH",
  policy: {
    client_controls_contact_selection: true,
    founder_controls_integrity_and_permissions: true,
    verified_route_required: true,
    automated_outreach_forbidden: true,
    manual_contact_logging_required: true,
    dossier_and_map_visibility_required: true
  },
  total_client_contact_records: workflow.length,
  client_contact_workflow: workflow
}, null, 2));

console.log(JSON.stringify({
  status: "CLIENT_MANUAL_CONTACT_WORKFLOW_BUILDER_COMPLETE",
  total_client_contact_records: workflow.length,
  output: out
}, null, 2));
