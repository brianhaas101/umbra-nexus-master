const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schema = {
  version: "black_dragon_manual_send_attempt_log_schema_v1",
  generated_at: new Date().toISOString(),

  policy: {
    manual_send_only: true,
    automated_send_forbidden: true,
    founder_approval_required: true,
    evidence_retention_required: true,
    no_bulk_campaign_execution: true
  },

  required_fields: [
    "attempt_id",
    "founder_approval_id",
    "verified_contact_route_id",
    "organization_name",
    "contact_route_used",
    "send_method",
    "sent_by",
    "sent_at",
    "message_summary",
    "evidence_note"
  ],

  allowed_send_methods: [
    "MANUAL_EMAIL",
    "MANUAL_PHONE_CALL",
    "MANUAL_CONTACT_FORM",
    "MANUAL_LINKEDIN_MESSAGE",
    "MANUAL_OTHER_PUBLIC_ROUTE"
  ],

  manual_send_attempts: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/attempts/manual_send_attempt_log_schema.json"
);

fs.writeFileSync(out, JSON.stringify(schema, null, 2));

console.log(JSON.stringify({
  status: "MANUAL_SEND_ATTEMPT_LOG_SCHEMA_COMPLETE",
  required_fields: schema.required_fields.length,
  allowed_send_methods: schema.allowed_send_methods.length,
  output: out
}, null, 2));
