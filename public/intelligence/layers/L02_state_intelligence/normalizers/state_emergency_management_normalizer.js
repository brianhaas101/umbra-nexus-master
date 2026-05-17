import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_emergency_management",
  slug: "emergency_management",
  entity_type: "state_emergency_management_source_page",
  identity_markers: ["cal oes", "emergency services", "state of california"],
  signal_terms: ["emergency", "preparedness", "disaster", "california"],
  evidence_type: "state_emergency_management_fetch",
  parser_status: "source_page_verified_state_emergency_management_signals"
});
