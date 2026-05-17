const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schema = {

  version:
    "black_dragon_official_contact_route_schema_v1",

  generated_at:
    new Date().toISOString(),

  policy: {

    official_public_routes_only:
      true,

    guessed_contacts_forbidden:
      true,

    scraped_private_contacts_forbidden:
      true,

    outreach_forbidden:
      true,

    founder_review_required:
      true
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

  official_contact_candidates: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/candidates/official_contact_route_schema.json"
);

fs.writeFileSync(out, JSON.stringify(schema, null, 2));

console.log(JSON.stringify({
  status:
    "OFFICIAL_CONTACT_ROUTE_SCHEMA_COMPLETE",

  required_fields:
    schema.required_fields.length,

  route_types:
    schema.allowed_contact_route_types.length,

  output:
    out

}, null, 2));
