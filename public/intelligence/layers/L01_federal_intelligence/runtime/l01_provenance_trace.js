import { replayHash } from "./l01_replay_hash.js";

export function injectProvenanceTrace(normalizedRecord) {
  if (!normalizedRecord || typeof normalizedRecord !== "object") {
    throw new Error("Invalid normalized record.");
  }

  if (!normalizedRecord.source_id || !normalizedRecord.layer_id) {
    throw new Error("Missing source_id or layer_id.");
  }

  const trace = Object.freeze({
    provenance_id: `prov_${replayHash(normalizedRecord).slice(0, 16)}`,
    layer_id: normalizedRecord.layer_id,
    source_id: normalizedRecord.source_id,
    entity_id: normalizedRecord.entity_id || null,
    evidence_count: Array.isArray(normalizedRecord.evidence) ? normalizedRecord.evidence.length : 0,
    source_trace_count: Array.isArray(normalizedRecord.source_trace) ? normalizedRecord.source_trace.length : 0,
    generated_at: new Date().toISOString(),
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false
  });

  return Object.freeze({
    ...normalizedRecord,
    provenance_trace: trace
  });
}
