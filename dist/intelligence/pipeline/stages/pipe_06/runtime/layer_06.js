/*
  UMBRA NEXUS — Layer 06
  Geospatial Coherence Gate
  Isolated. Deterministic. No Black Dragon imports.
*/

const REJECTED_GEO_FIELDS = Object.freeze([
  "inferred_latitude",
  "inferred_longitude",
  "synthetic_location",
  "runtime_generated_location"
]);

export function processLayer06(input) {
  const record = input?.normalized_record || {};
  const reasons = [];

  for (const field of REJECTED_GEO_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return output(input, 0, "geo_rejected_synthetic_location", [`rejected_field_present:${field}`]);
    }
  }

  const city = String(record.city || "").trim();
  const cityKey = input?.city_key || makeStableKey(city);
  const entityKey = input?.entity_key || null;
  const classification = normalize(input?.classification);

  if (!city) {
    return output(input, 0, "geo_ambiguous_no_coordinates", ["missing_city"]);
  }

  let score = 40;
  reasons.push("explicit_city_present");

  if (cityKey) {
    score += 15;
    reasons.push("city_key_present");
  }

  if (entityKey) {
    score += 10;
    reasons.push("entity_key_present");
  }

  if (classification === "city_local_primary") {
    score += 20;
    reasons.push("city_local_primary_support");
  } else if (classification === "city_local_secondary") {
    score += 10;
    reasons.push("city_local_secondary_support");
  }

  const hasLat = record.latitude !== undefined && record.latitude !== null && record.latitude !== "";
  const hasLon = record.longitude !== undefined && record.longitude !== null && record.longitude !== "";

  if (hasLat || hasLon) {
    const lat = Number(record.latitude);
    const lon = Number(record.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return output(input, 0, "geo_rejected_invalid_coordinates", ["invalid_coordinate_range"]);
    }

    score += 15;
    reasons.push("valid_explicit_coordinates_present");

    return output(input, clamp(score, 0, 100), "geo_coherent_explicit_coordinates", reasons);
  }

  if (score >= 60) {
    return output(input, clamp(score, 0, 100), "geo_coherent_explicit_city", reasons);
  }

  return output(input, clamp(score, 0, 100), "geo_ambiguous_no_coordinates", reasons);
}

function output(input, score, status, reasons) {
  return Object.freeze({
    layer_id: "layer_06",
    record_id: input?.record_id || null,
    city_key: input?.city_key || makeStableKey(input?.normalized_record?.city),
    entity_key: input?.entity_key || null,
    geo_score: score,
    geo_status: status,
    geo_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function makeStableKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}
