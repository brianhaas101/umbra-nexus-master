const fs = require("fs");
const path = require("path");

const viewPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/snapshots/client_book_targets_snapshot.v1.json"
);

const targets = JSON.parse(fs.readFileSync(viewPath, "utf8"));

const snapshot = {

  version: "client_book_targets_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: {
    total_targets: targets.length,

    hot:
      targets.filter(t =>
        t.lead_temperature === "HOT"
      ).length,

    warm:
      targets.filter(t =>
        t.lead_temperature === "WARM"
      ).length,

    review:
      targets.filter(t =>
        t.lead_temperature === "REVIEW"
      ).length
  },

  top_targets:
    targets
      .slice(0, 25)
      .map(t => ({
        organization_name: t.organization_name,
        target_name: t.target_name,
        role: t.leader_role,
        propagation_score: t.propagation_score,
        outreach_status: t.outreach_status,
        next_action: t.next_action
      }))
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(snapshot, null, 2)
);

console.log(JSON.stringify({
  status: "CLIENT_BOOK_TARGET_SNAPSHOT_COMPLETE",
  total_targets: snapshot.totals.total_targets,
  output: outputPath
}, null, 2));
