import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "sam_gov";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://api.sam.gov/prod/opportunities/v2/search";

export function describeConnector() {
  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    active: CONNECTOR_ACTIVE,
    canonical_url: "https://sam.gov/content/opportunities",
    endpoint: ENDPOINT,
    access_method: "api_with_key",
    output_envelope: "raw_federal_source_record",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    black_dragon_coupling: false
  });
}

export async function fetchRawRecords() {
  const apiKey = process.env.SAM_GOV_API_KEY;

  if (!apiKey) {
    throw new Error("SAM_GOV_API_KEY missing. Connector cannot activate live.");
  }

  const url = new URL(ENDPOINT);
  url.searchParams.set("limit", "1");
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "UmbraNexus-L01-Federal-Intelligence/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`SAM.gov request failed: ${response.status}`);
  }

  const data = await response.json();

  const source = Object.freeze({
    source_id: SOURCE_ID,
    source_name: "SAM.gov Contract Opportunities",
    canonical_url: "https://sam.gov/content/opportunities",
    access_method: "api_with_key"
  });

  return [
    makeRawEnvelope(
      source,
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "sam_opportunities_search",
        payload: data
      }),
      "sam_gov_contract_opportunities"
    )
  ];
}
