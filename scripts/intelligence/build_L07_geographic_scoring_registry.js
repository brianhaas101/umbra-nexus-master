const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L07_geographic_scoring.registry.json";

const registry = {
  version: "nexus_L07_geographic_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L07_GEOGRAPHIC_TERRITORY",
  scoring_outputs: [
    {
      score: "territory_priority_score",
      description: "Importance of the territory or region"
    },
    {
      score: "regional_overlap_score",
      description: "Overlap with operational or commercial targets"
    },
    {
      score: "movement_corridor_score",
      description: "Strategic value of transportation or movement access"
    },
    {
      score: "response_complexity_score",
      description: "Operational difficulty of servicing or responding within the territory"
    },
    {
      score: "geospatial_confidence_score",
      description: "Confidence in mapped geographic intelligence"
    }
  ],
  weighting_rules: {
    infrastructure_overlap_weight: 0.25,
    corridor_weight: 0.20,
    density_weight: 0.20,
    cluster_weight: 0.20,
    geocode_accuracy_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L07 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
