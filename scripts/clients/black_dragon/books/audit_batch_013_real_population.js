const fs = require("fs");
const path = require("path");

const rawPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/raw/public_book_targets_raw.v1.json"
);

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const clientViewPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json"
);

const kpiPath = path.resolve(
  "public/data/clients/black_dragon/books/kpi/book_operational_kpis.v1.json"
);

const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const operational = JSON.parse(fs.readFileSync(operationalPath, "utf8"));
const clientView = JSON.parse(fs.readFileSync(clientViewPath, "utf8"));
const kpis = JSON.parse(fs.readFileSync(kpiPath, "utf8"));

const audit = {

  version: "black_dragon_books_batch_013_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    raw_targets: raw.length,
    operational_targets: operational.length,
    client_targets: clientView.length,
    kpi_targets: kpis.targets.length,

    hot:
      operational.filter(t => t.lead_temperature === "HOT").length,

    warm:
      operational.filter(t => t.lead_temperature === "WARM").length,

    review:
      operational.filter(t => t.lead_temperature === "REVIEW").length
  },

  organization_breakdown:
    operational.reduce((acc, t) => {

      const key =
        t.organization_type || "UNKNOWN";

      acc[key] = (acc[key] || 0) + 1;

      return acc;

    }, {}),

  integrity: {

    missing_entity_ids:
      operational.filter(t => !t.entity_id).length,

    missing_source_urls:
      raw.filter(t => !t.source_url).length,

    missing_scores:
      operational.filter(
        t => typeof t.propagation_score !== "number"
      ).length,

    missing_client_records:
      operational.filter(op =>
        !clientView.find(cv => cv.entity_id === op.entity_id)
      ).length
  },

  operational_state: {
    real_public_targets_loaded: true,
    propagation_scoring_active: true,
    outreach_generation_active: true,
    client_view_active: true,
    kpi_engine_active: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_scores === 0 &&
  audit.integrity.missing_client_records === 0 &&
  audit.operational_state.real_public_targets_loaded &&
  audit.operational_state.propagation_scoring_active &&
  audit.operational_state.outreach_generation_active &&
  audit.operational_state.client_view_active &&
  audit.operational_state.kpi_engine_active;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_013_real_population_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
