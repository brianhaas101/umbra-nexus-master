import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "fusion_center_advisories";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.dhs.gov/fusion-center-locations-and-contact-information";

function sanitizeHtmlForEnvelope(html) {
  return String(html || "")
    .replaceAll("index.html", "index_page")
    .replaceAll("Index.html", "Index_page")
    .replaceAll("INDEX.HTML", "INDEX_PAGE");
}

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-FusionCenters/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Fusion center request failed: ${response.status}`);
  }

  const html = sanitizeHtmlForEnvelope(await response.text());

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "Fusion Center Advisories",
        canonical_url: ENDPOINT,
        access_method: "public_html_sanitized"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "fusion_center_locations_html_sanitized",
        html,
        sanitization: "index_html_token_replaced"
      }),
      "fusion_center_advisories_source_page"
    )
  ];
}
