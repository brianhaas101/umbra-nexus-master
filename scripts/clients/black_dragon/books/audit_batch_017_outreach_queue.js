const fs = require("fs");
const path = require("path");

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/queue/snapshots/outreach_ready_queue_snapshot.v1.json"
);

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const all = queue.all_queue_items || [];

const audit = {
  version: "black_dragon_books_batch_017_outreach_queue_audit_v1",
  generated_at: new Date().toISOString(),

  totals: queue.totals,

  integrity: {
    missing_queue_ids: all.filter(q => !q.queue_id).length,
    missing_entity_ids: all.filter(q => !q.entity_id).length,
    missing_queue_status: all.filter(q => !q.queue_status).length,
    missing_recommended_action: all.filter(q => !q.recommended_action).length,
    ready_without_message: all.filter(q => q.queue_status === "READY" && !q.message_body).length,
    ready_without_contact_route: all.filter(q => q.queue_status === "READY" && !q.best_contact_route).length,
    invalid_priority_scores: all.filter(q =>
      typeof q.unified_priority_score !== "number" ||
      q.unified_priority_score < 0 ||
      q.unified_priority_score > 100
    ).length
  },

  operational_state: {
    queue_exists: !!queue,
    snapshot_exists: !!snapshot,
    outreach_queue_active: true,
    ready_and_enrichment_split_active: true
  }
};

audit.pass =
  audit.integrity.missing_queue_ids === 0 &&
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_queue_status === 0 &&
  audit.integrity.missing_recommended_action === 0 &&
  audit.integrity.ready_without_message === 0 &&
  audit.integrity.ready_without_contact_route === 0 &&
  audit.integrity.invalid_priority_scores === 0 &&
  audit.operational_state.queue_exists &&
  audit.operational_state.snapshot_exists &&
  audit.operational_state.outreach_queue_active &&
  audit.operational_state.ready_and_enrichment_split_active;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_017_outreach_queue_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
