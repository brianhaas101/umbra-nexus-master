const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const indexPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_hotwarm_index.v1.json"
);

const targets = JSON.parse(fs.readFileSync(operationalPath, "utf8"));
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

const audit = {

  version: "black_dragon_books_batch_006_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    operational_targets: targets.length,
    hot_targets: index.totals.hot,
    warm_targets: index.totals.warm,
    review_targets: index.totals.review
  },

  integrity: {

    missing_entity_ids:
      targets.filter(t => !t.entity_id).length,

    missing_organization_names:
      targets.filter(t => !t.organization_name).length,

    missing_operational_status:
      targets.filter(t => !t.operational_status).length,

    invalid_temperatures:
      targets.filter(t =>
        !["HOT","WARM","REVIEW"].includes(t.lead_temperature)
      ).length
  },

  operational_state: {
    dataset_exists: Array.isArray(targets),
    index_exists: !!index,
    operational_pipeline_active: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_organization_names === 0 &&
  audit.integrity.missing_operational_status === 0 &&
  audit.integrity.invalid_temperatures === 0 &&
  audit.operational_state.dataset_exists &&
  audit.operational_state.index_exists;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_006_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
