const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const workflowPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/approvals/client_manual_contact_workflow.json"
);

const workflow = JSON.parse(fs.readFileSync(workflowPath, "utf8"));

const index = workflow.client_contact_workflow.map((row, index) => ({
  visibility_record_id:
    `BD_CONTACT_VISIBILITY_${String(index + 1).padStart(4, "0")}`,

  client_id:
    row.client_id,

  client_contact_workflow_id:
    row.client_contact_workflow_id,

  verified_contact_route_id:
    row.verified_contact_route_id,

  organization_name:
    row.organization_name,

  city_map_node_visible_to_client:
    row.city_map_node_visible_to_client,

  dossier_visible_to_client:
    row.dossier_visible_to_client,

  contact_route_visible_to_client:
    true,

  contact_route_actionable_by_client:
    row.client_authorized_for_manual_contact,

  founder_integrity_lock:
    row.founder_integrity_lock,

  automated_contact_allowed:
    false,

  promotion_allowed:
    false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/audit/map_dossier_contact_visibility_index.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_map_dossier_contact_visibility_index_v1",
  generated_at: new Date().toISOString(),
  total_visibility_records: index.length,
  visibility_index: index
}, null, 2));

console.log(JSON.stringify({
  status: "MAP_DOSSIER_CONTACT_VISIBILITY_INDEX_COMPLETE",
  total_visibility_records: index.length,
  output: out
}, null, 2));
