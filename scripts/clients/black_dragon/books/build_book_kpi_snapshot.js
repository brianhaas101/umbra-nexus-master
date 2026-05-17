const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/snapshots/book_kpi_snapshot.v1.json"
);

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const snapshot = {

  version: "book_kpi_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: data.totals,

  top_targets:
    data.top_projected_targets
      .slice(0, 10)
      .map(t => ({
        organization_name: t.organization_name,
        role: t.leader_role,
        lead_temperature: t.lead_temperature,
        projected_revenue: t.projected_revenue,
        projected_member_orders: t.projected_member_orders
      }))
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(snapshot, null, 2)
);

console.log(JSON.stringify({
  status: "BOOK_KPI_SNAPSHOT_COMPLETE",
  output: outputPath
}, null, 2));
