const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/L02_STATE_INTELLIGENCE.sources.json";

const catalog = {
  version: "nexus_L02_state_intelligence_sources_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L02_STATE_INTELLIGENCE",
  target_sources: 15,
  production_ready: true,
  source_classes: [
    { source_id: "STATE_POST_DATABASES", authority: "STATE", type: "training_certification", coverage: "STATE" },
    { source_id: "STATE_CRIME_REPORTS", authority: "STATE", type: "crime_statistics", coverage: "STATE" },
    { source_id: "STATE_PROCUREMENT_PORTALS", authority: "STATE", type: "procurement_activity", coverage: "STATE" },
    { source_id: "STATE_BUDGET_BOOKS", authority: "STATE", type: "budget_intelligence", coverage: "STATE" },
    { source_id: "STATE_GRANT_PROGRAMS", authority: "STATE", type: "funding_activity", coverage: "STATE" },
    { source_id: "STATE_LEGISLATIVE_TRACKERS", authority: "STATE", type: "regulatory_change", coverage: "STATE" },
    { source_id: "STATE_COURT_SYSTEMS", authority: "STATE", type: "legal_activity", coverage: "STATE" },
    { source_id: "STATE_AGENCY_DIRECTORIES", authority: "STATE", type: "agency_structure", coverage: "STATE" },
    { source_id: "STATE_EMERGENCY_MANAGEMENT", authority: "STATE", type: "risk_and_response", coverage: "STATE" },
    { source_id: "STATE_OPEN_DATA_PORTALS", authority: "STATE", type: "structured_data", coverage: "STATE" },
    { source_id: "STATE_TRAINING_ACADEMIES", authority: "STATE", type: "academy_activity", coverage: "STATE" },
    { source_id: "STATE_ASSOCIATION_ROSTERS", authority: "STATE", type: "professional_networks", coverage: "STATE" },
    { source_id: "STATE_TRANSPARENCY_PORTALS", authority: "STATE", type: "financial_visibility", coverage: "STATE" },
    { source_id: "STATE_PRESS_RELEASES", authority: "STATE", type: "operational_activity", coverage: "STATE" },
    { source_id: "STATE_PUBLIC_RECORDS_SYSTEMS", authority: "STATE", type: "records_access", coverage: "STATE" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

console.log("[L02 SOURCE CATALOG] COMPLETE", catalog.source_classes.length);
