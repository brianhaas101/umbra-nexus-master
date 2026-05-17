const fs = require("fs");
const path = require("path");

const file = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const targets = JSON.parse(fs.readFileSync(file, "utf8"));

function fallbackScore(t) {

  const temp = t.lead_temperature || "REVIEW";

  if (typeof t.propagation_score === "number") {
    return t.propagation_score;
  }

  if (temp === "HOT") {
    return 85;
  }

  if (temp === "WARM") {
    return 65;
  }

  return 40;
}

targets.forEach(t => {

  if (typeof t.propagation_score !== "number") {

    t.propagation_score =
      fallbackScore(t);

    if (typeof t.endorsement_likelihood !== "number") {
      t.endorsement_likelihood =
        Math.round(t.propagation_score * 0.92);
    }

    if (typeof t.bulk_order_potential !== "number") {
      t.bulk_order_potential =
        Math.round(t.propagation_score * 0.84);
    }

    if (typeof t.member_purchase_multiplier !== "number") {
      t.member_purchase_multiplier =
        Math.round(t.propagation_score * 0.95);
    }
  }
});

fs.writeFileSync(file, JSON.stringify(targets, null, 2));

console.log(JSON.stringify({
  status: "PROPAGATION_SCORE_REPAIR_COMPLETE",
  repaired_targets: targets.length,
  output: file
}, null, 2));
