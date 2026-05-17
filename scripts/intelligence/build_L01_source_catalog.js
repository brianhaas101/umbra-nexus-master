const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/L01_FEDERAL_INTELLIGENCE.sources.json";

const catalog = {
  version: "nexus_L01_federal_intelligence_sources_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01_FEDERAL_INTELLIGENCE",
  target_sources: 15,
  production_ready: true,
  source_classes: [
    { source_id: "FBI_CRIME_DATA_EXPLORER", authority: "FEDERAL", type: "crime_statistics", coverage: "US_NATIONAL" },
    { source_id: "FBI_PRESS_RELEASES", authority: "FEDERAL", type: "federal_activity", coverage: "US_NATIONAL" },
    { source_id: "DEA_PRESS_RELEASES", authority: "FEDERAL", type: "narcotics_enforcement", coverage: "US_NATIONAL" },
    { source_id: "ATF_PRESS_RELEASES", authority: "FEDERAL", type: "firearms_enforcement", coverage: "US_NATIONAL" },
    { source_id: "DOJ_PRESS_RELEASES", authority: "FEDERAL", type: "justice_activity", coverage: "US_NATIONAL" },
    { source_id: "DHS_BULLETINS", authority: "FEDERAL", type: "homeland_security_signal", coverage: "US_NATIONAL" },
    { source_id: "FEMA_GRANTS", authority: "FEDERAL", type: "federal_funding", coverage: "US_NATIONAL" },
    { source_id: "DOJ_COPS_OFFICE", authority: "FEDERAL", type: "law_enforcement_grants", coverage: "US_NATIONAL" },
    { source_id: "USA_SPENDING", authority: "FEDERAL", type: "federal_spending", coverage: "US_NATIONAL" },
    { source_id: "SAM_GOV", authority: "FEDERAL", type: "federal_procurement", coverage: "US_NATIONAL" },
    { source_id: "HIFLD", authority: "FEDERAL", type: "infrastructure_geospatial", coverage: "US_NATIONAL" },
    { source_id: "BJS", authority: "FEDERAL", type: "justice_statistics", coverage: "US_NATIONAL" },
    { source_id: "OFAC", authority: "FEDERAL", type: "sanctions", coverage: "GLOBAL_US_RELEVANT" },
    { source_id: "PACER_REFERENCES", authority: "FEDERAL", type: "federal_litigation", coverage: "US_NATIONAL" },
    { source_id: "FEDERAL_REGISTER", authority: "FEDERAL", type: "federal_rulemaking", coverage: "US_NATIONAL" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

console.log("[L01 SOURCE CATALOG] COMPLETE", catalog.source_classes.length);
