const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L05_budget_adapter_manifest.json";

const manifest = {
  version: "nexus_L05_budget_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L05_BUDGET_AND_FUNDING",
  adapters: [
    {
      adapter_id: "USA_SPENDING_ADAPTER",
      input_type: "API_JSON",
      normalization_registry: "L05_budget_normalization.registry.json"
    },
    {
      adapter_id: "SAM_GOV_ADAPTER",
      input_type: "API_JSON",
      normalization_registry: "L05_budget_normalization.registry.json"
    },
    {
      adapter_id: "CITY_BUDGET_HTML_ADAPTER",
      input_type: "HTML",
      normalization_registry: "L05_budget_normalization.registry.json"
    },
    {
      adapter_id: "COUNTY_BUDGET_PDF_ADAPTER",
      input_type: "PDF",
      normalization_registry: "L05_budget_normalization.registry.json"
    },
    {
      adapter_id: "PROCUREMENT_FEED_ADAPTER",
      input_type: "RSS_JSON_HTML",
      normalization_registry: "L05_budget_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L05 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
