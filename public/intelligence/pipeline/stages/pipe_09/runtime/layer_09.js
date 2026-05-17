/*
  UMBRA NEXUS — Layer 09
  Risk / Uncertainty Penalty Engine
  Isolated. Deterministic. No Black Dragon imports.
*/

const REJECTED_FIELDS = Object.freeze([
  "manual_override",
  "runtime_promotion",
  "synthetic_confidence_boost"
]);

export function processLayer09(input) {
  for (const field of REJECTED_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return output(input, 100, "rejected_runtime_or_synthetic_adjustment", [`rejected_field_present:${field}`]);
    }
  }

  const reasons = [];
  let penalty = 0;

  const authorityScore = Number(input?.authority_score || 0);
  const authorityClass = norm(input?.authority_class);
  const geoStatus = norm(input?.geo_status);
  const freshnessClass = norm(input?.freshness_class);
  const corroborationClass = norm(input?.corroboration_class);

  if (authorityScore < 20 || authorityClass === "insufficient_authority") {
    penalty += 30;
    reasons.push("insufficient_authority_penalty");
  } else if (authorityScore < 45 || authorityClass === "weak_authority") {
    penalty += 18;
    reasons.push("weak_authority_penalty");
  } else if (authorityScore < 70 || authorityClass === "moderate_authority") {
    penalty += 8;
    reasons.push("moderate_authority_penalty");
  }

  if (geoStatus === "geo_rejected_invalid_coordinates" || geoStatus === "geo_rejected_synthetic_location") {
    penalty += 35;
    reasons.push("geo_rejection_penalty");
  } else if (geoStatus === "geo_ambiguous_no_coordinates") {
    penalty += 12;
    reasons.push("geo_ambiguity_penalty");
  }

  if (freshnessClass === "archival_over_365_days") {
    penalty += 20;
    reasons.push("archival_freshness_penalty");
  } else if (freshnessClass === "stale_365_days") {
    penalty += 12;
    reasons.push("stale_freshness_penalty");
  } else if (freshnessClass === "rejected_invalid_timestamp") {
    penalty += 25;
    reasons.push("invalid_timestamp_penalty");
  }

  if (corroborationClass === "weak_or_uncorroborated") {
    penalty += 20;
    reasons.push("weak_corroboration_penalty");
  } else if (corroborationClass === "single_authoritative_source") {
    penalty += 6;
    reasons.push("single_source_penalty");
  }

  penalty = clamp(penalty, 0, 100);

  return output(input, penalty, classifyPenalty(penalty), reasons);
}

function output(input, penalty, klass, reasons) {
  return Object.freeze({
    layer_id: "layer_09",
    record_id: input?.record_id || null,
    penalty_score: penalty,
    penalty_class: klass,
    penalty_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}

function norm(value) {
  return String(value || "").trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function classifyPenalty(score) {
  if (score >= 60) return "major_uncertainty_penalty";
  if (score >= 30) return "moderate_uncertainty_penalty";
  if (score >= 10) return "minor_uncertainty_penalty";
  return "no_material_penalty";
}
