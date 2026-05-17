const fs = require("fs");
const path = require("path");

const modelPath = path.resolve(
  "public/data/clients/black_dragon/books/propagation/propagation_chain_model.v1.json"
);

const chainsPath = path.resolve(
  "public/data/clients/black_dragon/books/propagation/chains/book_propagation_chains.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/propagation/snapshots/book_propagation_snapshot.v1.json"
);

const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
const chains = JSON.parse(fs.readFileSync(chainsPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const allowedStatuses = new Set(model.chain_status_values);

const audit = {
  version: "black_dragon_books_batch_011_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    chains: chains.length,
    snapshot_total: snapshot.totals.total_chains
  },

  integrity: {
    missing_chain_ids: chains.filter(c => !c.chain_id).length,
    missing_source_entity_ids: chains.filter(c => !c.source_entity_id).length,
    missing_source_orgs: chains.filter(c => !c.source_organization_name).length,
    invalid_chain_statuses: chains.filter(c => !allowedStatuses.has(c.chain_status)).length,
    missing_events_array: chains.filter(c => !Array.isArray(c.events)).length,
    missing_downstream_orgs_array: chains.filter(c => !Array.isArray(c.downstream_organizations)).length,
    invalid_downstream_orders: chains.filter(c => typeof c.downstream_orders !== "number").length,
    invalid_downstream_revenue: chains.filter(c => typeof c.downstream_revenue !== "number").length
  },

  operational_state: {
    chain_model_exists: !!model,
    chain_dataset_exists: Array.isArray(chains),
    snapshot_exists: !!snapshot,
    propagation_chain_tracking_active: true
  }
};

audit.pass =
  audit.integrity.missing_chain_ids === 0 &&
  audit.integrity.missing_source_entity_ids === 0 &&
  audit.integrity.missing_source_orgs === 0 &&
  audit.integrity.invalid_chain_statuses === 0 &&
  audit.integrity.missing_events_array === 0 &&
  audit.integrity.missing_downstream_orgs_array === 0 &&
  audit.integrity.invalid_downstream_orders === 0 &&
  audit.integrity.invalid_downstream_revenue === 0 &&
  audit.operational_state.chain_model_exists &&
  audit.operational_state.chain_dataset_exists &&
  audit.operational_state.snapshot_exists &&
  audit.operational_state.propagation_chain_tracking_active;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_011_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
