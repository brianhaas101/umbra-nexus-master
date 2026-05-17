const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L07_OPERATIONAL_ACTIVITY_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L07_SRC_004_FIELD_OPERATION_NOTICES", "Field Operation Notices", 0.95, "field_operation_notice", "field_operation_connector", "field_operation_parser", "OPERATIONAL_FIELD_ACTIVITY_SIGNAL", "field_operation_profile", "retain_with_field_operation_trace"],
  ["L07_SRC_005_DEPLOYMENT_ACTIVITY_RECORDS", "Deployment Activity Records", 0.94, "deployment_activity_record", "deployment_activity_connector", "deployment_activity_parser", "OPERATIONAL_DEPLOYMENT_SIGNAL", "deployment_activity_profile", "retain_with_deployment_activity_trace"],
  ["L07_SRC_006_PUBLIC_SAFETY_ALERTS", "Public Safety Alerts", 0.93, "public_safety_alert", "public_safety_alert_connector", "public_safety_alert_parser", "OPERATIONAL_ALERT_SIGNAL", "public_safety_alert_profile", "retain_with_public_safety_alert_trace"],
  ["L07_SRC_007_EVENT_SECURITY_NOTICES", "Event Security Notices", 0.92, "event_security_notice", "event_security_connector", "event_security_parser", "OPERATIONAL_ACTIVITY_SIGNAL", "event_security_profile", "retain_with_event_security_trace"],
  ["L07_SRC_008_TRAFFIC_ROAD_CLOSURE_FEEDS", "Traffic and Road Closure Feeds", 0.91, "traffic_road_closure_feed", "traffic_road_closure_connector", "traffic_road_closure_parser", "OPERATIONAL_DISRUPTION_SIGNAL", "traffic_road_closure_profile", "retain_with_traffic_road_closure_trace"],
  ["L07_SRC_009_EMERGENCY_DECLARATION_RECORDS", "Emergency Declaration Records", 0.90, "emergency_declaration_record", "emergency_declaration_connector", "emergency_declaration_parser", "OPERATIONAL_PRESSURE_SIGNAL", "emergency_declaration_profile", "retain_with_emergency_declaration_trace"],
  ["L07_SRC_010_MUTUAL_AID_ACTIVITY", "Mutual Aid Activity", 0.89, "mutual_aid_activity", "mutual_aid_connector", "mutual_aid_parser", "OPERATIONAL_COORDINATION_SIGNAL", "mutual_aid_profile", "retain_with_mutual_aid_trace"],
  ["L07_SRC_011_OPERATIONAL_STATUS_DASHBOARDS", "Operational Status Dashboards", 0.88, "operational_status_dashboard", "operational_status_connector", "operational_status_parser", "OPERATIONAL_TEMPO_SIGNAL", "operational_status_profile", "retain_with_operational_status_trace"],
  ["L07_SRC_012_ENFORCEMENT_CAMPAIGN_NOTICES", "Enforcement Campaign Notices", 0.87, "enforcement_campaign_notice", "enforcement_campaign_connector", "enforcement_campaign_parser", "OPERATIONAL_ENFORCEMENT_SIGNAL", "enforcement_campaign_profile", "retain_with_enforcement_campaign_trace"],
  ["L07_SRC_013_PATROL_ACTIVITY_REFERENCES", "Patrol Activity References", 0.86, "patrol_activity_reference", "patrol_activity_connector", "patrol_activity_parser", "OPERATIONAL_ACTIVITY_SIGNAL", "patrol_activity_profile", "retain_with_patrol_activity_trace"],
  ["L07_SRC_014_EMERGENCY_RESPONSE_SUMMARIES", "Emergency Response Summaries", 0.85, "emergency_response_summary", "emergency_response_connector", "emergency_response_parser", "OPERATIONAL_RESPONSE_SIGNAL", "emergency_response_profile", "retain_with_emergency_response_trace"],
  ["L07_SRC_015_OPERATIONAL_ADVISORY_FEEDS", "Operational Advisory Feeds", 0.84, "operational_advisory_feed", "operational_advisory_connector", "operational_advisory_parser", "OPERATIONAL_ADVISORY_SIGNAL", "operational_advisory_profile", "retain_with_operational_advisory_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L07",
      name,
      authority_score,
      authority: "OPERATIONAL",
      type,
      coverage: "US_OPERATIONAL",
      acquisition_type: "public_operational_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "operational_activity_normalizer",
      lineage_tracking_enabled: true,
      evidence_retention_policy,
      signal_generation_type,
      dossier_contribution_type
    });
  }
}

registry.sources.sort((a, b) => a.source_id.localeCompare(b.source_id));
registry.generated_at = new Date().toISOString();

fs.writeFileSync(abs, JSON.stringify(registry, null, 2), "utf8");

console.log(JSON.stringify({
  status: "L07_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
