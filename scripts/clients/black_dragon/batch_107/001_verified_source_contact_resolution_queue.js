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

    contact_resolution_id:
      `BD_CONTACT_RESOLUTION_${String(index + 1).padStart(4, "0")}`,

    verified_source_id:
      row.verified_source_id,

    execution_id:
      row.execution_id,

    organization_name:
      row.resolved_organization_name,

    source_url:
      row.resolved_source_url,

    source_title:
      row.resolved_source_title,

    existing_contact_page_url:
      row.resolved_contact_page_url || null,

    existing_contact_route:
      row.resolved_contact_route || null,

    contact_resolution_status:
      "AWAITING_OFFICIAL_CONTACT_ROUTE",

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
  "public/data/clients/black_dragon/contact_resolution/inputs/verified_source_contact_resolution_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_verified_source_contact_resolution_queue_v1",

  generated_at:
    new Date().toISOString(),

  total_contact_resolution_inputs:
    queue.length,

  queue

}, null, 2));

console.log(JSON.stringify({
  status:
    "VERIFIED_SOURCE_CONTACT_RESOLUTION_QUEUE_COMPLETE",

  total_contact_resolution_inputs:
    queue.length,

  output:
    out

}, null, 2));
