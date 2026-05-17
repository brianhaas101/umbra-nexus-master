const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

const queueFile =
  "public/data/clients/black_dragon/manual_review/exports/founder_manual_review_queue.v1.json";

const csvFile =
  "public/data/clients/black_dragon/manual_review/exports/founder_manual_review_queue.csv";

const payload =
  readJson(queueFile);

const rows =
  payload.manual_review_rows || [];

const audit = {
  version:
    "umbra_batch_097_founder_manual_review_pass_engine_audit_v1",

  generated_at:
    new Date().toISOString(),

  file_integrity: {
    json_exists:
      exists(queueFile),

    csv_exists:
      exists(csvFile)
  },

  queue_integrity: {
    review_rows:
      rows.length,

    all_have_review_ids:
      rows.every(x => !!x.manual_review_id),

    all_have_entity_ids:
      rows.every(x => !!x.entity_id),

    all_pending:
      rows.every(x =>
        x.reviewer_decision === "PENDING"
      ),

    all_manual_review_false:
      rows.every(x =>
        x.manual_review_pass === false
      ),

    all_founder_only:
      payload.founder_only === true
  },

  safety_integrity: {
    approved_zero:
      payload.totals.approved === 0,

    rejected_zero:
      payload.totals.rejected === 0,

    no_contact_ready:
      rows.every(x => x.contact_ready === false),

    no_outreach:
      rows.every(x => x.outreach_allowed === false)
  }
};

audit.pass =
  audit.file_integrity.json_exists &&
  audit.file_integrity.csv_exists &&
  audit.queue_integrity.review_rows >= 0 &&
  audit.queue_integrity.all_have_review_ids &&
  audit.queue_integrity.all_have_entity_ids &&
  audit.queue_integrity.all_pending &&
  audit.queue_integrity.all_manual_review_false &&
  audit.queue_integrity.all_founder_only &&
  audit.safety_integrity.approved_zero &&
  audit.safety_integrity.rejected_zero &&
  audit.safety_integrity.no_contact_ready &&
  audit.safety_integrity.no_outreach;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/manual_review/audit/batch_097_founder_manual_review_pass_engine_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
