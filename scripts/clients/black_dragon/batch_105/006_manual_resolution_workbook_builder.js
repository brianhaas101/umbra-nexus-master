const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const manifestPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/candidates/search_query_resolution_manifest.json"
);

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const workbook = manifest.manifest.map((row, index) => ({
  workbook_row_id: `BD_RESOLUTION_WORKBOOK_${String(index + 1).padStart(4, "0")}`,
  resolution_id: row.resolution_id,
  execution_id: row.execution_id,
  import_row_id: row.import_row_id,
  organization_seed: row.organization_seed,
  source_type: row.source_type,
  search_queries: row.search_queries,
  resolved_source_url: null,
  resolved_source_title: null,
  resolved_organization_name: null,
  resolved_contact_page_url: null,
  resolved_contact_route: null,
  resolved_contact_route_type: null,
  resolved_contact_person_or_role: null,
  evidence_note: null,
  founder_review_notes: null,
  resolution_status: "AWAITING_REAL_PUBLIC_SOURCE",
  founder_review_required: true,
  outreach_allowed: false,
  promotion_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/manual_resolution_workbook.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_manual_resolution_workbook_v1",
  generated_at: new Date().toISOString(),
  policy: {
    real_public_sources_only: true,
    guessed_contacts_forbidden: true,
    synthetic_contacts_forbidden: true,
    founder_review_required: true,
    outreach_forbidden: true,
    promotion_forbidden: true
  },
  total_rows: workbook.length,
  workbook
}, null, 2));

console.log(JSON.stringify({
  status: "MANUAL_RESOLUTION_WORKBOOK_BUILDER_COMPLETE",
  total_rows: workbook.length,
  output: out
}, null, 2));
