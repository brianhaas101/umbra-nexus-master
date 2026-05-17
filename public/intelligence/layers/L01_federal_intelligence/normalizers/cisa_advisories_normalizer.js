import { buildNormalizer } from "./shared_source_page_normalizer.js";

export const SOURCE_ID = "cisa_advisories";

export const normalizeRecord = buildNormalizer({
  source_id: SOURCE_ID,
  entity_slug: "cisa",
  entity_type: "federal_cybersecurity_advisory_source_page",
  identity_markers: [
    "cybersecurity advisories",
    "cisa"
  ],
  signal_terms: [
    "advisory",
    "vulnerability",
    "cybersecurity",
    "ics",
    "malware",
    "alert"
  ],
  authority_score: 94,
  authority_basis: "official_cisa_advisory_page",
  signal_score: 90,
  signal_basis: "cisa_cybersecurity_terms_present",
  evidence_type: "public_html_cisa_advisory_fetch",
  parser_status: "source_page_verified_cisa_signals"
});
