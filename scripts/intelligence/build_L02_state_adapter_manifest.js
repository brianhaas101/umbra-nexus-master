const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L02_state_adapter_manifest.json";

const manifest = {
  version: "nexus_L02_state_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L02_STATE_INTELLIGENCE",
  adapters: [
    {
      adapter_id: "STATE_POST_ADAPTER",
      input_type: "HTML_JSON_CSV",
      normalization_registry: "L02_state_normalization.registry.json"
    },
    {
      adapter_id: "STATE_PROCUREMENT_ADAPTER",
      input_type: "HTML_JSON_API",
      normalization_registry: "L02_state_normalization.registry.json"
    },
    {
      adapter_id: "STATE_BUDGET_ADAPTER",
      input_type: "PDF_XLSX_HTML",
      normalization_registry: "L02_state_normalization.registry.json"
    },
    {
      adapter_id: "STATE_OPEN_DATA_ADAPTER",
      input_type: "API_JSON_CSV",
      normalization_registry: "L02_state_normalization.registry.json"
    },
    {
      adapter_id: "STATE_PRESS_RELEASE_ADAPTER",
      input_type: "RSS_HTML",
      normalization_registry: "L02_state_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L02 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
