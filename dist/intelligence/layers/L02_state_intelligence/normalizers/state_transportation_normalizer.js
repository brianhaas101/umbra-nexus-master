import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_transportation",
  slug: "transportation",
  entity_type: "state_transportation_source_page",
  identity_markers: ["caltrans", "department of transportation", "dot.ca.gov"],
  signal_terms: ["transportation", "traffic", "highway", "infrastructure", "california"],
  evidence_type: "state_transportation_fetch",
  parser_status: "source_page_verified_state_transportation_signals"
});
