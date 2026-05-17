const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const workbookPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/manual_resolution_workbook.json"
);

const workbook = JSON.parse(fs.readFileSync(workbookPath, "utf8"));

const unresolved = workbook.workbook
  .filter(row => !row.resolved_source_url)
  .map(row => ({
    resolution_id: row.resolution_id,
    execution_id: row.execution_id,
    import_row_id: row.import_row_id,
    organization_seed: row.organization_seed,
    quarantine_status: "UNRESOLVED_REAL_PUBLIC_SOURCE",
    reason: "NO_RESOLVED_SOURCE_URL_PRESENT",
    founder_review_required: true,
    outreach_allowed: false,
    promotion_allowed: false
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/quarantine/unresolved_source_resolution_queue.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_unresolved_source_quarantine_refresher_v1",
  generated_at: new Date().toISOString(),
  total_unresolved: unresolved.length,
  unresolved
}, null, 2));

console.log(JSON.stringify({
  status: "UNRESOLVED_SOURCE_QUARANTINE_REFRESHER_COMPLETE",
  total_unresolved: unresolved.length,
  output: out
}, null, 2));
