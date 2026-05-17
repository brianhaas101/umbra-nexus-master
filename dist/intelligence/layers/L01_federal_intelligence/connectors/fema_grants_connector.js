import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "fema_grants";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.fema.gov/grants";

export function describeConnector() {
  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    active: CONNECTOR_ACTIVE,
    canonical_url: ENDPOINT,
    endpoint: ENDPOINT,
    access_method: "public_html",
    output_envelope: "raw_federal_source_record",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    black_dragon_coupling: false
  });
}

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    method: "GET",
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-Federal-Intelligence/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`FEMA grants request failed: ${response.status}`);
  }

  const html = await response.text();

  const source = Object.freeze({
    source_id: SOURCE_ID,
    source_name: "FEMA Grants",
    canonical_url: ENDPOINT,
    access_method: "public_html"
  });

  return [
    makeRawEnvelope(
      source,
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "fema_grants_html",
        html
      }),
      "fema_grants_source_page"
    )
  ];
}
