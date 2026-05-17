const fs = require("fs");
const path = require("path");

const DEDUPE = "public/data/intelligence/outputs/entity_deduplication_output.json";
const FUSION = "public/data/intelligence/outputs/unified_entity_fusion_output.json";
const OUT = "public/data/intelligence/outputs/unified_entity_intelligence_index.json";

const dedupe = JSON.parse(fs.readFileSync(DEDUPE, "utf8"));
const fusion = JSON.parse(fs.readFileSync(FUSION, "utf8"));

const index = dedupe.entities.map(e => {
  const entity_id = e.entity_id;

  return {
    entity_id,
    display_name: e.display_name,
    canonical_name: e.canonical_name,
    city: e.city,
    state: e.state,
    country: e.country,

    evidence_count:
      (fusion.evidence || []).filter(x => x.entity_id === entity_id).length,

    signal_count:
      (fusion.signals || []).filter(x => x.entity_id === entity_id).length,

    score_component_count:
      (fusion.score_components || []).filter(x => x.entity_id === entity_id).length,

    dossier_field_count:
      (fusion.dossier_fields || []).filter(x => x.entity_id === entity_id).length,

    confidence_score: e.confidence_score,
    duplicate_count: e.duplicate_count
  };
});

const output = {
  version: "nexus_unified_entity_intelligence_index_v1",
  generated_at: new Date().toISOString(),
  total_entities: index.length,
  entities: index
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[ENTITY INDEX] COMPLETE", output.total_entities);
