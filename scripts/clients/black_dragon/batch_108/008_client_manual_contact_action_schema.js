const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schema = {
  version: "black_dragon_client_manual_contact_action_schema_v1",
  generated_at: new Date().toISOString(),

  policy: {
    client_manual_action_only: true,
    automated_send_forbidden: true,
    verified_contact_route_required: true,
    contact_attempt_log_required: true,
    response_tracking_required: true,
    founder_integrity_lock_required: true
  },

  required_fields: [
    "client_contact_action_id",
    "client_contact_workflow_id",
    "verified_contact_route_id",
    "client_user_id",
    "client_action_type",
    "contact_route_used",
    "action_timestamp",
    "action_summary",
    "evidence_note"
  ],

  allowed_client_action_types: [
    "CLIENT_MARKED_FOR_REVIEW",
    "CLIENT_AUTHORIZED_MANUAL_CONTACT",
    "CLIENT_LOGGED_MANUAL_EMAIL",
    "CLIENT_LOGGED_MANUAL_CALL",
    "CLIENT_LOGGED_CONTACT_FORM",
    "CLIENT_LOGGED_OTHER_PUBLIC_ROUTE",
    "CLIENT_MARKED_NOT_RELEVANT",
    "CLIENT_MARKED_FOLLOW_UP_REQUIRED"
  ],

  client_contact_actions: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/attempts/client_manual_contact_action_schema.json"
);

fs.writeFileSync(out, JSON.stringify(schema, null, 2));

console.log(JSON.stringify({
  status: "CLIENT_MANUAL_CONTACT_ACTION_SCHEMA_COMPLETE",
  required_fields: schema.required_fields.length,
  allowed_client_action_types: schema.allowed_client_action_types.length,
  output: out
}, null, 2));
