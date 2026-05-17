const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registry = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json"),
  "utf8"
));

const reasons = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/pipeline/quarantine/quarantine_reason_registry.json"),
  "utf8"
));

const reasonMap = new Map(
  reasons.rows.map(r => [r.execution_id, r])
);

const quarantined = registry.execution_targets
  .map(row => {
    const q = reasonMap.get(row.execution_id);
    return {
      ...row,
      quarantine_required: q ? q.quarantine_required : true,
      quarantine_reasons: q ? q.quarantine_reasons : [{
        validator: "quarantine_export_engine",
        reason: "MISSING_QUARANTINE_REASON_RECORD"
      }],
      outreach_allowed: false,
      promotion_allowed: false,
      founder_review_required: true
    };
  })
  .filter(row => row.quarantine_required);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/quarantine/quarantined_import_rows.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_quarantine_export_engine_v1",
  generated_at: new Date().toISOString(),
  policy: {
    deletion_forbidden: true,
    outreach_forbidden: true,
    promotion_forbidden: true,
    founder_review_required: true
  },
  total_quarantined: quarantined.length,
  quarantined
}, null, 2));

console.log(JSON.stringify({
  status: "QUARANTINE_EXPORT_ENGINE_COMPLETE",
  total_quarantined: quarantined.length,
  output: out
}, null, 2));
