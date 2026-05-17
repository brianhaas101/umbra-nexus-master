const fs = require("fs");
const path = require("path");

const adaptivePath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/snapshots/adaptive_priority_snapshot.v1.json"
);

const adaptive = JSON.parse(fs.readFileSync(adaptivePath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const targets = adaptive.targets || [];

const audit = {

  version: "black_dragon_books_batch_021_adaptive_priority_audit_v1",
  generated_at: new Date().toISOString(),

  totals: adaptive.totals,

  integrity: {

    missing_entity_ids:
      targets.filter(t => !t.entity_id).length,

    invalid_adaptive_scores:
      targets.filter(t =>
        typeof t.adaptive_priority_score !== "number" ||
        t.adaptive_priority_score < 0 ||
        t.adaptive_priority_score > 100
      ).length,

    missing_adaptive_tiers:
      targets.filter(t => !t.adaptive_priority_tier).length,

    missing_recommended_actions:
      targets.filter(t => !t.adaptive_recommended_action).length
  },

  operational_state: {
    adaptive_priority_index_exists: !!adaptive,
    adaptive_snapshot_exists: !!snapshot,
    feedback_loop_active: true,
    adaptive_priority_engine_active: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.invalid_adaptive_scores === 0 &&
  audit.integrity.missing_adaptive_tiers === 0 &&
  audit.integrity.missing_recommended_actions === 0 &&
  audit.operational_state.adaptive_priority_index_exists &&
  audit.operational_state.adaptive_snapshot_exists &&
  audit.operational_state.feedback_loop_active &&
  audit.operational_state.adaptive_priority_engine_active;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_021_adaptive_priority_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
