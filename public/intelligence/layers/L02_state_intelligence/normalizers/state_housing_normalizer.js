import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_housing",
  slug: "housing",
  entity_type: "state_housing_source_page",
  identity_markers: ["housing and community development", "hcd", "california"],
  signal_terms: ["housing", "community", "development", "affordable", "homelessness"],
  evidence_type: "state_housing_fetch",
  parser_status: "source_page_verified_state_housing_signals"
});
