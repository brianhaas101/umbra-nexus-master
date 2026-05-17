import { replayHash } from "../runtime/l01_replay_hash.js";

export const SOURCE_ID = "usaspending_gov";
export const LAYER_ID = "L01";
export const NORMALIZER_ACTIVE = true;

export function describeNormalizer() {
  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    active: NORMALIZER_ACTIVE,
    output_schema: "federal_intelligence_entity_contribution",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    black_dragon_coupling: false
  });
}

export function normalizeRecord(rawEnvelope) {
  if (!NORMALIZER_ACTIVE) {
    throw new Error("Normalizer inactive.");
  }

  if (rawEnvelope.layer_id !== "L01") {
    throw new Error("Invalid layer_id.");
  }

  if (rawEnvelope.source_id !== SOURCE_ID) {
    throw new Error("Invalid source_id.");
  }

  const payload = rawEnvelope.raw_payload?.payload || {};
  const agencies = Array.isArray(payload.results) ? payload.results : [];

  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    entity_id: `l01_usaspending_${replayHash(rawEnvelope).slice(0, 16)}`,
    entity_type: "federal_agency_reference_collection",
    source_trace: Object.freeze([rawEnvelope.source_trace]),
    score_components: Object.freeze([
      Object.freeze({
        score_name: "authority_score",
        score_value: 96,
        basis: "official_usaspending_public_api"
      }),
      Object.freeze({
        score_name: "freshness_score",
        score_value: 100,
        basis: "retrieved_during_current_run"
      })
    ]),
    evidence: Object.freeze([
      Object.freeze({
        evidence_type: "api_reference_response",
        source_url: rawEnvelope.canonical_url,
        retrieved_at: rawEnvelope.retrieved_at,
        record_count: agencies.length
      })
    ]),
    federal_context: Object.freeze({
      agency_count: agencies.length,
      agencies: agencies.slice(0, 25)
    }),
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    black_dragon_coupling: false
  });
}
