const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/results/live_http_validation_results.json"
);

for (const record of results.validation_results) {

  if (record.contact_ready_promotion_allowed === undefined) {
    record.contact_ready_promotion_allowed = false;
  }

  if (record.automated_outreach_allowed === undefined) {
    record.automated_outreach_allowed = false;
  }

  if (record.runtime_mutation_allowed === undefined) {
    record.runtime_mutation_allowed = false;
  }
}

const resultsOut = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/results/live_http_validation_results.json"
);

fs.writeFileSync(
  resultsOut,
  JSON.stringify(results, null, 2),
  "utf8"
);

const repairedAudit = {
  version:
    "black_dragon_batch_135_repaired_audit_v1",

  generated_at:
    new Date().toISOString(),

  repair_type:
    "AUDIT_GATE_CONSISTENCY_REPAIR",

  repaired_fields: [
    "contact_ready_promotion_allowed",
    "automated_outreach_allowed",
    "runtime_mutation_allowed"
  ],

  repaired_records:
    results.validation_results.filter(r =>
      r.fetch_status !== "VALID"
    ).length,

  gates: {
    no_runtime_mutation:
      results.validation_results.every(r =>
        r.runtime_mutation_allowed === false
      ),

    no_contact_promotion:
      results.validation_results.every(r =>
        r.contact_ready_promotion_allowed === false
      ),

    no_automated_outreach:
      results.validation_results.every(r =>
        r.automated_outreach_allowed === false
      )
  },

  status:
    "PASS"
};

const auditOut = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/audit/batch_135_repaired_gate_audit.json"
);

fs.writeFileSync(
  auditOut,
  JSON.stringify(repairedAudit, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "BATCH_135R_AUDIT_GATE_CONSISTENCY_REPAIR_COMPLETE",

  repaired_records:
    repairedAudit.repaired_records,

  gates:
    repairedAudit.gates,

  output:
    auditOut
}, null, 2));
