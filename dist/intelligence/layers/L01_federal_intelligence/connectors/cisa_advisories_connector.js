import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "cisa_advisories";

const ENDPOINT = "https://www.cisa.gov/news-events/cybersecurity-advisories";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-CISA-Advisories/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`cisa_advisories request failed: ${response.status}`);
  }

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "CISA Cybersecurity Advisories",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "cisa_advisories_html",
        html
      }),
      "cisa_advisories_source_page"
    )
  ];
}
