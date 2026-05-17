import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "data_gov_crime_catalog";

const ENDPOINT = "https://catalog.data.gov/dataset/?q=crime";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L01-DataGov-Crime/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`data_gov_crime_catalog request failed: ${response.status}`);
  }

  const html = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "Data.gov Crime Catalog",
        canonical_url: ENDPOINT,
        access_method: "public_html"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "data_gov_crime_catalog_html",
        html
      }),
      "data_gov_crime_catalog_source_page"
    )
  ];
}
