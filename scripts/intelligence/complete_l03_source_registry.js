const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L03_LOCAL_OPERATIONAL_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L03_SRC_004_CITY_PROCUREMENT_SYSTEMS", "City Procurement Systems", 0.95, "city_procurement", "city_procurement_connector", "city_procurement_parser", "LOCAL_PROCUREMENT_SIGNAL", "city_procurement_profile", "retain_with_city_procurement_trace"],
  ["L03_SRC_005_LOCAL_PUBLIC_SAFETY_BUDGETS", "Local Public Safety Budgets", 0.94, "local_budget", "local_budget_connector", "local_budget_parser", "LOCAL_BUDGET_SIGNAL", "local_budget_profile", "retain_with_local_budget_trace"],
  ["L03_SRC_006_COUNTY_EMERGENCY_MANAGEMENT", "County Emergency Management", 0.93, "county_emergency_management", "county_emergency_management_connector", "county_emergency_management_parser", "LOCAL_OPERATIONAL_PRESSURE_SIGNAL", "county_emergency_profile", "retain_with_county_emergency_trace"],
  ["L03_SRC_007_LOCAL_TRAINING_BULLETINS", "Local Training Bulletins", 0.92, "local_training", "local_training_connector", "local_training_parser", "LOCAL_TRAINING_SIGNAL", "local_training_profile", "retain_with_local_training_trace"],
  ["L03_SRC_008_FIRE_RESCUE_DEPARTMENTS", "Fire and Rescue Departments", 0.91, "fire_rescue", "fire_rescue_connector", "fire_rescue_parser", "LOCAL_ACTIVITY_SIGNAL", "fire_rescue_profile", "retain_with_fire_rescue_trace"],
  ["L03_SRC_009_LOCAL_INCIDENT_REPORTING", "Local Incident Reporting", 0.90, "local_incident_reporting", "local_incident_connector", "local_incident_parser", "LOCAL_ACTIVITY_SIGNAL", "local_incident_profile", "retain_with_local_incident_trace"],
  ["L03_SRC_010_LOCAL_PUBLIC_MEETING_RECORDS", "Local Public Meeting Records", 0.89, "local_meeting_records", "local_meeting_connector", "local_meeting_parser", "LOCAL_OPERATIONAL_PRESSURE_SIGNAL", "local_meeting_profile", "retain_with_local_meeting_trace"],
  ["L03_SRC_011_COUNTY_CORRECTIONS_SYSTEMS", "County Corrections Systems", 0.88, "county_corrections", "county_corrections_connector", "county_corrections_parser", "LOCAL_OPERATIONAL_PRESSURE_SIGNAL", "county_corrections_profile", "retain_with_county_corrections_trace"],
  ["L03_SRC_012_REGIONAL_TASK_FORCE_NOTICES", "Regional Task Force Notices", 0.87, "regional_task_force", "regional_task_force_connector", "regional_task_force_parser", "LOCAL_OPERATIONAL_PRESSURE_SIGNAL", "regional_task_force_profile", "retain_with_regional_task_force_trace"],
  ["L03_SRC_013_LOCAL_GRANT_ALLOCATIONS", "Local Grant Allocations", 0.86, "local_grants", "local_grants_connector", "local_grants_parser", "LOCAL_BUDGET_SIGNAL", "local_grant_profile", "retain_with_local_grant_trace"],
  ["L03_SRC_014_CITY_STAFFING_JOB_BOARDS", "City Staffing and Job Boards", 0.85, "local_staffing", "local_staffing_connector", "local_staffing_parser", "LOCAL_STAFFING_SIGNAL", "local_staffing_profile", "retain_with_local_staffing_trace"],
  ["L03_SRC_015_LOCAL_OPERATIONAL_ADVISORIES", "Local Operational Advisories", 0.84, "local_operational_advisories", "local_advisory_connector", "local_advisory_parser", "LOCAL_OPERATIONAL_PRESSURE_SIGNAL", "local_advisory_profile", "retain_with_local_advisory_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L03",
      name,
      authority_score,
      authority: "LOCAL",
      type,
      coverage: "US_LOCAL",
      acquisition_type: "public_local_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "local_operational_normalizer",
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
  status: "L03_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
