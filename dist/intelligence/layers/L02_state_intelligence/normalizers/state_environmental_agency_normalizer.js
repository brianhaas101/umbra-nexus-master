import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_environmental_agency",
  slug: "environmental",
  entity_type: "state_environmental_agency_source_page",
  identity_markers: ["calepa", "environmental protection", "state of california"],
  signal_terms: ["environment", "climate", "air", "water", "pollution", "california"],
  evidence_type: "state_environmental_agency_fetch",
  parser_status: "source_page_verified_state_environmental_signals"
});
