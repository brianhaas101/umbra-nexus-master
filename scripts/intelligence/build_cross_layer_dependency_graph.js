const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/cross_layer_dependency_graph.json";

const graph = {
  version: "nexus_cross_layer_dependency_graph_v1",
  generated_at: new Date().toISOString(),
  dependencies: [
    { from: "L01_FEDERAL_INTELLIGENCE", to: ["L05_BUDGET_AND_FUNDING", "L11_INCIDENT_AND_RISK"] },
    { from: "L02_STATE_INTELLIGENCE", to: ["L04_TRAINING_INFRASTRUCTURE", "L09_PROCUREMENT_INTELLIGENCE"] },
    { from: "L03_LOCAL_AGENCY_INTELLIGENCE", to: ["L08_COMMAND_STRUCTURE", "L10_COMMUNICATION_INTELLIGENCE"] },
    { from: "L04_TRAINING_INFRASTRUCTURE", to: ["L12_ENGAGEMENT_RESPONSE"] },
    { from: "L05_BUDGET_AND_FUNDING", to: ["L09_PROCUREMENT_INTELLIGENCE"] },
    { from: "L06_BEHAVIORAL_ACTIVITY", to: ["L11_INCIDENT_AND_RISK"] },
    { from: "L07_GEOGRAPHIC_TERRITORY", to: ["L06_BEHAVIORAL_ACTIVITY", "L11_INCIDENT_AND_RISK"] },
    { from: "L08_COMMAND_STRUCTURE", to: ["L10_COMMUNICATION_INTELLIGENCE", "L12_ENGAGEMENT_RESPONSE"] },
    { from: "L09_PROCUREMENT_INTELLIGENCE", to: ["L12_ENGAGEMENT_RESPONSE"] },
    { from: "L10_COMMUNICATION_INTELLIGENCE", to: ["L12_ENGAGEMENT_RESPONSE"] }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(graph, null, 2));
console.log("[DEPENDENCY GRAPH] COMPLETE", graph.dependencies.length);
