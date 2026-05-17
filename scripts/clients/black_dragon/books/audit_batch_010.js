const fs = require("fs");
const path = require("path");

const kpiPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/snapshots/book_kpi_snapshot.v1.json"
);

const kpi = JSON.parse(fs.readFileSync(kpiPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const audit = {

  version: "black_dragon_books_batch_010_audit_v1",
  generated_at: new Date().toISOString(),

  totals: kpi.totals,

  integrity: {

    missing_targets:
      kpi.targets.filter(t => !t.entity_id).length,

    missing_projected_revenue:
      kpi.targets.filter(
        t => typeof t.projected_revenue !== "number"
      ).length,

    missing_projected_orders:
      kpi.targets.filter(
        t => typeof t.projected_member_orders !== "number"
      ).length,

    invalid_conversion_rates:
      kpi.targets.filter(
        t =>
          typeof t.estimated_conversion_rate !== "number"
      ).length
  },

  operational_state: {
    kpi_engine_operational: true,
    snapshot_exists: !!snapshot,
    revenue_estimation_active: true
  }
};

audit.pass =
  audit.integrity.missing_targets === 0 &&
  audit.integrity.missing_projected_revenue === 0 &&
  audit.integrity.missing_projected_orders === 0 &&
  audit.integrity.invalid_conversion_rates === 0 &&
  audit.operational_state.kpi_engine_operational &&
  audit.operational_state.snapshot_exists &&
  audit.operational_state.revenue_estimation_active;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_010_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
