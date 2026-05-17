import { makeRawEnvelope } from "../runtime/l01_connector_sandbox.js";

export const SOURCE_ID = "doj_announcements";
export const LAYER_ID = "L01";
export const CONNECTOR_ACTIVE = true;

const ENDPOINT = "https://www.justice.gov/news/rss";

export async function fetchRawRecords() {
  const response = await fetch(ENDPOINT, {
    headers: {
      "Accept": "application/rss+xml,text/xml",
      "User-Agent": "UmbraNexus-L01-DOJ-RSS/1.0"
    }
  });

  if (!response.ok) throw new Error(`DOJ RSS failed: ${response.status}`);

  const xml = await response.text();

  return [
    makeRawEnvelope(
      Object.freeze({
        source_id: SOURCE_ID,
        source_name: "DOJ Announcements",
        canonical_url: ENDPOINT,
        access_method: "official_rss"
      }),
      Object.freeze({
        endpoint: ENDPOINT,
        response_type: "doj_news_rss",
        xml
      }),
      "doj_news_rss_feed"
    )
  ];
}
