export const SOURCE_ID = "state_courts";
const ENDPOINT = "https://www.courts.ca.gov/";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "text/html",
      "User-Agent": "UmbraNexus-L02-CA-Courts/1.0"
    }
  });

  if (!response.ok) throw new Error(`CA Courts failed: ${response.status}`);

  const html = await response.text();

  return [Object.freeze({
    layer_id: "L02",
    source_id: SOURCE_ID,
    state_code: "CA",
    state_name: "California",
    canonical_url: ENDPOINT,
    retrieved_at: new Date().toISOString(),
    source_trace: Object.freeze({
      source_id: SOURCE_ID,
      state_code: "CA",
      canonical_url: ENDPOINT,
      access_method: "public_html"
    }),
    raw_payload: Object.freeze({ html })
  })];
}
