/*
  UMBRA NEXUS — Layer 07
  Temporal Freshness Scoring
  Isolated. Deterministic. No Black Dragon imports.
*/

const REJECTED_TIME_FIELDS = Object.freeze([
  "inferred_date",
  "synthetic_timestamp",
  "runtime_generated_timestamp"
]);

export function processLayer07(input, referenceNow = new Date()) {
  const reasons = [];

  for (const field of REJECTED_TIME_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return output(input, null, 0, "rejected_invalid_timestamp", [`rejected_field_present:${field}`]);
    }
  }

  const retrievedAt = input?.normalized_record?.retrieved_at;
  const retrievedDate = new Date(retrievedAt);
  const nowDate = new Date(referenceNow);

  if (!retrievedAt || Number.isNaN(retrievedDate.getTime()) || Number.isNaN(nowDate.getTime())) {
    return output(input, retrievedAt || null, 0, "rejected_invalid_timestamp", ["invalid_or_missing_retrieved_at"]);
  }

  const ageDays = Math.max(0, Math.floor((nowDate.getTime() - retrievedDate.getTime()) / 86400000));
  reasons.push(`age_days:${ageDays}`);

  let score = 0;
  let klass = "archival_over_365_days";

  if (ageDays <= 30) {
    score = 100;
    klass = "current_30_days";
  } else if (ageDays <= 90) {
    score = 80;
    klass = "recent_90_days";
  } else if (ageDays <= 180) {
    score = 60;
    klass = "usable_180_days";
  } else if (ageDays <= 365) {
    score = 35;
    klass = "stale_365_days";
  } else {
    score = 15;
    klass = "archival_over_365_days";
  }

  return output(input, retrievedAt, score, klass, reasons);
}

function output(input, retrievedAt, score, klass, reasons) {
  return Object.freeze({
    layer_id: "layer_07",
    record_id: input?.record_id || null,
    retrieved_at: retrievedAt,
    freshness_score: score,
    freshness_class: klass,
    freshness_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}
