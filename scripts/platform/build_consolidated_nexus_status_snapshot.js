const fs = require("fs");
const path = require("path");

const files = {
  platformAudit:
    "public/data/security/audit/batch_036_full_nexus_platform_audit.json",

  prePilot:
    "public/data/security/prepilot/pre_black_dragon_live_client_access.json",

  clientPilot:
    "public/data/security/readiness/black_dragon_controlled_client_pilot_ready.json",

  multiClient:
    "public/data/security/audit/batch_033_multiclient_isolation_audit.json",

  mapAudit:
    "public/data/clients/black_dragon/books/audits/batch_034_map_visualization_audit.json",

  queue:
    "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",

  responses:
    "public/data/clients/black_dragon/books/responses/classified/classified_responses.v1.json",

  adaptive:
    "public/data/clients/black_dragon/books/adaptive_priority/adaptive_priority_index.v1.json",

  mapLayer:
    "public/data/clients/black_dragon/books/map/layers/book_propagation_map_layer.v1.json"
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const platformAudit = readJson(files.platformAudit);
const prePilot = readJson(files.prePilot);
const clientPilot = readJson(files.clientPilot);
const multiClient = readJson(files.multiClient);
const mapAudit = readJson(files.mapAudit);

const queue = readJson(files.queue);
const responses = readJson(files.responses);
const adaptive = readJson(files.adaptive);
const mapLayer = readJson(files.mapLayer);

const snapshot = {
  version: "umbra_consolidated_status_snapshot_v1",
  generated_at: new Date().toISOString(),

  overall_state: {
    full_platform_audit_passed:
      platformAudit.pass === true,

    pre_pilot_checkpoint_passed:
      prePilot.pass === true,

    client_pilot_checkpoint_passed:
      clientPilot.pass === true,

    multiclient_validation_passed:
      multiClient.pass === true,

    propagation_map_validation_passed:
      mapAudit.pass === true
  },

  runtime_state: {
    world_mode_present:
      platformAudit.core_runtime_integrity.core_mentions_world_mode,

    city_map_mode_present:
      platformAudit.core_runtime_integrity.core_mentions_city_map_mode,

    core_runtime_present:
      platformAudit.core_runtime_integrity.core_defines_umbra_global,

    ui_runtime_present:
      platformAudit.core_runtime_integrity.ui_module_present
  },

  intelligence_state: {
    intelligence_registry_present:
      platformAudit.intelligence_system_integrity.registry_present,

    intelligence_pipeline_present:
      platformAudit.intelligence_system_integrity.pipeline_present,

    first_5_operational_checkpoint_present:
      platformAudit.intelligence_system_integrity.first_5_checkpoint_available,

    adaptive_priority_operational:
      platformAudit.operational_score_integrity.adaptive_scores_valid
  },

  security_state: {
    strict_client_isolation:
      platformAudit.security_integrity.strict_client_isolation,

    export_lockdown_active:
      platformAudit.security_integrity.export_cross_client_forbidden,

    session_recovery_active:
      platformAudit.security_integrity.session_guard_global,

    dataset_guarding_active:
      platformAudit.security_integrity.dataset_guard_global
  },

  client_state: {
    controlled_client_pilot_ready:
      clientPilot.pass === true,

    unrestricted_enterprise_ready:
      false,

    multi_client_ready:
      false
  },

  operational_density: {
    queue_targets:
      (queue.all_queue_items || []).length,

    response_records:
      (responses.responses || []).length,

    adaptive_targets:
      (adaptive.targets || []).length,

    map_features:
      (mapLayer.features || []).length
  },

  maturity_assessment: {
    architecture:
      "STRONG",

    runtime:
      "STRONG",

    security:
      "STRONG",

    client_infrastructure:
      "STRONG",

    operational_density:
      "EARLY",

    multi_client_operations:
      "EARLY",

    enterprise_scaling:
      "NOT_READY",

    live_operational_learning:
      "NEXT_PHASE"
  },

  current_phase:
    "EARLY_OPERATIONAL_INTELLIGENCE_PLATFORM",

  deployment_state: {
    safe_for_controlled_real_client_usage:
      true,

    safe_for_mass_client_rollout:
      false,

    safe_for_unrestricted_enterprise_claims:
      false
  },

  biggest_remaining_gaps: [
    "real-world operational density",
    "long-session runtime testing",
    "multi-client operational coexistence",
    "live response propagation chains",
    "deeper CITY_MAP intelligence rendering",
    "UX simplification"
  ]
};

snapshot.pass =
  Object.values(snapshot.overall_state).every(Boolean) &&
  snapshot.deployment_state.safe_for_controlled_real_client_usage === true &&
  snapshot.deployment_state.safe_for_mass_client_rollout === false;

fs.writeFileSync(
  path.resolve("public/data/platform/snapshots/consolidated_nexus_status_snapshot.json"),
  JSON.stringify(snapshot, null, 2)
);

console.log(JSON.stringify(snapshot, null, 2));

if (!snapshot.pass) process.exit(1);
