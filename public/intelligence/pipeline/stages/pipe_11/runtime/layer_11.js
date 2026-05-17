/*
  UMBRA NEXUS — Layer 11
  Explainable Output Serialization
  Isolated. Deterministic. No Black Dragon imports.
*/

const REJECTED_FIELDS = Object.freeze([
  "generated_claim",
  "synthetic_summary",
  "hidden_score_adjustment",
  "black_dragon_runtime_reference"
]);

export function processLayer11(input) {
  for (const field of REJECTED_FIELDS) {
    if (input?.[field] !== undefined && input?.[field] !== null && input?.[field] !== false) {
      return rejected(input, [`rejected_field_present:${field}`]);
    }
  }

  const layers = input?.layers || {};
  const explanationId = makeStableId([
    input?.record_id,
    input?.entity_key,
    input?.city_key,
    input?.composite_score,
    input?.composite_class
  ].join("|"));

  return Object.freeze({
    layer_id: "layer_11",
    record_id: input?.record_id || null,
    explanation_id: explanationId,
    entity_key: input?.entity_key || null,
    city_key: input?.city_key || null,
    summary: Object.freeze({
      composite_score: clamp(Number(input?.composite_score || 0), 0, 100),
      composite_class: String(input?.composite_class || "unknown"),
      explanation_basis: "serialized_prior_layer_outputs_only"
    }),
    score_trace: Object.freeze({
      authority: pick(layers.layer_03, ["authority_score", "authority_class", "authority_reasons"]),
      relevance: pick(layers.layer_04, ["relevance_score", "relevance_class", "relevance_reasons"]),
      geo: pick(layers.layer_06, ["geo_score", "geo_status", "geo_reasons"]),
      freshness: pick(layers.layer_07, ["freshness_score", "freshness_class", "freshness_reasons"]),
      corroboration: pick(layers.layer_08, ["corroboration_score", "corroboration_class", "corroboration_reasons"]),
      penalty: pick(layers.layer_09, ["penalty_score", "penalty_class", "penalty_reasons"]),
      composite: pick(layers.layer_10, ["composite_score", "composite_class", "weight_breakdown", "penalty_applied"])
    }),
    provenance_trace: Object.freeze({
      intake: pick(layers.layer_01, ["record_id", "provenance_status", "accepted", "rejection_reasons"]),
      source_authority: pick(layers.layer_03, ["authority_reasons"]),
      corroboration: pick(layers.layer_08, ["corroboration_reasons"])
    }),
    audit_timestamp: new Date().toISOString()
  });
}

function rejected(input, reasons) {
  return Object.freeze({
    layer_id: "layer_11",
    record_id: input?.record_id || null,
    explanation_id: null,
    entity_key: input?.entity_key || null,
    city_key: input?.city_key || null,
    summary: Object.freeze({
      composite_score: 0,
      composite_class: "rejected_explanation_input",
      explanation_basis: "rejected"
    }),
    score_trace: Object.freeze({}),
    provenance_trace: Object.freeze({ rejection_reasons: reasons }),
    audit_timestamp: new Date().toISOString()
  });
}

function pick(source, keys) {
  const out = {};
  const src = source || {};
  for (const key of keys) {
    if (src[key] !== undefined) out[key] = src[key];
  }
  return Object.freeze(out);
}

function makeStableId(value) {
  let hash = 2166136261;
  const basis = String(value || "").trim().toLowerCase();

  for (let i = 0; i < basis.length; i++) {
    hash ^= basis.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return `exp_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}
