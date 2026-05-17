import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_open_data_portals",
  slug: "open_data",
  entity_type: "state_open_data_portal",
  identity_markers: ["ckan", "data.ca.gov", "california open data"],
  signal_terms: ["dataset", "data", "california", "open data"],
  evidence_type: "state_open_data_portal_fetch",
  parser_status: "source_page_verified_state_open_data_signals"
});
