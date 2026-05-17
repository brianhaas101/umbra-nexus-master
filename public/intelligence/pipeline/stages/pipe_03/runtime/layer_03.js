/*
  UMBRA NEXUS — Layer 03
  Source Authority Scoring
  Isolated. Deterministic. No Black Dragon imports.
*/

export function processLayer03(input) {
  const record = input?.normalized_record || {};
  const sourceUrl = normalize(record.source_url);
  const sourceType = normalize(record.source_type);
  const classification = normalize(input?.classification);

  const reasons = [];
  let score = 0;

  if (sourceUrl.endsWith(".gov") || sourceUrl.includes(".gov/")) {
    score += 35;
    reasons.push("government_domain");
  }

  if (sourceUrl.endsWith(".edu") || sourceUrl.includes(".edu/")) {
    score += 25;
    reasons.push("education_domain");
  }

  if (sourceType.includes("public_source")) {
    score += 20;
    reasons.push("public_source_type");
  }

  if (classification === "city_local_primary") {
    score += 25;
    reasons.push("city_local_primary");
  } else if (classification === "city_local_secondary") {
    score += 15;
    reasons.push("city_local_secondary");
  } else if (classification === "regional_or_ambiguous") {
    score += 5;
    reasons.push("regional_or_ambiguous");
  }

  score = clamp(score, 0, 100);

  return Object.freeze({
    layer_id: "layer_03",
    record_id: input?.record_id || null,
    authority_score: score,
    authority_class: classifyAuthority(score),
    authority_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function classifyAuthority(score) {
  if (score >= 85) return "primary_authority";
  if (score >= 70) return "strong_authority";
  if (score >= 45) return "moderate_authority";
  if (score >= 20) return "weak_authority";
  return "insufficient_authority";
}
