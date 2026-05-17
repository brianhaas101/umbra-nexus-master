const fs = require("fs");
const path = require("path");

const FUSION = "public/data/intelligence/outputs/unified_entity_fusion_output.json";
const INDEX = "public/data/intelligence/outputs/unified_entity_intelligence_index.json";
const SCORES = "public/data/intelligence/outputs/unified_score_aggregation.json";
const OUT = "public/data/intelligence/outputs/unified_dossier_synthesis.json";

const fusion = JSON.parse(fs.readFileSync(FUSION, "utf8"));
const index = JSON.parse(fs.readFileSync(INDEX, "utf8"));
const scores = JSON.parse(fs.readFileSync(SCORES, "utf8"));

const scoreMap = new Map(
  scores.scores.map(s => [s.entity_id, s])
);

const dossiers = index.entities.map(e => {

  const fields =
    (fusion.dossier_fields || []).filter(f => f.entity_id === e.entity_id);

  return {
    entity_id: e.entity_id,
    display_name: e.display_name,
    state: e.state,
    final_score: scoreMap.get(e.entity_id)?.final_score || 0,
    field_count: fields.length,
    fields,
    generated_at: new Date().toISOString()
  };
});

const output = {
  version: "nexus_unified_dossier_synthesis_v1",
  generated_at: new Date().toISOString(),
  total_dossiers: dossiers.length,
  dossiers
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[DOSSIER SYNTHESIS] COMPLETE", output.total_dossiers);
