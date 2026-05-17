const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/sources/L11_INCIDENT_AND_RISK.sources.json";

const catalog = {
  version: "nexus_L11_incident_and_risk_sources_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L11_INCIDENT_AND_RISK",
  target_sources: 15,
  production_ready: true,
  source_classes: [
    { source_id: "FBI_CRIME_DATA", authority: "FEDERAL", type: "crime_statistics", coverage: "US_NATIONAL" },
    { source_id: "STATE_CRIME_REPORTS", authority: "STATE", type: "crime_reporting", coverage: "STATE" },
    { source_id: "LOCAL_INCIDENT_DASHBOARDS", authority: "LOCAL", type: "incident_tracking", coverage: "LOCAL" },
    { source_id: "EMERGENCY_CALL_DATA", authority: "LOCAL", type: "dispatch_activity", coverage: "LOCAL" },
    { source_id: "PUBLIC_SAFETY_ALERTS", authority: "STATE", type: "operational_alerts", coverage: "STATE_REGIONAL" },
    { source_id: "WEATHER_EMERGENCY_FEEDS", authority: "FEDERAL", type: "environmental_risk", coverage: "US_NATIONAL" },
    { source_id: "DHS_BULLETINS", authority: "FEDERAL", type: "security_risk", coverage: "US_NATIONAL" },
    { source_id: "COURT_CASE_ACTIVITY", authority: "STATE", type: "legal_risk", coverage: "STATE_LOCAL" },
    { source_id: "INSURANCE_RISK_REPORTS", authority: "COMMERCIAL", type: "risk_assessment", coverage: "REGIONAL_NATIONAL" },
    { source_id: "REGIONAL_GANG_ACTIVITY", authority: "STATE", type: "organized_activity", coverage: "REGIONAL" },
    { source_id: "CRITICAL_INFRASTRUCTURE_ALERTS", authority: "FEDERAL", type: "infrastructure_risk", coverage: "US_NATIONAL" },
    { source_id: "PUBLIC_HEALTH_ALERTS", authority: "STATE", type: "health_risk", coverage: "STATE_REGIONAL" },
    { source_id: "ACTIVE_INCIDENT_FEEDS", authority: "LOCAL", type: "real_time_activity", coverage: "LOCAL" },
    { source_id: "TRANSPORTATION_DISRUPTION_FEEDS", authority: "STATE", type: "mobility_risk", coverage: "STATE_REGIONAL" },
    { source_id: "MEDIA_ESCALATION_MONITORING", authority: "OSINT", type: "public_pressure", coverage: "LOCAL_REGIONAL" }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));

console.log("[L11 SOURCE CATALOG] COMPLETE", catalog.source_classes.length);
