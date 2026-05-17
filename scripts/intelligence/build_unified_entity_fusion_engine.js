const fs = require("fs");
const path = require("path");

const MANIFEST = "public/data/intelligence/runtime/layer_output_manifest.json";
const OUT = "public/data/intelligence/outputs/unified_entity_fusion_output.json";

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

const fused = {
  version: "nexus_unified_entity_fusion_output_v1",
  generated_at: new Date().toISOString(),
  status: "SHELL_ONLY_LIVE_LAYER_OUTPUTS_PENDING",
  layer_count: manifest.outputs.length,
  entities: [],
  evidence: [],
  signals: [],
  score_components: [],
  dossier_fields: [],
  fusion_summary: {
    entities_fused: 0,
    evidence_fused: 0,
    signals_fused: 0,
    score_components_fused: 0,
    dossier_fields_fused: 0
  }
};

for (const layer of manifest.outputs || []) {
  if (!fs.existsSync(layer.output_path)) continue;
  const d = JSON.parse(fs.readFileSync(layer.output_path, "utf8"));

  fused.entities.push(...(d.entities || []));
  fused.evidence.push(...(d.evidence || []));
  fused.signals.push(...(d.signals || []));
  fused.score_components.push(...(d.score_components || []));
  fused.dossier_fields.push(...(d.dossier_fields || []));
}

fused.fusion_summary.entities_fused = fused.entities.length;
fused.fusion_summary.evidence_fused = fused.evidence.length;
fused.fusion_summary.signals_fused = fused.signals.length;
fused.fusion_summary.score_components_fused = fused.score_components.length;
fused.fusion_summary.dossier_fields_fused = fused.dossier_fields.length;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(fused, null, 2));

console.log("[UNIFIED ENTITY FUSION] COMPLETE", JSON.stringify(fused.fusion_summary));
