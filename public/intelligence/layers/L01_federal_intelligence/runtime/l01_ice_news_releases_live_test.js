import { fetchRawRecords } from "../connectors/ice_news_releases_connector.js";
import { normalizeRecord } from "../normalizers/ice_news_releases_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_ice_signals") {
  throw new Error("ICE parser verification failed.");
}

console.log("L01_ICE_NEWS_RELEASES_SOURCE_PAGE_PASS");
