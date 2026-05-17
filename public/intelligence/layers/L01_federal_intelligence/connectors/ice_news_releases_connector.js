import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "ice_news_releases";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.ice.gov/news/releases";

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
      "User-Agent": "UmbraNexus-L01-ICE/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`ICE request failed: ${response.status}`);
  }

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "ICE News Releases",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "ice_news_html",
        html
      }),
      "ice_news_source_page"
    )
  ];
}
