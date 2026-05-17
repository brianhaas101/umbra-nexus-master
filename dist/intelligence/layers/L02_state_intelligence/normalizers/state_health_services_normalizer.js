import { normalizeStateSource } from "./shared_state_source_normalizer.js";
export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_health_services", slug: "health_services",
  entity_type: "state_health_services_source_page",
  identity_markers: ["health and human services", "chhs", "california"],
  signal_terms: ["health", "human services", "public health", "services", "california"],
  evidence_type: "state_health_services_fetch",
  parser_status: "source_page_verified_state_health_services_signals"
});
