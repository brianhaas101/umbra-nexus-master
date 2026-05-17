const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const template = {
  version: "black_dragon_resolved_expansion_source_import_template_v1",
  generated_at: new Date().toISOString(),

  policy: {
    real_public_sources_only: true,
    official_sources_preferred: true,
    placeholder_orgs_forbidden: true,
    synthetic_contacts_forbidden: true,
    guessed_contacts_forbidden: true,
    city_state_required: true,
    runtime_visibility_forbidden_until_validation: true,
    automated_outreach_forbidden: true
  },

  required_fields: [
    "expansion_work_id",
    "city",
    "state",
    "organization_name",
    "organization_type",
    "source_url",
    "source_title",
    "evidence_note"
  ],

  optional_contact_fields: [
    "official_contact_page_url",
    "official_contact_route",
    "official_contact_route_type",
    "official_contact_person_or_role"
  ],

  resolved_expansion_sources: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/source_resolution/templates/resolved_expansion_source_import_template.json"
);

fs.writeFileSync(out, JSON.stringify(template, null, 2));

console.log(JSON.stringify({
  status: "RESOLVED_EXPANSION_SOURCE_IMPORT_TEMPLATE_COMPLETE",
  required_fields: template.required_fields.length,
  optional_contact_fields: template.optional_contact_fields.length,
  output: out
}, null, 2));
