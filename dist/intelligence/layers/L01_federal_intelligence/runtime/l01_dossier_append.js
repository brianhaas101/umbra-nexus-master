import { replayHash } from "./l01_replay_hash.js";

export function appendFederalDossier(existingDossier, normalizedRecord) {
  const dossier = existingDossier && typeof existingDossier === "object" ? existingDossier : {};

  const entry = Object.freeze({
    entry_id: `fed_${replayHash(normalizedRecord).slice(0, 16)}`,
    layer_id: normalizedRecord.layer_id,
    source_id: normalizedRecord.source_id,
    entity_id: normalizedRecord.entity_id,
    entity_type: normalizedRecord.entity_type,
    evidence: Object.freeze(normalizedRecord.evidence || []),
    federal_context: Object.freeze(normalizedRecord.federal_context || {}),
    score_components: Object.freeze(normalizedRecord.score_components || []),
    appended_at: new Date().toISOString(),
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false
  });

  return Object.freeze({
    ...dossier,
    federal_sources: Object.freeze([...(dossier.federal_sources || []), entry])
  });
}
