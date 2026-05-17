const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L06_behavioral_adapter_manifest.json";

const manifest = {
  version: "nexus_L06_behavioral_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L06_BEHAVIORAL_ACTIVITY",
  adapters: [
    {
      adapter_id: "LOCAL_NEWS_FEED_ADAPTER",
      input_type: "RSS_HTML_JSON",
      normalization_registry: "L06_behavioral_normalization.registry.json"
    },
    {
      adapter_id: "AGENCY_PRESS_RELEASE_ADAPTER",
      input_type: "HTML_RSS",
      normalization_registry: "L06_behavioral_normalization.registry.json"
    },
    {
      adapter_id: "INCIDENT_DASHBOARD_ADAPTER",
      input_type: "JSON_CSV_HTML",
      normalization_registry: "L06_behavioral_normalization.registry.json"
    },
    {
      adapter_id: "SOCIAL_ACTIVITY_ADAPTER",
      input_type: "API_JSON",
      normalization_registry: "L06_behavioral_normalization.registry.json"
    },
    {
      adapter_id: "REGIONAL_ALERT_ADAPTER",
      input_type: "RSS_JSON_EMAIL",
      normalization_registry: "L06_behavioral_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L06 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
