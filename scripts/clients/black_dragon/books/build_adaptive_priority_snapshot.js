const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/adaptive_priority/snapshots/adaptive_priority_snapshot.v1.json"
);

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const snapshot = {

  version: "black_dragon_books_adaptive_priority_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: data.totals,

  top_adaptive_targets:
    data.top_operational_targets
      .slice(0, 15)
      .map(t => ({
        organization_name: t.organization_name,
        prior_priority_score: t.prior_priority_score,
        adaptive_priority_score: t.adaptive_priority_score,
        adaptive_priority_delta: t.adaptive_priority_delta,
        adaptive_priority_tier: t.adaptive_priority_tier,
        response_classification: t.response_classification,
        adaptive_recommended_action: t.adaptive_recommended_action
      }))
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(snapshot, null, 2)
);

console.log(JSON.stringify({
  status: "ADAPTIVE_PRIORITY_SNAPSHOT_COMPLETE",
  totals: snapshot.totals,
  output: outputPath
}, null, 2));
