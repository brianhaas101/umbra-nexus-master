import { normalizeFbiAgencyApi } from "./shared_fbi_api_normalizer.js";

export const normalizeRecord = rawEnvelope => normalizeFbiAgencyApi(rawEnvelope, {
  source_id: "fbi_ucr",
  slug: "fbi_ucr",
  entity_type: "federal_ucr_agency_collection",
  authority_basis: "official_fbi_ucr_authenticated_api",
  evidence_type: "official_fbi_ucr_agency_api_fetch",
  parser_status: "api_verified_fbi_ucr_agencies"
});
