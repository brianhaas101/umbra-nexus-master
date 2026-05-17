import { fetchRawRecords } from "../connectors/fusion_center_advisories_connector.js";
import { normalizeRecord } from "../normalizers/fusion_center_advisories_normalizer.js";

const records = await fetchRawRecords();
const normalized = normalizeRecord(records[0]);

if (normalized.parser_status !== "source_page_verified_fusion_center_signals") {
  throw new Error("Fusion center parser verification failed.");
}

console.log("L01_FUSION_CENTER_ADVISORIES_SOURCE_PAGE_PASS");
