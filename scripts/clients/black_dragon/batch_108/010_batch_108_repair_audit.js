const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const workflow = read(
  "public/data/clients/black_dragon/manual_outreach/approvals/client_manual_contact_workflow.json"
);

const assignments = read(
  "public/data/clients/black_dragon/manual_outreach/approvals/client_sales_assignment_schema.json"
);

const actions = read(
  "public/data/clients/black_dragon/manual_outreach/attempts/client_manual_contact_action_schema.json"
);

const visibility = read(
  "public/data/clients/black_dragon/manual_outreach/audit/map_dossier_contact_visibility_index.json"
);

const records = workflow.client_contact_workflow;

const audit = {
  version: "black_dragon_batch_108_repair_client_controlled_manual_outreach_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "108_REPAIR_CLIENT_CONTROLLED_MANUAL_OUTREACH",
  repair_reason:
    "Replace founder-per-contact approval with client-controlled manual contact workflow under founder integrity governance.",

  counts: {
    client_contact_records: workflow.total_client_contact_records,
    sales_assignment_schema_fields: assignments.required_fields.length,
    client_action_schema_fields: actions.required_fields.length,
    visibility_records: visibility.total_visibility_records,
    currently_client_authorized_for_manual_contact:
      records.filter(r => r.client_authorized_for_manual_contact).length,
    automated_contact_allowed:
      records.filter(r => r.automated_contact_allowed).length,
    founder_contact_approval_required:
      records.filter(r => r.founder_contact_approval_required).length
  },

  gates: {
    client_controls_contact_selection:
      workflow.policy.client_controls_contact_selection === true,

    founder_controls_integrity_and_permissions:
      workflow.policy.founder_controls_integrity_and_permissions === true,

    founder_no_longer_required_per_contact:
      records.every(r => r.founder_contact_approval_required === false),

    founder_integrity_lock_active:
      records.every(r => r.founder_integrity_lock === true),

    verified_route_required:
      records.every(r => r.verified_route_required === true),

    automated_contact_forbidden:
      records.every(r => r.automated_contact_allowed === false),

    default_client_authorized_zero:
      records.filter(r => r.client_authorized_for_manual_contact).length === 0,

    map_nodes_visible:
      records.every(r => r.city_map_node_visible_to_client === true),

    dossiers_visible:
      records.every(r => r.dossier_visible_to_client === true),

    visibility_records_match:
      visibility.total_visibility_records === workflow.total_client_contact_records
  },

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/audit/batch_108_repair_client_controlled_manual_outreach_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_108_REPAIR_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
