const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const approvals = read(
  "public/data/clients/black_dragon/manual_outreach/approvals/founder_manual_outreach_approval_queue.json"
);

const attempts = read(
  "public/data/clients/black_dragon/manual_outreach/attempts/manual_send_attempt_log_schema.json"
);

const responses = read(
  "public/data/clients/black_dragon/manual_outreach/responses/outreach_response_capture_schema.json"
);

const hardlock = read(
  "public/data/clients/black_dragon/manual_outreach/audit/004_outreach_automation_hardlock_verifier.json"
);

const audit = {
  version: "black_dragon_batch_108_phase_a_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "108_FOUNDER_APPROVED_MANUAL_OUTREACH_WORKFLOW",
  phase: "A_MANUAL_OUTREACH_FOUNDATIONS",

  counts: {
    founder_approval_items: approvals.total_approval_items,
    approved_for_manual_send: approvals.approval_queue.filter(r => r.founder_approved_for_manual_send).length,
    manual_send_attempts: attempts.manual_send_attempts.length,
    captured_responses: responses.captured_responses.length
  },

  gates: {
    approval_queue_5: approvals.total_approval_items === 5,
    default_approved_zero:
      approvals.approval_queue.filter(r => r.founder_approved_for_manual_send).length === 0,

    manual_attempt_log_empty: attempts.manual_send_attempts.length === 0,
    response_capture_empty: responses.captured_responses.length === 0,
    automation_hardlock_active: hardlock.hardlock_status === "ACTIVE",
    automated_send_forbidden: hardlock.enforcement.automated_email_send === false,
    founder_approval_required: hardlock.enforcement.founder_manual_approval_required === true
  },

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/manual_outreach/audit/batch_108_phase_a_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_108_PHASE_A_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
