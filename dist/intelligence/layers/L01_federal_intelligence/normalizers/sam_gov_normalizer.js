import { replayHash } from "../runtime/l01_replay_hash.js";

export const SOURCE_ID = "sam_gov";
export const LAYER_ID = "L01";
export const NORMALIZER_ACTIVE = true;

export function normalizeRecord(rawEnvelope) {
  if (rawEnvelope.layer_id !== "L01") throw new Error("Invalid layer_id.");
  if (rawEnvelope.source_id !== SOURCE_ID) throw new Error("Invalid source_id.");

  const payload = rawEnvelope.raw_payload?.payload || {};
  const opportunities = Array.isArray(payload.opportunitiesData)
    ? payload.opportunitiesData
    : [];

  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    entity_id: `l01_sam_${replayHash(rawEnvelope).slice(0, 16)}`,
    entity_type: "federal_procurement_opportunity_collection",
    source_trace: Object.freeze([rawEnvelope.source_trace]),
    score_components: Object.freeze([
      Object.freeze({
        score_name: "authority_score",
        score_value: 96,
        basis: "official_sam_gov_api"
      }),
      Object.freeze({
        score_name: "procurement_signal_score",
        score_value: opportunities.length > 0 ? 100 : 60,
        basis: "contract_opportunity_feed"
      })
    ]),
    evidence: Object.freeze([
      Object.freeze({
        evidence_type: "api_opportunities_response",
        source_url: rawEnvelope.canonical_url,
        retrieved_at: rawEnvelope.retrieved_at,
        record_count: opportunities.length
      })
    ]),
    federal_context: Object.freeze({
      opportunity_count: opportunities.length,
      opportunities: opportunities.slice(0, 10)
    }),
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    black_dragon_coupling: false
  });
}
