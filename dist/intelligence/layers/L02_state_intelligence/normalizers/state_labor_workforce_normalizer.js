import { normalizeStateSource } from "./shared_state_source_normalizer.js";

export const normalizeRecord = raw => normalizeStateSource(raw, {
  source_id: "state_labor_workforce",
  slug: "labor_workforce",
  entity_type: "state_labor_workforce_source_page",
  identity_markers: ["employment development department", "edd", "california"],
  signal_terms: ["employment", "unemployment", "workforce", "jobs", "benefits"],
  evidence_type: "state_labor_workforce_fetch",
  parser_status: "source_page_verified_state_labor_workforce_signals"
});
