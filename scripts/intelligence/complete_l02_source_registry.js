const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L02_STATE_PUBLIC_SAFETY_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(
    fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
  );
}

const registry = readJsonNoBom(abs);

const additions = [
  ["L02_SRC_004_STATE_GRANT_OFFICES", "State Grant Offices", 0.94, "grant_distribution", "state_grants_connector", "state_grants_parser", "STATE_GRANT_SIGNAL", "state_grant_profile", "retain_with_state_grant_trace"],
  ["L02_SRC_005_STATE_EMERGENCY_MANAGEMENT", "State Emergency Management", 0.93, "emergency_preparedness", "state_emergency_management_connector", "state_emergency_management_parser", "STATE_OPERATIONAL_PRESSURE_SIGNAL", "state_emergency_profile", "retain_with_state_emergency_trace"],
  ["L02_SRC_006_STATE_PROCUREMENT_SYSTEMS", "State Procurement Systems", 0.92, "procurement", "state_procurement_connector", "state_procurement_parser", "STATE_PROCUREMENT_SIGNAL", "state_procurement_profile", "retain_with_state_procurement_trace"],
  ["L02_SRC_007_STATE_TRAINING_BULLETINS", "State Training Bulletins", 0.91, "training_updates", "state_training_bulletin_connector", "state_training_bulletin_parser", "STATE_TRAINING_SIGNAL", "state_training_bulletin_profile", "retain_with_state_training_trace"],
  ["L02_SRC_008_STATE_AGENCY_DIRECTORIES", "State Law Enforcement Directories", 0.90, "agency_directory", "state_agency_directory_connector", "state_agency_directory_parser", "STATE_COMMAND_SIGNAL", "state_agency_directory_profile", "retain_with_state_agency_trace"],
  ["L02_SRC_009_STATE_CERTIFICATION_DATABASES", "State Certification Databases", 0.89, "certification_tracking", "state_certification_connector", "state_certification_parser", "STATE_CERTIFICATION_SIGNAL", "state_certification_profile", "retain_with_state_certification_trace"],
  ["L02_SRC_010_STATE_CORRECTIONS_SYSTEMS", "State Corrections Systems", 0.88, "corrections_operations", "state_corrections_connector", "state_corrections_parser", "STATE_OPERATIONAL_PRESSURE_SIGNAL", "state_corrections_profile", "retain_with_state_corrections_trace"],
  ["L02_SRC_011_STATE_FUSION_CENTERS", "State Fusion Center References", 0.87, "intelligence_fusion", "state_fusion_center_connector", "state_fusion_center_parser", "STATE_OPERATIONAL_PRESSURE_SIGNAL", "state_fusion_profile", "retain_with_state_fusion_trace"],
  ["L02_SRC_012_STATE_PUBLIC_SAFETY_COMMISSIONS", "State Public Safety Commissions", 0.86, "public_safety_governance", "state_public_safety_commission_connector", "state_public_safety_commission_parser", "STATE_COMMAND_SIGNAL", "state_public_safety_commission_profile", "retain_with_state_commission_trace"],
  ["L02_SRC_013_STATE_BUDGET_PUBLICATIONS", "State Budget Publications", 0.85, "budget_analysis", "state_budget_connector", "state_budget_parser", "STATE_BUDGET_SIGNAL", "state_budget_profile", "retain_with_state_budget_trace"],
  ["L02_SRC_014_STATE_CRIMINAL_JUSTICE_COUNCILS", "State Criminal Justice Councils", 0.84, "justice_coordination", "state_criminal_justice_council_connector", "state_criminal_justice_council_parser", "STATE_COMMAND_SIGNAL", "state_criminal_justice_council_profile", "retain_with_state_council_trace"],
  ["L02_SRC_015_STATE_TASK_FORCE_NOTICES", "State Interagency Task Force Notices", 0.83, "interagency_operations", "state_task_force_connector", "state_task_force_parser", "STATE_OPERATIONAL_PRESSURE_SIGNAL", "state_task_force_profile", "retain_with_state_task_force_trace"]
];

registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L02",
      name,
      authority_score,
      authority: "STATE",
      type,
      coverage: "US_STATEWIDE",
      acquisition_type: "public_state_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "state_public_safety_normalizer",
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
  status: "L02_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
