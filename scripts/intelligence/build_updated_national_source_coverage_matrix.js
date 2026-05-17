const fs = require("fs");
const path = require("path");

const STATUS = "public/data/intelligence/runtime/production_layer_status.registry.json";
const OUT = "public/data/intelligence/sources/national_source_coverage_matrix.json";

const status = JSON.parse(fs.readFileSync(STATUS, "utf8"));
const production = new Set(status.production_layers);

const layers = [
  "L01_FEDERAL_INTELLIGENCE",
  "L02_STATE_INTELLIGENCE",
  "L03_LOCAL_AGENCY_INTELLIGENCE",
  "L04_TRAINING_INFRASTRUCTURE",
  "L05_BUDGET_AND_FUNDING",
  "L06_BEHAVIORAL_ACTIVITY",
  "L07_GEOGRAPHIC_TERRITORY",
  "L08_COMMAND_STRUCTURE",
  "L09_PROCUREMENT_INTELLIGENCE",
  "L10_COMMUNICATION_INTELLIGENCE",
  "L11_INCIDENT_AND_RISK",
  "L12_ENGAGEMENT_RESPONSE"
];

const matrix = {
  version: "nexus_national_source_coverage_matrix_v2",
  generated_at: new Date().toISOString(),
  coverage_scope: "US_NATIONAL",
  states_total: 50,
  layers: layers.map(layer_id => ({
    layer_id,
    national_coverage: production.has(layer_id) ? "PRODUCTION_STRUCTURED" : "PARTIAL",
    state_dependency: !["L01_FEDERAL_INTELLIGENCE", "L12_ENGAGEMENT_RESPONSE"].includes(layer_id)
  })),
  active_states: ["AZ", "CA", "TX"],
  priority_states_next: ["FL", "GA", "NC", "OH", "IL"]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(matrix, null, 2));
console.log("[COVERAGE MATRIX V2] COMPLETE", matrix.layers.length);
