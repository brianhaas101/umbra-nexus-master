import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "cbp_newsroom";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "cbp",
  entity_type: "federal_border_security_source_page",
  identity_markers: [
    "customs and border protection",
    "cbp"
  ],
  signal_terms: [
    "border",
    "seizure",
    "security",
    "ports of entry",
    "smuggling",
    "news"
  ],
  authority_score: 92,
  authority_basis: "official_cbp_newsroom",
  signal_score: 86,
  signal_basis: "cbp_security_terms_present",
  evidence_type: "public_html_cbp_fetch",
  parser_status: "source_page_verified_cbp_signals"
});
