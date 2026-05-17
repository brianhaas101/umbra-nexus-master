import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_education",
  slug: "education",
  entity_type: "state_education_source_page",
  identity_markers: ["california department of education", "cde", "california"],
  signal_terms: ["education", "school", "students", "district", "learning"],
  evidence_type: "state_education_fetch",
  parser_status: "source_page_verified_state_education_signals"
});
