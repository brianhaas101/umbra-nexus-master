const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schema = {
  version: "black_dragon_contact_page_candidate_schema_v1",
  generated_at: new Date().toISOString(),
  policy: {
    real_public_sources_only: true,
    guessed_contacts_forbidden: true,
    synthetic_contacts_forbidden: true,
    outreach_forbidden: true,
    founder_review_required: true
  },
  required_fields: [
    "resolution_id",
    "execution_id",
    "organization_name",
    "source_url",
    "source_title",
    "contact_page_url",
    "contact_route",
    "contact_route_type",
    "retrieval_timestamp",
    "evidence_note"
  ],
  contact_page_candidates: []
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/candidates/contact_page_candidate_schema.json"
);

fs.writeFileSync(out, JSON.stringify(schema, null, 2));

console.log(JSON.stringify({
  status: "CONTACT_PAGE_CANDIDATE_SCHEMA_COMPLETE",
  required_fields: schema.required_fields.length,
  output: out
}, null, 2));
