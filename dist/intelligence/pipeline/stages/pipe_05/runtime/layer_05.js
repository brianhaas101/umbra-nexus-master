/*
  UMBRA NEXUS — Layer 05
  Entity Identity Normalization
  Isolated. Deterministic. No Black Dragon imports.
*/

const REJECTED_ENTITY_FIELDS = Object.freeze([
  "inferred_entity",
  "synthetic_entity",
  "runtime_promoted_entity"
]);

export function processLayer05(input) {
  const record = input?.normalized_record || {};
  const reasons = [];

  for (const field of REJECTED_ENTITY_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return rejected(input, "rejected_synthetic_entity", [`rejected_field_present:${field}`]);
    }
  }

  const entity = String(record.entity || "").trim();
  const city = String(record.city || "").trim();

  if (!entity) {
    return rejected(input, "rejected_missing_entity", ["missing_entity"]);
  }

  const entityKey = makeStableKey(entity);
  const cityKey = makeStableKey(city);

  reasons.push("explicit_entity_present");
  reasons.push("stable_entity_key_generated");
  if (city) reasons.push("stable_city_key_generated");

  return Object.freeze({
    layer_id: "layer_05",
    record_id: input?.record_id || null,
    entity_key: entityKey,
    entity_display_name: entity,
    city_key: cityKey,
    identity_status: "normalized_explicit_entity",
    normalization_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
}

function rejected(input, status, reasons) {
  return Object.freeze({
    layer_id: "layer_05",
    record_id: input?.record_id || null,
    entity_key: null,
    entity_display_name: null,
    city_key: null,
    identity_status: status,
    normalization_reasons: reasons,
    audit_timestamp: new Date().toISOString()
  });
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
