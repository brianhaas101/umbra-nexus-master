import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "atf_public_advisories";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.atf.gov/news";

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
    throw new Error(`ATF News request failed: ${response.status}`);
  }

  const html = await response.text();

  const source = Object.freeze({
    source_id: SOURCE_ID,
    source_name: "ATF Public Advisories",
    canonical_url: ENDPOINT,
    access_method: "public_html"
  });

  return [
    makeRawEnvelope(
      source,
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "atf_news_html",
        html
      }),
      "atf_public_advisories_source_page"
    )
  ];
}
