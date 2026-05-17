const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schema = {
  version: "black_dragon_outreach_response_capture_schema_v1",
  generated_at: new Date().toISOString(),

  policy: {
    response_capture_only: true,
    auto_reply_forbidden: true,
    founder_review_required: true,
    response_lineage_required: true
  },

  required_fields: [
    "response_id",
    "attempt_id",
    "verified_contact_route_id",
    "organization_name",
    "response_received_at",
    "response_channel",
    "response_summary",
    "next_action_recommendation",
    "founder_review_status"
  ],

  allowed_response_channels: [
    "EMAIL_REPLY",
    "PHONE_CALLBACK",
    "CONTACT_FORM_REPLY",
    "LINKEDIN_REPLY",
    "OTHER_PUBLIC_ROUTE_REPLY"
  ],

  captured_responses: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/responses/outreach_response_capture_schema.json"
);

fs.writeFileSync(out, JSON.stringify(schema, null, 2));

console.log(JSON.stringify({
  status: "OUTREACH_RESPONSE_CAPTURE_SCHEMA_COMPLETE",
  required_fields: schema.required_fields.length,
  allowed_response_channels: schema.allowed_response_channels.length,
  output: out
}, null, 2));
