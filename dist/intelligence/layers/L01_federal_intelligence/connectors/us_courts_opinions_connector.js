import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "us_courts_opinions";

const ENDPOINT = "https://www.uscourts.gov";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-USCourts/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`us_courts_opinions request failed: ${response.status}`);
  }

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "United States Courts",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "us_courts_opinions_html",
        html
      }),
      "us_courts_opinions_source_page"
    )
  ];
}
