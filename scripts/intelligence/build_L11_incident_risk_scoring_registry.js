const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/L11_incident_risk_scoring.registry.json";

const registry = {
  version: "nexus_L11_incident_risk_scoring_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L11_INCIDENT_AND_RISK",
  scoring_outputs: [
    {
      score: "incident_pressure_score",
      description: "Operational incident burden affecting the entity or region"
    },
    {
      score: "risk_escalation_probability",
      description: "Likelihood current conditions worsen or spread"
    },
    {
      score: "response_urgency_score",
      description: "Need for immediate operational response"
    },
    {
      score: "regional_instability_score",
      description: "Broader environmental or operational instability"
    },
    {
      score: "strategic_attention_score",
      description: "Likelihood the issue becomes leadership-level focus"
    }
  ],
  weighting_rules: {
    severity_weight: 0.30,
    recency_weight: 0.20,
    regional_impact_weight: 0.20,
    operational_disruption_weight: 0.20,
    escalation_weight: 0.10
  }
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L11 SCORING REGISTRY] COMPLETE", registry.scoring_outputs.length);
