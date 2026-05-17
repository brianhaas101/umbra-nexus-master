const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L10_communication_adapter_manifest.json";

const manifest = {
  version: "nexus_L10_communication_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L10_COMMUNICATION_INTELLIGENCE",
  adapters: [
    {
      adapter_id: "OFFICIAL_CONTACT_PAGE_ADAPTER",
      input_type: "HTML",
      normalization_registry: "L10_communication_normalization.registry.json"
    },
    {
      adapter_id: "STAFF_DIRECTORY_ADAPTER",
      input_type: "HTML_CSV_JSON",
      normalization_registry: "L10_communication_normalization.registry.json"
    },
    {
      adapter_id: "PHONE_DIRECTORY_ADAPTER",
      input_type: "HTML_PDF",
      normalization_registry: "L10_communication_normalization.registry.json"
    },
    {
      adapter_id: "MANUAL_VERIFIED_CONTACT_ADAPTER",
      input_type: "JSON",
      normalization_registry: "L10_communication_normalization.registry.json"
    },
    {
      adapter_id: "FALLBACK_ROUTING_ADAPTER",
      input_type: "HTML_JSON",
      normalization_registry: "L10_communication_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L10 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
