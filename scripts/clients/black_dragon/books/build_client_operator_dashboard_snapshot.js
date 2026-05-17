const fs = require("fs");
const path = require("path");

const dashboardPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/client_operator_dashboard.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/dashboard/snapshots/client_operator_dashboard_snapshot.v1.json"
);

const dashboard = JSON.parse(fs.readFileSync(dashboardPath, "utf8"));

const snapshot = {
  version: "black_dragon_books_client_operator_dashboard_snapshot_v1",
  generated_at: new Date().toISOString(),

  client: dashboard.client,
  headline_metrics: dashboard.headline_metrics,
  priority_summary: dashboard.priority_summary,
  outreach_summary: dashboard.outreach_summary,
  response_summary: dashboard.response_summary,

  next_best_actions:
    dashboard.top_operational_actions.slice(0, 5)
};

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

console.log(JSON.stringify({
  status: "CLIENT_OPERATOR_DASHBOARD_SNAPSHOT_COMPLETE",
  output: outputPath
}, null, 2));
