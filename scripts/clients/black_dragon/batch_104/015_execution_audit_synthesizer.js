const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const registry = read("public/data/clients/black_dragon/pipeline/registries/import_execution_registry.json");
const quarantine = read("public/data/clients/black_dragon/pipeline/quarantine/quarantined_import_rows.json");
const review = read("public/data/clients/black_dragon/pipeline/review_queue/founder_review_queue.json");
const eligibility = read("public/data/clients/black_dragon/pipeline/audit/014_promotion_eligibility_gate.json");

const audit = {
  version: "black_dragon_batch_104_execution_audit_synthesizer_v1",
  generated_at: new Date().toISOString(),
  checkpoint: "BLACK_DRAGON_REAL_CONTACT_EXPANSION_POST_BATCH_103",
  batch: "104_REAL_SOURCE_IMPORT_EXECUTION_PIPELINE",
  counts: {
    source_rows_loaded: registry.counts.source_rows_loaded,
    execution_targets: registry.execution_targets.length,
    quarantined: quarantine.total_quarantined,
    founder_review_queue: review.total_review_items,
    promotion_eligible: eligibility.promotion_eligible,
    outreach_allowed: eligibility.outreach_allowed
  },
  gates: {
    source_rows_loaded_180: registry.counts.source_rows_loaded === 180,
    execution_targets_180: registry.execution_targets.length === 180,
    outreach_disabled: eligibility.outreach_allowed === 0,
    promotion_disabled: eligibility.promotion_eligible === 0,
    founder_review_required: eligibility.founder_review_required === 180,
    no_auto_promotion: true,
    no_unverified_outreach: true
  },
  status:
    registry.counts.source_rows_loaded === 180 &&
    registry.execution_targets.length === 180 &&
    eligibility.outreach_allowed === 0 &&
    eligibility.promotion_eligible === 0
      ? "PASS"
      : "REVIEW_REQUIRED"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit/batch_104_real_source_import_execution_pipeline_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "EXECUTION_AUDIT_SYNTHESIZER_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
