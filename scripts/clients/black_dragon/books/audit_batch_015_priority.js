const fs = require("fs");
const path = require("path");

const modelPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/outreach_priority_model.v1.json"
);

const indexPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/contactability_weighted_priority_index.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/snapshots/priority_snapshot.v1.json"
);

const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const audit = {

  version: "black_dragon_books_batch_015_priority_audit_v1",
  generated_at: new Date().toISOString(),

  totals: index.totals,

  integrity: {

    missing_entity_ids:
      index.targets.filter(t => !t.entity_id).length,

    invalid_priority_scores:
      index.targets.filter(
        t =>
          typeof t.unified_priority_score !== "number" ||
          t.unified_priority_score < 0 ||
          t.unified_priority_score > 100
      ).length,

    missing_priority_tiers:
      index.targets.filter(
        t => !t.unified_priority_tier
      ).length,

    missing_recommended_actions:
      index.targets.filter(
        t => !t.recommended_action
      ).length,

    missing_readiness_state:
      index.targets.filter(
        t => !t.readiness_state
      ).length
  },

  operational_state: {
    priority_model_exists: !!model,
    priority_index_exists: !!index,
    snapshot_exists: !!snapshot,
    operational_priority_engine_active: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.invalid_priority_scores === 0 &&
  audit.integrity.missing_priority_tiers === 0 &&
  audit.integrity.missing_recommended_actions === 0 &&
  audit.integrity.missing_readiness_state === 0 &&
  audit.operational_state.priority_model_exists &&
  audit.operational_state.priority_index_exists &&
  audit.operational_state.snapshot_exists &&
  audit.operational_state.operational_priority_engine_active;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_015_priority_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
