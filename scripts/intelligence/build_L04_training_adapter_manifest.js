const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L04_training_adapter_manifest.json";

const manifest = {
  version: "nexus_L04_training_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L04_TRAINING_INFRASTRUCTURE",
  adapters: [
    { adapter_id: "POST_TRAINING_CATALOG_ADAPTER", input_type: "HTML_JSON_CSV", normalization_registry: "L04_training_normalization.registry.json" },
    { adapter_id: "ACADEMY_DIRECTORY_ADAPTER", input_type: "HTML_CSV", normalization_registry: "L04_training_normalization.registry.json" },
    { adapter_id: "TRAINING_CALENDAR_ADAPTER", input_type: "HTML_ICS_RSS", normalization_registry: "L04_training_normalization.registry.json" },
    { adapter_id: "CONFERENCE_TRAINING_ADAPTER", input_type: "HTML_RSS", normalization_registry: "L04_training_normalization.registry.json" },
    { adapter_id: "AGENCY_TRAINING_PAGE_ADAPTER", input_type: "HTML_PDF", normalization_registry: "L04_training_normalization.registry.json" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L04 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
