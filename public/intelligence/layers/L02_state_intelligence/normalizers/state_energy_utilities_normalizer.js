import { normalizeStateSource } from "./shared_state_source_normalizer.js";
export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_energy_utilities", slug: "energy_utilities",
  entity_type: "state_energy_utilities_source_page",
  identity_markers: ["california energy commission", "energy.ca.gov", "energy"],
  signal_terms: ["energy", "electricity", "renewable", "utilities", "power"],
  evidence_type: "state_energy_utilities_fetch",
  parser_status: "source_page_verified_state_energy_utilities_signals"
});
