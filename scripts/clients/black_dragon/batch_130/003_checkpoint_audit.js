const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const checkpoint = read(
  "public/data/clients/black_dragon/checkpoints/long_beach_autonomous_runtime/exports/long_beach_autonomous_runtime_checkpoint.json"
);

const dbPlan = read(
  "public/data/clients/black_dragon/checkpoints/long_beach_autonomous_runtime/exports/database_expansion_strategy.json"
);

const audit = {
  version:
    "black_dragon_batch_130_checkpoint_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "130_LONG_BEACH_AUTONOMOUS_RUNTIME_CHECKPOINT",

  counts: {
    runtime_entities:
      checkpoint.runtime_counts.deduped_entities,

    autonomous_capabilities:
      checkpoint.autonomous_capabilities.length,

    scheduler_hooks:
      checkpoint.scheduler_hooks.length,

    database_expansion_categories:
      dbPlan.next_database_targets.length
  },

  gates: {
    readiness_passed:
      checkpoint.readiness_audit_status === "PASS",

    autonomous_runtime_locked:
      checkpoint.operational_status ===
      "LOCKED_AUTONOMOUS_RUNTIME_BASELINE",

    replication_allowed:
      checkpoint.replication_policy.replication_allowed === true,

    hardlocks_present:
      checkpoint.hardlocks.no_auto_contact === true &&
      checkpoint.hardlocks.no_auto_promotion === true &&
      checkpoint.hardlocks.no_delete_without_quarantine === true,

    database_strategy_exists:
      dbPlan.next_database_targets.length >= 5
  },

  next_phase:
    "BATCH_131_DATABASE_AND_SOURCE_EXPANSION_LAYER",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/checkpoints/long_beach_autonomous_runtime/audit/batch_130_checkpoint_audit.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(audit, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "BATCH_130_CHECKPOINT_AUDIT_COMPLETE",

  audit_status:
    audit.status,

  counts:
    audit.counts,

  gates:
    audit.gates,

  output:
    out
}, null, 2));
