const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const verifiedPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/candidates/verified_contact_route_candidates.json"
);

const verified = JSON.parse(
  fs.readFileSync(verifiedPath, "utf8")
);

const queue = verified.verified_contact_routes.map(
  (row, index) => ({

    founder_contact_review_id:
      `BD_FOUNDER_CONTACT_REVIEW_${String(index + 1).padStart(4, "0")}`,

    verified_contact_route_id:
      row.verified_contact_route_id,

    contact_resolution_id:
      row.contact_resolution_id,

    verified_source_id:
      row.verified_source_id,

    organization_name:
      row.organization_name,

    official_contact_page_url:
      row.official_contact_page_url,

    official_contact_route:
      row.official_contact_route,

    official_contact_route_type:
      row.official_contact_route_type,

    official_contact_person_or_role:
      row.official_contact_person_or_role || null,

    evidence_note:
      row.evidence_note,

    founder_review_status:
      "PENDING_FOUNDER_CONTACT_REVIEW",

    outreach_allowed:
      false,

    promotion_allowed:
      false
  })
);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/review_queue/founder_contact_review_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_founder_contact_review_queue_builder_v1",

  generated_at:
    new Date().toISOString(),

  total_review_items:
    queue.length,

  review_queue:
    queue

}, null, 2));

console.log(JSON.stringify({
  status:
    "FOUNDER_CONTACT_REVIEW_QUEUE_BUILDER_COMPLETE",

  total_review_items:
    queue.length,

  output:
    out

}, null, 2));
