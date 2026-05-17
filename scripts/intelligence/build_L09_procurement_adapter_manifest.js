const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L09_procurement_adapter_manifest.json";

const manifest = {
  version: "nexus_L09_procurement_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L09_PROCUREMENT_INTELLIGENCE",
  adapters: [
    { adapter_id: "SAM_GOV_PROCUREMENT_ADAPTER", input_type: "API_JSON", normalization_registry: "L09_procurement_normalization.registry.json" },
    { adapter_id: "STATE_BID_PORTAL_ADAPTER", input_type: "HTML_JSON_CSV", normalization_registry: "L09_procurement_normalization.registry.json" },
    { adapter_id: "LOCAL_RFP_PORTAL_ADAPTER", input_type: "HTML_RSS_JSON", normalization_registry: "L09_procurement_normalization.registry.json" },
    { adapter_id: "CONTRACT_AWARD_ADAPTER", input_type: "HTML_PDF_CSV", normalization_registry: "L09_procurement_normalization.registry.json" },
    { adapter_id: "PURCHASE_ORDER_LOG_ADAPTER", input_type: "CSV_XLSX_JSON", normalization_registry: "L09_procurement_normalization.registry.json" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L09 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
