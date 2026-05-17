import { replayHash } from "../runtime/l01_replay_hash.js";

export function normalizeFbiAgencyApi(rawEnvelope, config) {
  if (rawEnvelope.layer_id !== "L01") throw new Error("Invalid layer_id.");
  if (rawEnvelope.source_id !== config.source_id) throw new Error("Invalid source_id.");

  const payload = rawEnvelope.raw_payload?.payload || {};
  const agencies = Array.isArray(payload.results)
    ? payload.results
    : Array.isArray(payload)
      ? payload
      : Array.isArray(payload.agencies)
        ? payload.agencies
        : [];

  if (agencies.length === 0) {
    throw new Error(`${config.source_id} returned zero agency records.`);
  }

  return Object.freeze({
    layer_id: "L01",
    source_id: config.source_id,
    entity_id: `l01_${config.slug}_${replayHash(rawEnvelope).slice(0, 16)}`,
    entity_type: config.entity_type,
    source_trace: Object.freeze([rawEnvelope.source_trace]),
    score_components: Object.freeze([
      Object.freeze({
        score_name: "authority_score",
        score_value: 100,
        basis: config.authority_basis
      }),
      Object.freeze({
        score_name: "federal_relevance_score",
        score_value: 92,
        basis: "official_fbi_cde_agency_reference"
      })
    ]),
    evidence: Object.freeze([
      Object.freeze({
        evidence_type: config.evidence_type,
        source_url: rawEnvelope.canonical_url,
        retrieved_at: rawEnvelope.retrieved_at,
        record_count: agencies.length
      })
    ]),
    federal_context: Object.freeze({
      agency_count: agencies.length,
      agencies: Object.freeze(agencies.slice(0, 25))
    }),
    parser_status: config.parser_status,
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    client_path_coupling: false
  });
}
