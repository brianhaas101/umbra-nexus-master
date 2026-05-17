import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_police_public_safety",
  slug: "public_safety",
  entity_type: "state_public_safety_source_page",
  identity_markers: ["california highway patrol", "chp"],
  signal_terms: ["traffic", "safety", "patrol", "california"],
  evidence_type: "state_public_safety_fetch",
  parser_status: "source_page_verified_state_public_safety_signals"
});
