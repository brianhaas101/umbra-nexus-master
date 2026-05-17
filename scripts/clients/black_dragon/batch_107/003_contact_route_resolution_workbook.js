const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queuePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/inputs/verified_source_contact_resolution_queue.json"
);

const queue = JSON.parse(
  fs.readFileSync(queuePath, "utf8")
);

const workbook = queue.queue.map(
  (row, index) => ({

    workbook_row_id:
      `BD_CONTACT_WORKBOOK_${String(index + 1).padStart(4, "0")}`,

    contact_resolution_id:
      row.contact_resolution_id,

    verified_source_id:
      row.verified_source_id,

    execution_id:
      row.execution_id,

    organization_name:
      row.organization_name,

    source_url:
      row.source_url,

    source_title:
      row.source_title,

    official_contact_page_url:
      null,

    official_contact_route:
      null,

    official_contact_route_type:
      null,

    official_contact_person_or_role:
      null,

    evidence_note:
      null,

    founder_review_notes:
      null,

    contact_resolution_status:
      "AWAITING_REAL_CONTACT_ROUTE",

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
  "public/data/clients/black_dragon/contact_resolution/inputs/contact_route_resolution_workbook.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_contact_route_resolution_workbook_v1",

  generated_at:
    new Date().toISOString(),

  total_rows:
    workbook.length,

  workbook

}, null, 2));

console.log(JSON.stringify({
  status:
    "CONTACT_ROUTE_RESOLUTION_WORKBOOK_COMPLETE",

  total_rows:
    workbook.length,

  output:
    out

}, null, 2));
