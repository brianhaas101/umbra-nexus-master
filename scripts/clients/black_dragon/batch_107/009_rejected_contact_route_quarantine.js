const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validationPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/audit/007_official_contact_route_validation.json"
);

const validation = JSON.parse(fs.readFileSync(validationPath, "utf8"));

const rejected = validation.rejected_contact_routes.map(row => ({
  contact_resolution_id: row.contact_resolution_id || null,
  verified_source_id: row.verified_source_id || null,
  organization_name: row.organization_name || null,
  official_contact_page_url: row.official_contact_page_url || null,
  official_contact_route: row.official_contact_route || null,
  rejection_reasons: row.rejection_reasons || ["UNSPECIFIED_CONTACT_ROUTE_FAILURE"],
  quarantine_status: "REJECTED_OFFICIAL_CONTACT_ROUTE",
  founder_review_required: true,
  outreach_allowed: false,
  promotion_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/quarantine/rejected_contact_routes.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_rejected_contact_route_quarantine_v1",
  generated_at: new Date().toISOString(),
  total_rejected: rejected.length,
  rejected_contact_routes: rejected
}, null, 2));

console.log(JSON.stringify({
  status: "REJECTED_CONTACT_ROUTE_QUARANTINE_COMPLETE",
  total_rejected: rejected.length,
  output: out
}, null, 2));
