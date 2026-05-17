const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

const sources = readJson("public/data/intelligence/sources/L01_FEDERAL_INTELLIGENCE.sources.json");
const policy = readJson("public/data/intelligence/live_connectors/live_connector_policy.v1.json");

const urlMap = {
  "USAspending": "https://api.usaspending.gov",
  "SAM.gov": "https://sam.gov",
  "Grants.gov": "https://www.grants.gov",
  "DOJ": "https://www.justice.gov",
  "DHS": "https://www.dhs.gov",
  "FBI": "https://www.fbi.gov",
  "DEA": "https://www.dea.gov",
  "FEMA": "https://www.fema.gov",
  "Federal Register": "https://www.federalregister.gov",
  "Bureau of Justice Statistics": "https://bjs.ojp.gov",
  "COPS": "https://cops.usdoj.gov",
  "Treasury": "https://home.treasury.gov",
  "Congress": "https://www.congress.gov"
};

function inferUrl(source) {
  const text = `${source.name || ""} ${source.source_name || ""} ${source.source_id || ""}`;
  for (const [key, url] of Object.entries(urlMap)) {
    if (text.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return "MANUAL_REVIEW_REQUIRED";
}

const connectors = sources.sources.map((source, index) => {
  const base_url = inferUrl(source);
  return {
    connector_id: `L01_LIVE_CONNECTOR_${String(index + 1).padStart(3, "0")}_${source.source_id}`,
    layer_id: "L01",
    source_id: source.source_id,
    source_name: source.name || source.source_name || source.source_id,
    acquisition_mode: base_url === "MANUAL_REVIEW_REQUIRED" ? "manual_review_queue" : "public_api",
    base_url,
    refresh_cadence: source.cadence || "daily",
    rate_limit_policy: {
      requests_per_minute: 30,
      burst_limit: 5,
      backoff_strategy: "exponential"
    },
    parser_id: `L01_PARSER_${String(index + 1).padStart(3, "0")}`,
    normalizer_id: "L01_FEDERAL_NORMALIZER_V1",
    lineage_policy: {
      retain_source_url: true,
      retain_capture_timestamp: true,
      retain_source_hash: true,
      retain_parser_version: true
    },
    cache_policy: policy.cache_policy_defaults,
    failure_policy: policy.failure_policy_defaults,
    confidence_floor: base_url === "MANUAL_REVIEW_REQUIRED" ? 0.60 : 0.90,
    status: base_url === "MANUAL_REVIEW_REQUIRED" ? "REQUIRES_REVIEW" : "READY"
  };
});

writeJson("public/data/intelligence/live_connectors/L01_federal_live_connector.registry.json", {
  version: "nexus_L01_federal_live_connector_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01",
  connector_count: connectors.length,
  policy_ref: "live_connector_policy.v1.json",
  connectors
});

console.log(JSON.stringify({
  status: "L01_LIVE_CONNECTOR_REGISTRY_BUILT",
  connectors: connectors.length,
  ready: connectors.filter(c => c.status === "READY").length,
  review: connectors.filter(c => c.status === "REQUIRES_REVIEW").length
}, null, 2));
