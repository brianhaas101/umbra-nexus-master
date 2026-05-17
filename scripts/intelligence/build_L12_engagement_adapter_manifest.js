const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L12_engagement_adapter_manifest.json";

const manifest = {
  version: "nexus_L12_engagement_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L12_ENGAGEMENT_RESPONSE",
  adapters: [
    {
      adapter_id: "CALL_LOG_ADAPTER",
      input_type: "JSON_CSV_MANUAL",
      normalization_registry: "L12_engagement_normalization.registry.json"
    },
    {
      adapter_id: "EMAIL_LOG_ADAPTER",
      input_type: "JSON_CSV_MANUAL",
      normalization_registry: "L12_engagement_normalization.registry.json"
    },
    {
      adapter_id: "MEETING_NOTE_ADAPTER",
      input_type: "MARKDOWN_TXT_JSON",
      normalization_registry: "L12_engagement_normalization.registry.json"
    },
    {
      adapter_id: "CRM_PIPELINE_ADAPTER",
      input_type: "JSON_CSV_API",
      normalization_registry: "L12_engagement_normalization.registry.json"
    },
    {
      adapter_id: "OUTREACH_EXECUTION_LOG_ADAPTER",
      input_type: "JSON",
      normalization_registry: "L12_engagement_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L12 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
