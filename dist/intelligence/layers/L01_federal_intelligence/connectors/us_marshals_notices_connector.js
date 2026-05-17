import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "us_marshals_notices";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.usmarshals.gov/news";

export function describeConnector() {
  return Object.freeze({
    layer_id: LAYER_ID,
    source_id: SOURCE_ID,
    active: CONNECTOR_ACTIVE,
    canonical_url: ENDPOINT,
    endpoint: ENDPOINT,
    access_method: "public_html",
    synthetic_fillers_allowed: false,
    inferred_contacts_allowed: false,
    client_path_coupling: false
  });
}

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-USMS/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`US Marshals request failed: ${response.status}`);
  }

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "US Marshals News",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "us_marshals_news_html",
        html
      }),
      "us_marshals_source_page"
    )
  ];
}
