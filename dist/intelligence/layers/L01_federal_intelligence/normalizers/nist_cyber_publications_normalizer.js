import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "nist_cyber_publications";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "nist_cyber",
  entity_type: "federal_cybersecurity_framework_source_page",
  identity_markers: [
    "nist",
    "cybersecurity framework"
  ],
  signal_terms: [
    "cybersecurity",
    "framework",
    "risk",
    "security",
    "infrastructure",
    "standards"
  ],
  authority_score: 96,
  authority_basis: "official_nist_cybersecurity_framework",
  signal_score: 91,
  signal_basis: "nist_cybersecurity_terms_present",
  evidence_type: "public_html_nist_fetch",
  parser_status: "source_page_verified_nist_cyber_signals"
});
