const fs = require("fs");
const path = require("path");

const rawPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/raw/raw_response_ingestion.v1.json"
);

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json"
);

const rawPayload = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const allowed = new Set(rawPayload.allowed_response_statuses || []);

const queueMap = new Map(
  (queue.all_queue_items || []).map(q => [q.entity_id, q])
);

function classifyIntent(r) {
  const status = r.response_status;

  if (status === "CLOSED") return "CONVERSION_CONFIRMED";
  if (status === "BULK_ORDER") return "BULK_ORDER_SIGNAL";
  if (status === "ENDORSED") return "ENDORSEMENT_SIGNAL";
  if (status === "INTERESTED") return "INTEREST_SIGNAL";
  if (status === "RESPONDED") return "ENGAGEMENT_SIGNAL";
  if (status === "NOT_A_FIT") return "NEGATIVE_FIT_SIGNAL";
  if (status === "NO_RESPONSE") return "NO_RESPONSE_SIGNAL";

  return "REVIEW_REQUIRED";
}

function propagationConfidence(r) {
  if (r.response_status === "CLOSED") return 100;
  if (r.response_status === "BULK_ORDER") return 92;
  if (r.response_status === "ENDORSED") return 88;
  if (r.response_status === "INTERESTED") return 70;
  if (r.response_status === "RESPONDED") return 50;
  if (r.response_status === "NO_RESPONSE") return 15;
  if (r.response_status === "NOT_A_FIT") return 0;
  return 25;
}

function nextAction(r) {
  if (r.response_status === "CLOSED") return "LOG_REVENUE_AND_MONITOR_REPEAT_ORDERS";
  if (r.response_status === "BULK_ORDER") return "COORDINATE_BULK_ORDER";
  if (r.response_status === "ENDORSED") return "TRACK_DOWNSTREAM_MEMBER_ORDERS";
  if (r.response_status === "INTERESTED") return "SEND_DETAILS_AND_PURCHASE_LINK";
  if (r.response_status === "RESPONDED") return "QUALIFY_INTEREST";
  if (r.response_status === "NO_RESPONSE") return "SCHEDULE_FOLLOW_UP";
  if (r.response_status === "NOT_A_FIT") return "ARCHIVE_OR_DEPRIORITIZE";
  return "MANUAL_REVIEW";
}

const classified = (rawPayload.responses || [])
  .filter(r => r.entity_id && allowed.has(r.response_status))
  .map(r => {
    const q = queueMap.get(r.entity_id);

    return {
      response_id: r.response_id,
      entity_id: r.entity_id,
      organization_name: r.organization_name,

      matched_queue_item: !!q,
      queue_id: q ? q.queue_id : null,

      prior_priority_score: q ? q.unified_priority_score : null,
      prior_priority_tier: q ? q.unified_priority_tier : null,
      prior_recommended_action: q ? q.recommended_action : null,

      received_at: r.received_at,
      response_status: r.response_status,
      response_text: r.response_text || "",

      response_classification: classifyIntent(r),
      propagation_confidence: propagationConfidence(r),
      next_action: nextAction(r),

      endorsement_type: r.endorsement_type || null,
      books_ordered: Number(r.books_ordered || 0),
      estimated_member_orders: Number(r.estimated_member_orders || 0),
      estimated_revenue: Number(r.estimated_revenue || 0),

      followup_required: !!r.followup_required,

      notes: r.notes || null,
      classified_at: new Date().toISOString()
    };
  });

const payload = {
  version: "black_dragon_books_classified_responses_v1",
  generated_at: new Date().toISOString(),

  totals: {
    raw_responses: (rawPayload.responses || []).length,
    classified_responses: classified.length,
    unmatched_queue_items: classified.filter(r => !r.matched_queue_item).length,
    engagement: classified.filter(r => r.response_classification === "ENGAGEMENT_SIGNAL").length,
    interest: classified.filter(r => r.response_classification === "INTEREST_SIGNAL").length,
    endorsement: classified.filter(r => r.response_classification === "ENDORSEMENT_SIGNAL").length,
    bulk_order: classified.filter(r => r.response_classification === "BULK_ORDER_SIGNAL").length,
    conversion: classified.filter(r => r.response_classification === "CONVERSION_CONFIRMED").length,
    negative_fit: classified.filter(r => r.response_classification === "NEGATIVE_FIT_SIGNAL").length,
    no_response: classified.filter(r => r.response_classification === "NO_RESPONSE_SIGNAL").length
  },

  responses: classified
};

fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

console.log(JSON.stringify({
  status: "RESPONSE_CLASSIFICATION_COMPLETE",
  totals: payload.totals,
  output: outputPath
}, null, 2));
