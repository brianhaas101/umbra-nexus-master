const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const workbook = read("public/data/clients/black_dragon/source_resolution/inputs/manual_resolution_workbook.json");
const template = read("public/data/clients/black_dragon/source_resolution/inputs/resolved_source_import_template.json");
const unresolved = read("public/data/clients/black_dragon/source_resolution/quarantine/unresolved_source_resolution_queue.json");

const csvPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/manual_resolution_workbook.csv"
);

const audit = {
  version: "black_dragon_batch_105_phase_b_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "105_REAL_SOURCE_RESOLUTION_PIPELINE",
  phase: "B_MANUAL_REAL_SOURCE_RESOLUTION",
  counts: {
    workbook_rows: workbook.total_rows,
    unresolved_sources: unresolved.total_unresolved,
    resolved_template_rows: template.resolved_sources.length,
    csv_exists: fs.existsSync(csvPath)
  },
  gates: {
    workbook_rows_180: workbook.total_rows === 180,
    unresolved_sources_180: unresolved.total_unresolved === 180,
    resolved_template_empty: template.resolved_sources.length === 0,
    csv_export_exists: fs.existsSync(csvPath),
    no_outreach_allowed: workbook.workbook.every(r => r.outreach_allowed === false),
    no_promotion_allowed: workbook.workbook.every(r => r.promotion_allowed === false),
    founder_review_required: workbook.workbook.every(r => r.founder_review_required === true)
  },
  status: (
    workbook.total_rows === 180 &&
    unresolved.total_unresolved === 180 &&
    template.resolved_sources.length === 0 &&
    fs.existsSync(csvPath) &&
    workbook.workbook.every(r => r.outreach_allowed === false) &&
    workbook.workbook.every(r => r.promotion_allowed === false)
  ) ? "PASS" : "REVIEW_REQUIRED"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/audit/batch_105_phase_b_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_105_PHASE_B_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
