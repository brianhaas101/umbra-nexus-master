import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_courts",
  slug: "courts",
  entity_type: "state_judicial_source_page",
  identity_markers: ["california courts", "judicial branch", "courts.ca.gov"],
  signal_terms: ["court", "judicial", "case", "appeal", "california"],
  evidence_type: "state_courts_fetch",
  parser_status: "source_page_verified_state_courts_signals"
});
