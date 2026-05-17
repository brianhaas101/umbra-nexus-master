const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L03_local_agency_scoring.registry.json";

const registry = {
  version: "nexus_L03_local_agency_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
  scoring_outputs: [
    {
      score: "local_operational_pressure_score",
      description: "Operational stress and activity at agency level"
    },
    {
      score: "training_need_score",
      description: "Likelihood agency requires training or capability support"
    },
    {
      score: "local_procurement_readiness",
      description: "Likelihood agency can purchase or route procurement"
    },
    {
      score: "community_visibility_score",
      description: "Public/community attention affecting agency"
    },
    {
      score: "agency_intelligence_confidence_score",
      description: "Confidence in local agency intelligence profile"
    }
  ],
  weighting_rules: {
    operational_activity_weight: 0.30,
    training_activity_weight: 0.20,
    procurement_activity_weight: 0.20,
    community_signal_weight: 0.15,
    recency_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L03 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
