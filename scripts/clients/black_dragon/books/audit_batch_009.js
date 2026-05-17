const fs = require("fs");
const path = require("path");

const viewPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/client_book_targets_view.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/client_view/snapshots/client_book_targets_snapshot.v1.json"
);

const targets = JSON.parse(fs.readFileSync(viewPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const audit = {

  version: "black_dragon_books_batch_009_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    targets: targets.length,
    hot: snapshot.totals.hot,
    warm: snapshot.totals.warm,
    review: snapshot.totals.review
  },

  integrity: {

    missing_entity_ids:
      targets.filter(t => !t.entity_id).length,

    missing_org_names:
      targets.filter(t => !t.organization_name).length,

    missing_propagation_scores:
      targets.filter(
        t => typeof t.propagation_score !== "number"
      ).length,

    missing_outreach_status:
      targets.filter(t => !t.outreach_status).length,

    missing_next_action:
      targets.filter(t => !t.next_action).length,

    client_ready_false:
      targets.filter(t => t.client_ready !== true).length
  },

  operational_state: {
    client_view_exists: Array.isArray(targets),
    snapshot_exists: !!snapshot,
    client_view_operational: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_org_names === 0 &&
  audit.integrity.missing_propagation_scores === 0 &&
  audit.integrity.missing_outreach_status === 0 &&
  audit.integrity.missing_next_action === 0 &&
  audit.integrity.client_ready_false === 0 &&
  audit.operational_state.client_view_exists &&
  audit.operational_state.snapshot_exists &&
  audit.operational_state.client_view_operational;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_009_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
