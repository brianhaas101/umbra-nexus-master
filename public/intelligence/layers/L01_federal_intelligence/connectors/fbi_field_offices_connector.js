import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "fbi_field_offices";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.fbi.gov/contact-us/field-offices";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-FBI-Field-Offices/1.0"
    }
  });

  if (!response.ok) throw new Error(`FBI field offices failed: ${response.status}`);

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "FBI Field Offices",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "fbi_field_offices_html",
        html
      }),
      "fbi_field_offices_directory"
    )
  ];
}
