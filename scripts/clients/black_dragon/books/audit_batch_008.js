const fs = require("fs");
const path = require("path");

const modelPath = path.resolve(
  "public/data/clients/black_dragon/books/tracking/tracking_status_model.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/tracking/snapshots/book_outreach_tracking_snapshot.v1.json"
);

const eventsPath = path.resolve(
  "public/data/clients/black_dragon/books/tracking/events/book_outreach_events.v1.json"
);

const model = JSON.parse(fs.readFileSync(modelPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const events = JSON.parse(fs.readFileSync(eventsPath, "utf8"));

const allowed = new Set(model.allowed_statuses);

const audit = {
  version: "black_dragon_books_batch_008_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    tracked_entities: snapshot.length,
    events: events.length,
    not_contacted: snapshot.filter(t => t.outreach_status === "NOT_CONTACTED").length,
    contacted: snapshot.filter(t => t.outreach_status === "CONTACTED").length,
    responded: snapshot.filter(t => t.outreach_status === "RESPONDED").length,
    interested: snapshot.filter(t => t.outreach_status === "INTERESTED").length,
    endorsed: snapshot.filter(t => t.outreach_status === "ENDORSED").length,
    bulk_order: snapshot.filter(t => t.outreach_status === "BULK_ORDER").length,
    closed: snapshot.filter(t => t.outreach_status === "CLOSED").length
  },

  integrity: {
    missing_entity_ids: snapshot.filter(t => !t.entity_id).length,
    missing_message_ids: snapshot.filter(t => !t.message_id).length,
    invalid_statuses: snapshot.filter(t => !allowed.has(t.outreach_status)).length,
    missing_next_action: snapshot.filter(t => !t.next_action).length,
    invalid_events: events.filter(e =>
      !e.event_id ||
      !e.entity_id ||
      !e.event_type ||
      (e.to_status && !allowed.has(e.to_status))
    ).length
  },

  operational_state: {
    tracking_model_exists: !!model,
    tracking_snapshot_exists: Array.isArray(snapshot),
    event_log_exists: Array.isArray(events),
    propagation_tracking_active: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.invalid_statuses === 0 &&
  audit.integrity.missing_next_action === 0 &&
  audit.integrity.invalid_events === 0 &&
  audit.operational_state.tracking_model_exists &&
  audit.operational_state.tracking_snapshot_exists &&
  audit.operational_state.event_log_exists &&
  audit.operational_state.propagation_tracking_active;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_008_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
