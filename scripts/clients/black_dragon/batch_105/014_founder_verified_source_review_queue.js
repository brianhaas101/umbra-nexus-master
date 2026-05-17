const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const verifiedPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/candidates/verified_source_candidates.json"
);

const verified = JSON.parse(
  fs.readFileSync(verifiedPath, "utf8")
);

const queue = verified.verified_candidates.map(
  (row, index) => ({

    founder_review_id:
      `BD_VERIFIED_SOURCE_REVIEW_${String(index + 1).padStart(4, "0")}`,

    verified_source_id:
      row.verified_source_id,

    execution_id:
      row.execution_id,

    resolved_organization_name:
      row.resolved_organization_name,

    resolved_source_url:
      row.resolved_source_url,

    resolved_contact_page_url:
      row.resolved_contact_page_url,

    review_status:
      "PENDING_FOUNDER_VERIFICATION",

    outreach_allowed:
      false,

    promotion_allowed:
      false,

    founder_review_required:
      true
  })
);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/review_queue/founder_verified_source_review_queue.json"
);

fs.mkdirSync(
  path.dirname(out),
  { recursive: true }
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_founder_verified_source_review_queue_v1",

  generated_at:
    new Date().toISOString(),

  total_review_items:
    queue.length,

  review_queue:
    queue

}, null, 2));

console.log(JSON.stringify({
  status:
    "FOUNDER_VERIFIED_SOURCE_REVIEW_QUEUE_COMPLETE",

  total_review_items:
    queue.length,

  output:
    out

}, null, 2));
