const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/snapshots/response_feedback_snapshot.v1.json"
);

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const responses = data.responses || [];

const snapshot = {
  version: "black_dragon_books_response_feedback_snapshot_v1",
  generated_at: new Date().toISOString(),

  totals: data.totals,

  high_confidence_feedback:
    responses
      .filter(r => r.propagation_confidence >= 70)
      .sort((a,b) => b.propagation_confidence - a.propagation_confidence)
      .map(r => ({
        entity_id: r.entity_id,
        organization_name: r.organization_name,
        response_status: r.response_status,
        response_classification: r.response_classification,
        propagation_confidence: r.propagation_confidence,
        next_action: r.next_action,
        estimated_revenue: r.estimated_revenue
      })),

  followups_required:
    responses
      .filter(r => r.followup_required)
      .map(r => ({
        entity_id: r.entity_id,
        organization_name: r.organization_name,
        response_status: r.response_status,
        next_action: r.next_action
      }))
};

fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

console.log(JSON.stringify({
  status: "RESPONSE_FEEDBACK_SNAPSHOT_COMPLETE",
  totals: snapshot.totals,
  output: outputPath
}, null, 2));
