const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/scoring/freshness_weighting.registry.json";

const registry = {
  version: "nexus_freshness_weighting_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Freshness decay must be layer-specific. Fast-moving signals decay faster than structural records.",
  freshness_rules: [
    { layer_id: "L01_FEDERAL_INTELLIGENCE", fresh_hours: 24, stale_hours: 168 },
    { layer_id: "L02_STATE_INTELLIGENCE", fresh_hours: 72, stale_hours: 720 },
    { layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE", fresh_hours: 72, stale_hours: 720 },
    { layer_id: "L04_TRAINING_INFRASTRUCTURE", fresh_hours: 168, stale_hours: 2160 },
    { layer_id: "L05_BUDGET_AND_FUNDING", fresh_hours: 168, stale_hours: 4320 },
    { layer_id: "L06_BEHAVIORAL_ACTIVITY", fresh_hours: 12, stale_hours: 72 },
    { layer_id: "L07_GEOGRAPHIC_TERRITORY", fresh_hours: 720, stale_hours: 8760 },
    { layer_id: "L08_COMMAND_STRUCTURE", fresh_hours: 168, stale_hours: 2160 },
    { layer_id: "L09_PROCUREMENT_INTELLIGENCE", fresh_hours: 48, stale_hours: 720 },
    { layer_id: "L10_COMMUNICATION_INTELLIGENCE", fresh_hours: 168, stale_hours: 2160 },
    { layer_id: "L11_INCIDENT_AND_RISK", fresh_hours: 24, stale_hours: 168 },
    { layer_id: "L12_ENGAGEMENT_RESPONSE", fresh_hours: 1, stale_hours: 72 }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[FRESHNESS WEIGHTING] COMPLETE", registry.freshness_rules.length);
