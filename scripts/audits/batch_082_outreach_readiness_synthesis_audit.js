const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const synthesis = readJson(
  "public/data/clients/black_dragon/readiness/runtime/outreach_readiness_synthesis.v1.json"
);

const queue = readJson(
  "public/data/clients/black_dragon/readiness/queues/verification_priority_queue.v1.json"
);

const synthesized = synthesis.synthesized_readiness || [];
const verificationQueue = queue.verification_queue || [];

const audit = {
  version: "umbra_batch_082_outreach_readiness_synthesis_audit_v1",
  generated_at: new Date().toISOString(),

  synthesis_integrity: {
    synthesized_entities: synthesis.totals.synthesized_entities,
    outreach_ready: synthesis.totals.outreach_ready,
    verification_required: synthesis.totals.verification_required,
    verification_queue: synthesis.totals.verification_queue,
    has_top_verification_targets:
      Array.isArray(synthesis.top_verification_targets) &&
      synthesis.top_verification_targets.length > 0
  },

  readiness_integrity: {
    all_have_scores:
      synthesized.every(x => typeof x.readiness_score === "number"),

    all_have_tiers:
      synthesized.every(x => !!x.readiness_tier),

    all_have_gates:
      synthesized.every(x => !!x.gates),

    all_have_next_action:
      synthesized.every(x => !!x.next_action),

    all_blocked_if_unverified:
      synthesized
        .filter(x => x.operational_status === "VERIFICATION_REQUIRED")
        .every(x =>
          Array.isArray(x.forbidden_actions) &&
          x.forbidden_actions.includes("NO_OUTREACH")
        )
  },

  queue_integrity: {
    queue_exists:
      verificationQueue.length > 0,

    queue_limit_respected:
      verificationQueue.length <= 150,

    all_queue_items_need_verification:
      verificationQueue.every(x =>
        x.operational_status === "VERIFICATION_REQUIRED"
      ),

    all_queue_items_have_verify_action:
      verificationQueue.every(x =>
        x.next_action.includes("VERIFY")
      )
  },

  safety_integrity: {
    no_unverified_outreach_ready:
      synthesized
        .filter(x => x.operational_status === "OUTREACH_READY")
        .every(x =>
          x.gates.source_verified === true &&
          x.gates.contact_verified === true &&
          x.gates.outreach_allowed === true
        ),

    unverified_entities_blocked:
      synthesized
        .filter(x => x.operational_status === "VERIFICATION_REQUIRED")
        .every(x =>
          x.gates.outreach_allowed === false
        )
  }
};

audit.pass =
  audit.synthesis_integrity.synthesized_entities >= 1000 &&
  audit.synthesis_integrity.verification_required >= 1000 &&
  audit.synthesis_integrity.verification_queue > 0 &&
  audit.synthesis_integrity.has_top_verification_targets &&
  audit.readiness_integrity.all_have_scores &&
  audit.readiness_integrity.all_have_tiers &&
  audit.readiness_integrity.all_have_gates &&
  audit.readiness_integrity.all_have_next_action &&
  audit.readiness_integrity.all_blocked_if_unverified &&
  audit.queue_integrity.queue_exists &&
  audit.queue_integrity.queue_limit_respected &&
  audit.queue_integrity.all_queue_items_need_verification &&
  audit.queue_integrity.all_queue_items_have_verify_action &&
  audit.safety_integrity.no_unverified_outreach_ready &&
  audit.safety_integrity.unverified_entities_blocked;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/readiness/audit/batch_082_outreach_readiness_synthesis_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
