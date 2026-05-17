const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const workbookPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/inputs/contact_route_resolution_workbook.json"
);

const workbook = JSON.parse(
  fs.readFileSync(workbookPath, "utf8")
);

const unresolved = workbook.workbook.map(
  row => ({

    contact_resolution_id:
      row.contact_resolution_id,

    verified_source_id:
      row.verified_source_id,

    organization_name:
      row.organization_name,

    quarantine_status:
      "UNRESOLVED_CONTACT_ROUTE",

    reason:
      "OFFICIAL_CONTACT_ROUTE_NOT_YET_VERIFIED",

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
  "public/data/clients/black_dragon/contact_resolution/quarantine/unresolved_contact_routes.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_unresolved_contact_route_quarantine_v1",

  generated_at:
    new Date().toISOString(),

  total_unresolved:
    unresolved.length,

  unresolved

}, null, 2));

console.log(JSON.stringify({
  status:
    "UNRESOLVED_CONTACT_ROUTE_QUARANTINE_COMPLETE",

  total_unresolved:
    unresolved.length,

  output:
    out

}, null, 2));
