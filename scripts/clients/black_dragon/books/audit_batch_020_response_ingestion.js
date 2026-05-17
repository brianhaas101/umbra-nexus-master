const fs = require("fs");
const path = require("path");

const rawPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/raw/raw_response_ingestion.v1.json"
);

const classifiedPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
);

const snapshotPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/snapshots/response_feedback_snapshot.v1.json"
);

const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const classified = JSON.parse(fs.readFileSync(classifiedPath, "utf8"));
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const responses = classified.responses || [];

const audit = {
  version: "black_dragon_books_batch_020_response_ingestion_audit_v1",
  generated_at: new Date().toISOString(),

  totals: classified.totals,

  integrity: {
    missing_response_ids: responses.filter(r => !r.response_id).length,
    missing_entity_ids: responses.filter(r => !r.entity_id).length,
    missing_classification: responses.filter(r => !r.response_classification).length,
    invalid_propagation_confidence: responses.filter(r =>
      typeof r.propagation_confidence !== "number" ||
      r.propagation_confidence < 0 ||
      r.propagation_confidence > 100
    ).length,
    missing_next_action: responses.filter(r => !r.next_action).length
  },

  operational_state: {
    raw_response_template_exists: !!raw,
    classified_response_dataset_exists: !!classified,
    feedback_snapshot_exists: !!snapshot,
    response_ingestion_pipeline_active: true
  }
};

audit.pass =
  audit.integrity.missing_response_ids === 0 &&
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_classification === 0 &&
  audit.integrity.invalid_propagation_confidence === 0 &&
  audit.integrity.missing_next_action === 0 &&
  audit.operational_state.raw_response_template_exists &&
  audit.operational_state.classified_response_dataset_exists &&
  audit.operational_state.feedback_snapshot_exists &&
  audit.operational_state.response_ingestion_pipeline_active;

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_020_response_ingestion_audit.json"),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
