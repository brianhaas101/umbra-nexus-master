const fs = require("fs");
const path = require("path");

const file =
  path.resolve(
    "public/data/clients/black_dragon/books/targets/book_targets_scored.v1.json"
  );

const targets = JSON.parse(fs.readFileSync(file, "utf8"));

const audit = {
  version: "batch_002_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: targets.length,

    high_propagation:
      targets.filter(
        t => t.target_classification === "HIGH_PROPAGATION"
      ).length,

    medium_propagation:
      targets.filter(
        t => t.target_classification === "MEDIUM_PROPAGATION"
      ).length,

    low_propagation:
      targets.filter(
        t => t.target_classification === "LOW_PROPAGATION"
      ).length
  },

  integrity: {
    missing_entity_ids:
      targets.filter(t => !t.entity_id).length,

    missing_why_target:
      targets.filter(
        t => !Array.isArray(t.why_target)
      ).length,

    missing_scores:
      targets.filter(
        t => typeof t.computed_influence_score !== "number"
      ).length
  }
};

const out =
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_002_audit.json"
  );

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
