const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const template = {
  version: "black_dragon_official_contact_route_import_template_v1",
  generated_at: new Date().toISOString(),

  policy: {
    official_public_routes_only: true,
    guessed_contacts_forbidden: true,
    synthetic_contacts_forbidden: true,
    personal_private_contacts_forbidden: true,
    outreach_forbidden: true,
    promotion_forbidden: true,
    founder_review_required: true
  },

  required_fields: [
    "contact_resolution_id",
    "verified_source_id",
    "organization_name",
    "official_contact_page_url",
    "official_contact_route",
    "official_contact_route_type",
    "evidence_note"
  ],

  allowed_contact_route_types: [
    "OFFICIAL_CONTACT_PAGE",
    "PUBLIC_TRAINING_DIVISION",
    "PUBLIC_ACADEMY_CONTACT",
    "PUBLIC_COORDINATOR_PAGE",
    "PUBLIC_INTAKE_PORTAL"
  ],

  official_contact_routes: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/inputs/official_contact_route_import_template.json"
);

fs.writeFileSync(out, JSON.stringify(template, null, 2));

console.log(JSON.stringify({
  status: "OFFICIAL_CONTACT_ROUTE_IMPORT_TEMPLATE_COMPLETE",
  required_fields: template.required_fields.length,
  allowed_contact_route_types: template.allowed_contact_route_types.length,
  output: out
}, null, 2));
