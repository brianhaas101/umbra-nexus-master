import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "nist_cyber_publications";

const ENDPOINT = "https://www.nist.gov/cyberframework";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-NIST-Cyber/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`nist_cyber_publications request failed: ${response.status}`);
  }

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "NIST Cybersecurity Framework",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "nist_cyber_publications_html",
        html
      }),
      "nist_cyber_publications_source_page"
    )
  ];
}
