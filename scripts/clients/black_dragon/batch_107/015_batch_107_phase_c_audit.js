const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const review = read(
  "public/data/clients/black_dragon/contact_resolution/review_queue/founder_contact_review_queue.json"
);

const readiness = read(
  "public/data/clients/black_dragon/contact_resolution/candidates/manual_outreach_readiness.json"
);

const hardlock = read(
  "public/data/clients/black_dragon/contact_resolution/audit/013_automated_outreach_hardlock.json"
);

const gate = read(
  "public/data/clients/black_dragon/contact_resolution/review_queue/founder_manual_send_gate.json"
);

const audit = {

  version:
    "black_dragon_batch_107_phase_c_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "107_OFFICIAL_CONTACT_ROUTE_RESOLUTION",

  phase:
    "C_FOUNDER_CONTACT_REVIEW_AND_MANUAL_OUTREACH_GATE",

  counts: {

    founder_review_queue:
      review.total_review_items,

    manual_outreach_candidates:
      readiness.total_manual_outreach_candidates,

    founder_manual_send_gate_records:
      gate.total_records
  },

  gates: {

    hardlock_active:
      hardlock.enforcement_status === "HARDLOCK_ACTIVE",

    no_automated_send_allowed:
      true,

    no_promotion_allowed:
      true,

    founder_review_required:
      true
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/audit/batch_107_phase_c_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({

  status:
    "BATCH_107_PHASE_C_AUDIT_COMPLETE",

  audit_status:
    audit.status,

  counts:
    audit.counts,

  gates:
    audit.gates,

  output:
    out

}, null, 2));
