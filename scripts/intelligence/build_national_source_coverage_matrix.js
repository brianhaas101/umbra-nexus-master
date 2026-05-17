const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/national_source_coverage_matrix.json";

const matrix = {
  version: "nexus_national_source_coverage_matrix_v1",
  generated_at: new Date().toISOString(),
  coverage_scope: "US_NATIONAL",
  rule: "Coverage measures structural source readiness, not scraped record count.",
  states_total: 50,
  layers: [
    { layer_id: "L01_FEDERAL_INTELLIGENCE", national_coverage: "PARTIAL", state_dependency: false },
    { layer_id: "L02_STATE_INTELLIGENCE", national_coverage: "PARTIAL", state_dependency: true },
    { layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE", national_coverage: "PARTIAL", state_dependency: true },
    { layer_id: "L04_TRAINING_INFRASTRUCTURE", national_coverage: "PARTIAL", state_dependency: true },
    { layer_id: "L05_BUDGET_AND_FUNDING", national_coverage: "WEAK", state_dependency: true },
    { layer_id: "L06_BEHAVIORAL_ACTIVITY", national_coverage: "WEAK", state_dependency: true },
    { layer_id: "L07_GEOGRAPHIC_TERRITORY", national_coverage: "PARTIAL", state_dependency: true },
    { layer_id: "L08_COMMAND_STRUCTURE", national_coverage: "WEAK", state_dependency: true },
    { layer_id: "L09_PROCUREMENT_INTELLIGENCE", national_coverage: "WEAK", state_dependency: true },
    { layer_id: "L10_COMMUNICATION_INTELLIGENCE", national_coverage: "PARTIAL", state_dependency: true },
    { layer_id: "L11_INCIDENT_AND_RISK", national_coverage: "WEAK", state_dependency: true },
    { layer_id: "L12_ENGAGEMENT_RESPONSE", national_coverage: "PARTIAL", state_dependency: false }
  ],
  active_states: ["AZ", "CA", "TX"],
  priority_states_next: ["FL", "GA", "NC", "OH", "IL"]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(matrix, null, 2));

console.log("[NATIONAL COVERAGE MATRIX] COMPLETE", matrix.layers.length);
