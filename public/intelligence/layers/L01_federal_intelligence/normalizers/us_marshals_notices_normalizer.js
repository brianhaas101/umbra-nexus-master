import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "us_marshals_notices";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "usms",
  entity_type: "federal_fugitive_enforcement_source_page",
  identity_markers: [
    "u.s. marshals",
    "us marshals",
    "usms"
  ],
  signal_terms: [
    "fugitive",
    "task force",
    "warrant",
    "enforcement",
    "marshal",
    "news"
  ],
  authority_score: 91,
  authority_basis: "official_usms_newsroom",
  signal_score: 86,
  signal_basis: "usms_enforcement_terms_present",
  evidence_type: "public_html_usms_fetch",
  parser_status: "source_page_verified_usms_signals"
});
