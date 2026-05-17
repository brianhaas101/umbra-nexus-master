const fs = require("fs");
const path = require("path");

const file =
  path.resolve(
    "public/data/clients/black_dragon/books/targets/book_targets_seed.v1.json"
  );

const targets = JSON.parse(fs.readFileSync(file, "utf8"));

targets.forEach(t => {

  const avg =
    (
      t.endorsement_likelihood +
      t.bulk_order_potential +
      t.member_purchase_multiplier +
      t.propagation_score
    ) / 4;

  t.computed_influence_score = Math.round(avg);

  if (avg >= 85) {
    t.target_classification = "HIGH_PROPAGATION";
  }
  else if (avg >= 70) {
    t.target_classification = "MEDIUM_PROPAGATION";
  }
  else {
    t.target_classification = "LOW_PROPAGATION";
  }
});

const output =
  path.resolve(
    "public/data/clients/black_dragon/books/targets/book_targets_scored.v1.json"
  );

fs.writeFileSync(output, JSON.stringify(targets, null, 2));

console.log(JSON.stringify({
  status: "PROPAGATION_SCORING_COMPLETE",
  targets: targets.length,
  output
}, null, 2));
