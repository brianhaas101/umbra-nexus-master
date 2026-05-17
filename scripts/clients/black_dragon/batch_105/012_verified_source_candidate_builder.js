const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validationPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/audit/011_resolved_source_import_validation.json"
);

const validation = JSON.parse(
  fs.readFileSync(validationPath, "utf8")
);

const verified = validation.validated_sources.map(
  (row, index) => ({

    verified_source_id:
      `BD_VERIFIED_SOURCE_${String(index + 1).padStart(4, "0")}`,

    resolution_id:
      row.resolution_id,

    execution_id:
      row.execution_id,

    resolved_source_url:
      row.resolved_source_url,

    resolved_source_title:
      row.resolved_source_title,

    resolved_organization_name:
      row.resolved_organization_name,

    resolved_contact_page_url:
      row.resolved_contact_page_url || null,

    resolved_contact_route:
      row.resolved_contact_route || null,

    resolved_contact_route_type:
      row.resolved_contact_route_type || null,

    resolved_contact_person_or_role:
      row.resolved_contact_person_or_role || null,

    evidence_note:
      row.evidence_note,

    verification_status:
      "VERIFIED_PUBLIC_SOURCE",

    founder_review_required:
      true,

    outreach_allowed:
      false,

    promotion_allowed:
      false
  })
);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/candidates/verified_source_candidates.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_verified_source_candidate_builder_v1",

  generated_at:
    new Date().toISOString(),

  total_verified_candidates:
    verified.length,

  verified_candidates:
    verified

}, null, 2));

console.log(JSON.stringify({
  status:
    "VERIFIED_SOURCE_CANDIDATE_BUILDER_COMPLETE",

  total_verified_candidates:
    verified.length,

  output:
    out

}, null, 2));
