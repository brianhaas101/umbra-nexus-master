/*
  UMBRA NEXUS — Layer 10
  Weighted Composite Scoring
  Isolated. Deterministic. No Black Dragon imports.
*/

const WEIGHTS = Object.freeze({
  authority_score: 0.22,
  relevance_score: 0.24,
  geo_score: 0.14,
  freshness_score: 0.14,
  corroboration_score: 0.26
});

const REJECTED_FIELDS = Object.freeze([
  "manual_weight_override",
  "runtime_weight_override",
  "synthetic_score_boost"
]);

export function processLayer10(input) {
  for (const field of REJECTED_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return Object.freeze({
        layer_id: "layer_10",
        record_id: input?.record_id || null,
        composite_score: 0,
        composite_class: "rejected_weight_or_score_override",
        weight_breakdown: {},
        penalty_applied: Number(input?.penalty_score || 0),
        audit_timestamp: new Date().toISOString()
      });
    }
  }

  const breakdown = {};
  let weighted = 0;

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const value = clamp(Number(input?.[key] || 0), 0, 100);
    const contribution = Number((value * weight).toFixed(4));
    breakdown[key] = Object.freeze({
      input_score: value,
      weight,
      contribution
    });
    weighted += contribution;
  }

  const penalty = clamp(Number(input?.penalty_score || 0), 0, 100);
  const composite = clamp(Number((weighted - penalty).toFixed(4)), 0, 100);

  return Object.freeze({
    layer_id: "layer_10",
    record_id: input?.record_id || null,
    composite_score: composite,
    composite_class: classifyComposite(composite),
    weight_breakdown: Object.freeze(breakdown),
    penalty_applied: penalty,
    audit_timestamp: new Date().toISOString()
  });
}

function classifyComposite(score) {
  if (score >= 80) return "high_confidence_operational_signal";
  if (score >= 60) return "qualified_operational_signal";
  if (score >= 40) return "watchlist_signal";
  return "low_confidence_signal";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}
