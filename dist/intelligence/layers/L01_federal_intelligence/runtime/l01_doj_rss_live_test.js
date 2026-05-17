import { fetchRawRecords } from "../connectors/doj_announcements_connector.js";
import { normalizeRecord } from "../normalizers/doj_announcements_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "rss_verified_doj_items") {
  throw new Error("DOJ RSS verification failed.");
}

console.log("L01_DOJ_RSS_PASS");
