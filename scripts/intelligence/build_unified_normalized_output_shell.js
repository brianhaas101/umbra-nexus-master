const fs = require("fs");
const path = require("path");

const OUT_DIR = "public/data/intelligence/outputs";
const MANIFEST = "public/data/intelligence/runtime/layer_output_manifest.json";
const OUT = "public/data/intelligence/outputs/unified_normalized_output_shell.json";

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const layer of manifest.outputs || []) {
  const shell = {
    version: "nexus_layer_normalized_output_shell_v1",
    generated_at: new Date().toISOString(),
    layer_id: layer.layer_id,
    status: "SHELL_ONLY_CONNECTOR_OUTPUT_PENDING",
    entities: [],
    evidence: [],
    signals: [],
    score_components: [],
    dossier_fields: []
  };

  fs.writeFileSync(layer.output_path, JSON.stringify(shell, null, 2));
}

const unified = {
  version: "nexus_unified_normalized_output_shell_v1",
  generated_at: new Date().toISOString(),
  status: "SHELL_ONLY_LIVE_CONNECTORS_PENDING",
  layer_count: manifest.outputs.length,
  entities: [],
  evidence: [],
  signals: [],
  score_components: [],
  dossier_fields: []
};

fs.writeFileSync(OUT, JSON.stringify(unified, null, 2));

console.log("[UNIFIED NORMALIZED SHELL] COMPLETE", unified.layer_count);
