const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const reviewPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/review_queue/founder_contact_review_queue.json"
);

const review = JSON.parse(
  fs.readFileSync(reviewPath, "utf8")
);

const readiness = review.review_queue.map(
  row => ({

    manual_outreach_record_id:
      `BD_MANUAL_OUTREACH_${row.verified_contact_route_id}`,

    verified_contact_route_id:
      row.verified_contact_route_id,

    organization_name:
      row.organization_name,

    official_contact_page_url:
      row.official_contact_page_url,

    official_contact_route:
      row.official_contact_route,

    official_contact_route_type:
      row.official_contact_route_type,

    official_contact_person_or_role:
      row.official_contact_person_or_role,

    outreach_readiness:
      "MANUAL_ONLY_PENDING_FOUNDER_APPROVAL",

    outreach_allowed:
      false,

    promotion_allowed:
      false,

    automated_send_allowed:
      false,

    founder_review_required:
      true
  })
);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/candidates/manual_outreach_readiness.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_manual_outreach_readiness_builder_v1",

  generated_at:
    new Date().toISOString(),

  total_manual_outreach_candidates:
    readiness.length,

  manual_outreach_candidates:
    readiness

}, null, 2));

console.log(JSON.stringify({
  status:
    "MANUAL_OUTREACH_READINESS_BUILDER_COMPLETE",

  total_manual_outreach_candidates:
    readiness.length,

  output:
    out

}, null, 2));
