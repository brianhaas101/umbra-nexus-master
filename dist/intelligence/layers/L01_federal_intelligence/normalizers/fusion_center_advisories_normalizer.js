import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "fusion_center_advisories";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "fusion_centers",
  entity_type: "federal_state_fusion_center_source_page",
  identity_markers: [
    "fusion center",
    "fusion centers",
    "homeland security"
  ],
  signal_terms: [
    "fusion center",
    "intelligence",
    "information sharing",
    "homeland security",
    "state",
    "local",
    "tribal",
    "territorial"
  ],
  authority_score: 84,
  authority_basis: "official_dhs_fusion_center_page",
  signal_score: 82,
  signal_basis: "fusion_center_information_sharing_terms_present",
  evidence_type: "public_html_fusion_center_fetch",
  parser_status: "source_page_verified_fusion_center_signals"
});
