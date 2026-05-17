const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const template = {
  version: "black_dragon_resolved_source_import_template_v1",
  generated_at: new Date().toISOString(),
  policy: {
    real_public_sources_only: true,
    guessed_contacts_forbidden: true,
    synthetic_contacts_forbidden: true,
    founder_review_required: true,
    outreach_forbidden: true,
    promotion_forbidden: true
  },
  required_fields: [
    "resolution_id",
    "execution_id",
    "resolved_source_url",
    "resolved_source_title",
    "resolved_organization_name",
    "evidence_note"
  ],
  optional_contact_fields: [
    "resolved_contact_page_url",
    "resolved_contact_route",
    "resolved_contact_route_type",
    "resolved_contact_person_or_role"
  ],
  resolved_sources: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/resolved_source_import_template.json"
);

fs.writeFileSync(out, JSON.stringify(template, null, 2));

console.log(JSON.stringify({
  status: "RESOLVED_SOURCE_IMPORT_TEMPLATE_COMPLETE",
  required_fields: template.required_fields.length,
  optional_contact_fields: template.optional_contact_fields.length,
  output: out
}, null, 2));
