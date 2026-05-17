const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validationPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/audit/011_resolved_source_import_validation.json"
);

const validation = JSON.parse(
  fs.readFileSync(validationPath, "utf8")
);

const quarantine = validation.rejected_sources.map(
  row => ({
    resolution_id:
      row.resolution_id,

    execution_id:
      row.execution_id,

    rejection_reason:
      row.rejection_reason,

    missing_required_fields:
      row.missing_required_fields,

    valid_url:
      row.valid_url,

    quarantine_status:
      "REJECTED_SOURCE_IMPORT",

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
  "public/data/clients/black_dragon/source_resolution/quarantine/rejected_resolved_sources.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_verified_source_quarantine_gate_v1",

  generated_at:
    new Date().toISOString(),

  total_rejected:
    quarantine.length,

  rejected_sources:
    quarantine

}, null, 2));

console.log(JSON.stringify({
  status:
    "VERIFIED_SOURCE_QUARANTINE_GATE_COMPLETE",

  total_rejected:
    quarantine.length,

  output:
    out

}, null, 2));
