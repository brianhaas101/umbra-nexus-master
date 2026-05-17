const fs = require("fs");

const MANIFEST = "public/data/intelligence/runtime/layer_output_manifest.json";
const OUT = "public/data/intelligence/outputs/unified_entity_fusion_output.json";

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

const fused = {
  version: "nexus_unified_entity_fusion_output_v2",
  generated_at: new Date().toISOString(),
  status: "LIVE_LOCAL_CONNECTORS_ACTIVE_PARTIAL",
  layer_count: manifest.outputs.length,
  entities: [],
  evidence: [],
  signals: [],
  score_components: [],
  dossier_fields: []
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

fused.fusion_summary = {
  entities_fused: fused.entities.length,
  evidence_fused: fused.evidence.length,
  signals_fused: fused.signals.length,
  score_components_fused: fused.score_components.length,
  dossier_fields_fused: fused.dossier_fields.length
};

fs.writeFileSync(OUT, JSON.stringify(fused, null, 2));

console.log("[LIVE UNIFIED FUSION REBUILD] COMPLETE", JSON.stringify(fused.fusion_summary));
