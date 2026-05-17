const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schema = {
  version: "black_dragon_client_sales_assignment_schema_v1",
  generated_at: new Date().toISOString(),

  policy: {
    restricted_client_account_only: true,
    founder_feature_access_forbidden: true,
    verified_contact_routes_only: true,
    client_sales_team_can_select_targets: true,
    automated_send_forbidden: true
  },

  required_fields: [
    "assignment_id",
    "client_contact_workflow_id",
    "assigned_client_user_id",
    "assigned_sales_role",
    "assigned_at",
    "assigned_by_client_admin",
    "assignment_status"
  ],

  allowed_sales_roles: [
    "CLIENT_ADMIN",
    "CLIENT_SALES_MANAGER",
    "CLIENT_SALES_REP",
    "CLIENT_VIEW_ONLY"
  ],

  sales_assignments: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/approvals/client_sales_assignment_schema.json"
);

fs.writeFileSync(out, JSON.stringify(schema, null, 2));

console.log(JSON.stringify({
  status: "CLIENT_SALES_ASSIGNMENT_SCHEMA_COMPLETE",
  required_fields: schema.required_fields.length,
  allowed_sales_roles: schema.allowed_sales_roles.length,
  output: out
}, null, 2));
