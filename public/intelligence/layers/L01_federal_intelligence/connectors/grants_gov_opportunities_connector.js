import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "grants_gov_opportunities";

const ENDPOINT = "https://www.grants.gov/search-grants";

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
      "User-Agent": "UmbraNexus-L01-GrantsGov/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`grants_gov_opportunities request failed: ${response.status}`);
  }

  const html = sanitizeHtmlForEnvelope(await response.text());

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "Grants.gov Opportunities",
        canonical_url: ENDPOINT,
        access_method: "public_html_sanitized"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "grants_gov_opportunities_html_sanitized",
        html,
        sanitization: "index_html_token_replaced"
      }),
      "grants_gov_opportunities_source_page"
    )
  ];
}
