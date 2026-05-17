const fs = require("fs");
const path = require("path");

const targetPath = path.resolve(
  "public/data/clients/black_dragon/books/normalized/book_targets_normalized.v1.json"
);

const configPath = path.resolve(
  "public/data/clients/black_dragon/books/schemas/book_propagation_scoring_config.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/normalized/book_targets_scored.v2.json"
);

const targets = JSON.parse(fs.readFileSync(targetPath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

function sumSignals(signals, map) {
  return (signals || []).reduce((acc, s) => {
    return acc + (map[s] || 0);
  }, 0);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

targets.forEach(t => {

  const roleScore =
    config.leader_role_weights[t.leader_role] || 0;

  const orgScore =
    config.organization_type_weights[t.organization_type] || 0;

  const highSignalScore =
    sumSignals(
      t.high_value_signals,
      config.high_signal_weights
    );

  const supportingSignalScore =
    sumSignals(
      t.supporting_signals,
      config.supporting_signal_weights
    );

  const countryScore =
    config.country_tier_weights[t.country_tier] || 0;

  const total =
    roleScore +
    orgScore +
    highSignalScore +
    supportingSignalScore +
    countryScore;

  const normalized =
    clamp(Math.round(total), 0, 100);

  t.endorsement_likelihood =
    clamp(Math.round(normalized * 0.92), 0, 100);

  t.bulk_order_potential =
    clamp(Math.round(normalized * 0.84), 0, 100);

  t.member_purchase_multiplier =
    clamp(Math.round(normalized * 0.95), 0, 100);

  t.propagation_score = normalized;

  if (
    normalized >=
    config.classification_thresholds.HOT
  ) {
    t.lead_temperature = "HOT";
    t.target_classification = "HIGH_PROPAGATION";
  }

  else if (
    normalized >=
    config.classification_thresholds.WARM
  ) {
    t.lead_temperature = "WARM";
    t.target_classification = "MEDIUM_PROPAGATION";
  }

  else {
    t.lead_temperature = "REVIEW";
    t.target_classification = "LOW_PROPAGATION";
  }

  t._score_trace = {
    roleScore,
    orgScore,
    highSignalScore,
    supportingSignalScore,
    countryScore,
    total
  };
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(targets, null, 2)
);

console.log(JSON.stringify({
  status: "BOOK_PROPAGATION_SCORING_COMPLETE",
  targets: targets.length,
  output: outputPath
}, null, 2));
