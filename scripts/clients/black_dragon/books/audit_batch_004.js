const fs = require("fs");
const path = require("path");

const file = path.resolve(
  "public/data/clients/black_dragon/books/normalized/book_targets_scored.v2.json"
);

const targets = JSON.parse(fs.readFileSync(file, "utf8"));

const audit = {

  version: "black_dragon_books_batch_004_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: targets.length,

    hot:
      targets.filter(t => t.lead_temperature === "HOT").length,

    warm:
      targets.filter(t => t.lead_temperature === "WARM").length,

    review:
      targets.filter(t => t.lead_temperature === "REVIEW").length
  },

  classifications: {
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
    missing_scores:
      targets.filter(
        t => typeof t.propagation_score !== "number"
      ).length,

    missing_trace:
      targets.filter(
        t => !t._score_trace
      ).length,

    invalid_temperature:
      targets.filter(
        t => !["HOT","WARM","REVIEW"].includes(t.lead_temperature)
      ).length
  },

  top_targets:
    targets
      .sort((a,b) => b.propagation_score - a.propagation_score)
      .slice(0, 5)
      .map(t => ({
        entity_id: t.entity_id,
        organization_name: t.organization_name,
        role: t.leader_role,
        propagation_score: t.propagation_score,
        lead_temperature: t.lead_temperature
      }))
};

audit.pass =
  audit.integrity.missing_scores === 0 &&
  audit.integrity.missing_trace === 0 &&
  audit.integrity.invalid_temperature === 0;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_004_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
