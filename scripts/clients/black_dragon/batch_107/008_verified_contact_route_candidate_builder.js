const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validationPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/audit/007_official_contact_route_validation.json"
);

const validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));

const candidates = validation.validated_contact_routes.map((row, index) => ({
  verified_contact_route_id:
    `BD_VERIFIED_CONTACT_ROUTE_${String(index + 1).padStart(4, "0")}`,

  contact_resolution_id: row.contact_resolution_id,
  verified_source_id: row.verified_source_id,
  organization_name: row.organization_name,
  official_contact_page_url: row.official_contact_page_url,
  official_contact_route: row.official_contact_route,
  official_contact_route_type: row.official_contact_route_type,
  official_contact_person_or_role: row.official_contact_person_or_role || null,
  evidence_note: row.evidence_note,

  verification_status: "VERIFIED_OFFICIAL_CONTACT_ROUTE",

  founder_review_required: true,
  outreach_allowed: false,
  promotion_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/candidates/verified_contact_route_candidates.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_verified_contact_route_candidate_builder_v1",
  generated_at: new Date().toISOString(),
  total_verified_contact_routes: candidates.length,
  verified_contact_routes: candidates
}, null, 2));

console.log(JSON.stringify({
  status: "VERIFIED_CONTACT_ROUTE_CANDIDATE_BUILDER_COMPLETE",
  total_verified_contact_routes: candidates.length,
  output: out
}, null, 2));
