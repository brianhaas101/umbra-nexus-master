const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registry = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json"),
  "utf8"
));

const quarantine = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/pipeline/quarantine/quarantined_import_rows.json"),
  "utf8"
));

const quarantinedIds = new Set(
  quarantine.quarantined.map(r => r.execution_id)
);

const eligibility = registry.execution_targets.map(row => {
  const blocked = quarantinedIds.has(row.execution_id);

  return {
    execution_id: row.execution_id,
    import_row_id: row.import_row_id,
    promotion_eligible: false,
    outreach_allowed: false,
    founder_review_required: true,
    blocked,
    reason: blocked
      ? "QUARANTINED_IMPORT_REQUIRES_FOUNDER_REVIEW"
      : "FOUNDER_REVIEW_NOT_COMPLETED"
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit/014_promotion_eligibility_gate.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_promotion_eligibility_gate_v1",
  generated_at: new Date().toISOString(),
  total: eligibility.length,
  promotion_eligible: eligibility.filter(r => r.promotion_eligible).length,
  outreach_allowed: eligibility.filter(r => r.outreach_allowed).length,
  founder_review_required: eligibility.filter(r => r.founder_review_required).length,
  eligibility
}, null, 2));

console.log(JSON.stringify({
  status: "PROMOTION_ELIGIBILITY_GATE_COMPLETE",
  total: eligibility.length,
  promotion_eligible: eligibility.filter(r => r.promotion_eligible).length,
  outreach_allowed: eligibility.filter(r => r.outreach_allowed).length,
  founder_review_required: eligibility.filter(r => r.founder_review_required).length,
  output: out
}, null, 2));
