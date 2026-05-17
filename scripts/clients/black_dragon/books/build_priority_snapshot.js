const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/contactability_weighted_priority_index.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/snapshots/priority_snapshot.v1.json"
);

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const snapshot = {

  version: "black_dragon_books_priority_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: data.totals,

  top_10_operational_targets:
    data.top_operational_targets
      .slice(0, 10)
      .map(t => ({
        organization_name: t.organization_name,
        leader_role: t.leader_role,
        propagation_score: t.propagation_score,
        contactability_score: t.contactability_score,
        unified_priority_score: t.unified_priority_score,
        unified_priority_tier: t.unified_priority_tier,
        recommended_action: t.recommended_action
      }))
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(snapshot, null, 2)
);

console.log(JSON.stringify({
  status: "PRIORITY_SNAPSHOT_REPAIR_COMPLETE",
  totals: snapshot.totals,
  output: outputPath
}, null, 2));
