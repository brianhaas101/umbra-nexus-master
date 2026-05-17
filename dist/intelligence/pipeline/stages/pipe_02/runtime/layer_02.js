/*
  UMBRA NEXUS — Layer 02
  City-Local Source Classifier
  Isolated. Deterministic. No Black Dragon imports.
*/

export function processLayer02(layer01Output) {
  if (!layer01Output || layer01Output.accepted !== true) {
    return Object.freeze({
      layer_id: "layer_02",
      record_id: layer01Output?.record_id || null,
      city: null,
      entity: null,
      city_local_score: 0,
      classification: "rejected_prior_layer",
      classification_reasons: ["layer_01_not_accepted"],
      audit_timestamp: new Date().toISOString()
    });
  }

  const record = layer01Output.normalized_record;
  const reasons = [];
  let score = 0;

  const city = normalize(record.city);
  const sourceUrl = normalize(record.source_url);
  const sourceTitle = normalize(record.source_title);
  const claim = normalize(record.claim);

  if (city && sourceTitle.includes(city)) {
    score += 35;
    reasons.push("source_title_contains_city");
  }

  if (city && claim.includes(city)) {
    score += 25;
    reasons.push("claim_contains_city");
  }

  if (sourceUrl.includes(".gov")) {
    score += 20;
    reasons.push("government_source_domain");
  }

  if (sourceUrl.includes(city.replaceAll(" ", "")) || sourceUrl.includes(city.replaceAll(" ", "-"))) {
    score += 20;
    reasons.push("source_url_contains_city_slug");
  }

  score = clamp(score, 0, 100);

  return Object.freeze({
    layer_id: "layer_02",
    record_id: layer01Output.record_id,
    city: record.city,
    entity: record.entity,
    city_local_score: score,
    classification: classify(score),
    classification_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function classify(score) {
  if (score >= 75) return "city_local_primary";
  if (score >= 50) return "city_local_secondary";
  if (score >= 25) return "regional_or_ambiguous";
  return "non_city_local";
}
