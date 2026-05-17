import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "usaspending_gov";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://api.usaspending.gov/api/v2/references/toptier_agencies/";

export function describeConnector() {
  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    active: CONNECTOR_ACTIVE,
    canonical_url: "https://api.usaspending.gov/",
    endpoint: ENDPOINT,
    access_method: "api",
    output_envelope: "raw_federal_source_record",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    black_dragon_coupling: false
  });
}

export async function fetchRawRecords() {
  if (!CONNECTOR_ACTIVE) {
    throw new Error("Connector inactive.");
  }

  const response = await fetch(ENDPOINT, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "User-Agent": "UmbraNexus-L01-Federal-Intelligence/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`USAspending request failed: ${response.status}`);
  }

  const data = await response.json();

  const source = Object.freeze({
    source_id: SOURCE_ID,
    source_name: "USAspending.gov",
    canonical_url: "https://api.usaspending.gov/",
    access_method: "api"
  });

  return [
    makeRawEnvelope(
      source,
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "toptier_agencies_reference",
        payload: data
      }),
      "usaspending_toptier_agencies_reference"
    )
  ];
}
