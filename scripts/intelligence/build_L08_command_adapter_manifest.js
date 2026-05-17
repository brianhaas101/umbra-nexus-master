const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/L08_command_adapter_manifest.json";

const manifest = {
  version: "nexus_L08_command_adapter_manifest_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L08_COMMAND_STRUCTURE",
  adapters: [
    {
      adapter_id: "ORG_CHART_PDF_ADAPTER",
      input_type: "PDF",
      normalization_registry: "L08_command_normalization.registry.json"
    },
    {
      adapter_id: "COMMAND_STAFF_HTML_ADAPTER",
      input_type: "HTML",
      normalization_registry: "L08_command_normalization.registry.json"
    },
    {
      adapter_id: "STAFF_DIRECTORY_HTML_ADAPTER",
      input_type: "HTML",
      normalization_registry: "L08_command_normalization.registry.json"
    },
    {
      adapter_id: "MEETING_MINUTES_ADAPTER",
      input_type: "PDF_HTML",
      normalization_registry: "L08_command_normalization.registry.json"
    },
    {
      adapter_id: "ASSOCIATION_ROSTER_ADAPTER",
      input_type: "HTML_CSV",
      normalization_registry: "L08_command_normalization.registry.json"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[L08 ADAPTER MANIFEST] COMPLETE", manifest.adapters.length);
