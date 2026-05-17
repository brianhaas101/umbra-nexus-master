import { normalizeStateSource } from "./shared_state_source_normalizer.js";
export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_business_regulation", slug: "business_regulation",
  entity_type: "state_business_regulation_source_page",
  identity_markers: ["department of consumer affairs", "dca", "california"],
  signal_terms: ["license", "consumer", "business", "regulation", "board"],
  evidence_type: "state_business_regulation_fetch",
  parser_status: "source_page_verified_state_business_regulation_signals"
});
