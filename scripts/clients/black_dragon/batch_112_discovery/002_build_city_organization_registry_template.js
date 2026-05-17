const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const template = {

  version:
    "black_dragon_city_organization_registry_template_v1",

  generated_at:
    new Date().toISOString(),

  policy: {

    real_public_organizations_only: true,
    synthetic_organizations_forbidden: true,
    source_url_required: true,
    city_state_required: true,
    dossier_before_runtime_visibility: true,
    verified_contact_route_before_contact_ready: true,
    automated_outreach_forbidden: true
  },

  required_fields: [

    "organization_registry_id",
    "city",
    "state",
    "organization_name",
    "organization_type",
    "source_url",
    "source_title",
    "source_confidence",
    "audience_relevance_score",
    "mc_culture_relevance",
    "book_sale_relevance",
    "runtime_visibility_allowed",
    "dossier_status",
    "contact_route_status"
  ],

  organization_registry: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_discovery/templates/city_organization_registry_template.json"
);

fs.writeFileSync(out, JSON.stringify(template, null, 2));

console.log(JSON.stringify({
  status: "CITY_ORGANIZATION_REGISTRY_TEMPLATE_COMPLETE",
  required_fields: template.required_fields.length,
  output: out
}, null, 2));
