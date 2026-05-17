import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "cbp_corridor_reports";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.cbp.gov/newsroom";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-CBP-Corridor/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`CBP corridor request failed: ${response.status}`);
  }

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "CBP Corridor Reports",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "cbp_newsroom_corridor_html",
        html
      }),
      "cbp_corridor_reports_source_page"
    )
  ];
}
