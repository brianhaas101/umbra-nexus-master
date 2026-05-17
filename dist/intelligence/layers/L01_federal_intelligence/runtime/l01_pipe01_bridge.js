import { injectProvenanceTrace } from "./l01_provenance_trace.js";
import { replayHash } from "./l01_replay_hash.js";

export function bridgeToPipe01(normalizedRecord) {
  const withTrace = injectProvenanceTrace(normalizedRecord);

  return Object.freeze({
    pipe_stage: "PIPE_01",
    source_layer: "L01",
    bridge_id: `bridge_l01_pipe01_${replayHash(withTrace).slice(0, 16)}`,
    record_id: withTrace.entity_id || null,
    source_id: withTrace.source_id,
    provenance_trace: withTrace.provenance_trace,
    evidence: Object.freeze(withTrace.evidence || []),
    source_trace: Object.freeze(withTrace.source_trace || []),
    normalized_record_hash: replayHash(withTrace),
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    client_paths_touched: false
  });
}
