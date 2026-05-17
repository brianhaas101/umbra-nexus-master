const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L01_federal_scoring.registry.json";

const registry = {
  version: "nexus_L01_federal_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01_FEDERAL_INTELLIGENCE",
  scoring_outputs: [
    { score: "federal_pressure_score", description: "Federal operational attention or enforcement pressure" },
    { score: "federal_alignment_score", description: "Alignment between entity need and federal program/source activity" },
    { score: "grant_dependency_score", description: "Likelihood entity benefits from federal funding" },
    { score: "interstate_activity_score", description: "Cross-jurisdiction or national relevance" },
    { score: "federal_risk_relevance_score", description: "Federal-level risk or oversight relevance" }
  ],
  weighting_rules: {
    federal_authority_weight: 0.35,
    direct_entity_link_weight: 0.20,
    funding_relevance_weight: 0.15,
    recency_weight: 0.15,
    jurisdiction_overlap_weight: 0.15
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L01 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
