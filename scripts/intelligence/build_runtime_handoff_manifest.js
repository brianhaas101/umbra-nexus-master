const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/runtime_handoff_manifest.json";

const manifest = {
  version: "nexus_runtime_handoff_manifest_v1",
  generated_at: new Date().toISOString(),
  rule: "Runtime may consume only validated normalized outputs, not raw source files.",
  handoff_outputs: [
    {
      name: "unified_normalized_output",
      path: "public/data/intelligence/outputs/unified_normalized_output_shell.json",
      status: "SHELL_ONLY"
    },
    {
      name: "layer_output_manifest",
      path: "public/data/intelligence/runtime/layer_output_manifest.json",
      status: "ACTIVE"
    },
    {
      name: "cross_layer_dependency_graph",
      path: "public/data/intelligence/runtime/cross_layer_dependency_graph.json",
      status: "ACTIVE"
    },
    {
      name: "live_ingestion_execution_queue",
      path: "public/data/intelligence/runtime/live_ingestion_execution_queue.json",
      status: "ACTIVE"
    }
  ],
  runtime_consumers: [
    "dossier_engine",
    "scoring_engine",
    "globe_engine",
    "client_sync_engine",
    "audit_engine"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));

console.log("[RUNTIME HANDOFF MANIFEST] COMPLETE", manifest.handoff_outputs.length);
