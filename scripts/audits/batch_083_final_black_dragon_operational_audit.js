const fs = require("fs");
const path = require("path");

function exists(file) {
  return fs.existsSync(path.resolve(file));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function safeJson(file) {
  try {
    return exists(file) ? readJson(file) : null;
  } catch (err) {
    return null;
  }
}

const files = {
  finalHub:
    "public/data/audits/hub/batch_063_final_hub_perfection_checkpoint.json",

  finalAccess:
    "public/data/security/platform/final_post_expansion_client_access_checkpoint.json",

  educationRuntime:
    "public/data/clients/black_dragon/education/runtime/dashboard/education_runtime_dashboard.v1.json",

  educationAudit:
    "public/data/clients/black_dragon/education/runtime/audit/batch_071_runtime_integration_audit.json",

  veteranAudit:
    "public/data/clients/black_dragon/veteran/audit/batch_072_veteran_registry_audit.json",

  motorAudit:
    "public/data/clients/black_dragon/motor_units/audit/batch_073_motor_unit_registry_audit.json",

  distributionAudit:
    "public/data/clients/black_dragon/distribution/audit/batch_074_distribution_registry_audit.json",

  eventAudit:
    "public/data/clients/black_dragon/events/audit/batch_075_event_registry_audit.json",

  fusionAudit:
    "public/data/clients/black_dragon/fusion/audit/batch_076_cross_ecosystem_fusion_audit.json",

  nationalAudit:
    "public/data/clients/black_dragon/national/audit/batch_077_national_cross_ecosystem_runtime_audit.json",

  graphAudit:
    "public/data/clients/black_dragon/graph/audit/batch_078_national_propagation_graph_runtime_audit.json",

  influenceAudit:
    "public/data/clients/black_dragon/influence/audit/batch_079_regional_influence_scoring_audit.json",

  distributionDensityAudit:
    "public/data/clients/black_dragon/distribution_density/audit/batch_080_distribution_density_mapping_audit.json",

  institutionalAudit:
    "public/data/clients/black_dragon/institutional/audit/batch_081_institutional_relationship_scoring_audit.json",

  readinessAudit:
    "public/data/clients/black_dragon/readiness/audit/batch_082_outreach_readiness_synthesis_audit.json",

  nationalRuntime:
    "public/data/clients/black_dragon/national/runtime/national_cross_ecosystem_runtime.v1.json",

  graphRuntime:
    "public/data/clients/black_dragon/graph/runtime/national_propagation_graph_runtime.v1.json",

  readinessRuntime:
    "public/data/clients/black_dragon/readiness/runtime/outreach_readiness_synthesis.v1.json",

  queueRuntime:
    "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json",

  responseStore:
    "public/globe/clients/black_dragon/books/response_persistence_store.js",

  responseWorkflow:
    "public/globe/clients/black_dragon/books/response_workflow_runtime.js",

  dossierSync:
    "public/globe/clients/black_dragon/books/dossier_sync_runtime.js",

  layerControls:
    "public/globe/clients/black_dragon/books/book_layer_controls.js"
};

const json = Object.fromEntries(
  Object.entries(files).map(([key, file]) => [key, safeJson(file)])
);

const audits = [
  "educationAudit",
  "veteranAudit",
  "motorAudit",
  "distributionAudit",
  "eventAudit",
  "fusionAudit",
  "nationalAudit",
  "graphAudit",
  "influenceAudit",
  "distributionDensityAudit",
  "institutionalAudit",
  "readinessAudit"
];

const nationalRuntime = json.nationalRuntime;
const graphRuntime = json.graphRuntime;
const readinessRuntime = json.readinessRuntime;
const queueRuntime = json.queueRuntime;

const queueItems =
  queueRuntime?.all_queue_items ||
  queueRuntime?.ready_queue ||
  [];

const audit = {
  version:
    "umbra_batch_083_final_black_dragon_operational_audit_v1",

  generated_at:
    new Date().toISOString(),

  file_integrity:
    Object.fromEntries(
      Object.entries(files).map(([key, file]) => [key, exists(file)])
    ),

  core_hub_integrity: {
    final_hub_pass:
      json.finalHub?.pass === true,

    final_access_pass:
      json.finalAccess?.pass === true,

    response_store_present:
      exists(files.responseStore),

    response_workflow_present:
      exists(files.responseWorkflow),

    dossier_sync_present:
      exists(files.dossierSync),

    layer_controls_present:
      exists(files.layerControls)
  },

  original_black_dragon_integrity: {
    operational_targets:
      queueItems.length,

    has_original_outreach_targets:
      queueItems.length >= 1000
  },

  expansion_audit_integrity:
    Object.fromEntries(
      audits.map(key => [key, json[key]?.pass === true])
    ),

  national_runtime_integrity: {
    national_runtime_present:
      !!nationalRuntime,

    national_cities:
      nationalRuntime?.totals?.national_cities || 0,

    ecosystems:
      nationalRuntime?.totals?.ecosystems || 0,

    runtime_entities:
      nationalRuntime?.totals?.runtime_entities || 0,

    national_outreach_allowed:
      nationalRuntime?.totals?.outreach_allowed || 0
  },

  graph_runtime_integrity: {
    graph_runtime_present:
      !!graphRuntime,

    graph_edges:
      graphRuntime?.totals?.graph_edges || 0,

    propagation_chains:
      graphRuntime?.totals?.propagation_chains || 0,

    graph_outreach_allowed:
      graphRuntime?.totals?.outreach_allowed || 0
  },

  readiness_integrity: {
    readiness_present:
      !!readinessRuntime,

    synthesized_entities:
      readinessRuntime?.totals?.synthesized_entities || 0,

    outreach_ready:
      readinessRuntime?.totals?.outreach_ready || 0,

    verification_required:
      readinessRuntime?.totals?.verification_required || 0,

    verification_queue:
      readinessRuntime?.totals?.verification_queue || 0
  },

  safety_integrity: {
    national_expansion_outreach_blocked:
      (nationalRuntime?.totals?.outreach_allowed || 0) === 0,

    graph_outreach_blocked:
      (graphRuntime?.totals?.outreach_allowed || 0) === 0,

    readiness_blocks_unverified:
      (readinessRuntime?.totals?.outreach_ready || 0) === 0 &&
      (readinessRuntime?.totals?.verification_required || 0) >= 1000,

    no_missing_required_audits:
      audits.every(key => json[key]?.pass === true)
  }
};

audit.pass =
  Object.values(audit.file_integrity).every(Boolean) &&
  Object.values(audit.core_hub_integrity).every(Boolean) &&
  audit.original_black_dragon_integrity.has_original_outreach_targets &&
  Object.values(audit.expansion_audit_integrity).every(Boolean) &&
  audit.national_runtime_integrity.national_runtime_present &&
  audit.national_runtime_integrity.national_cities >= 50 &&
  audit.national_runtime_integrity.ecosystems === 5 &&
  audit.national_runtime_integrity.runtime_entities >= 1000 &&
  audit.national_runtime_integrity.national_outreach_allowed === 0 &&
  audit.graph_runtime_integrity.graph_runtime_present &&
  audit.graph_runtime_integrity.graph_edges > 10000 &&
  audit.graph_runtime_integrity.propagation_chains > 10000 &&
  audit.graph_runtime_integrity.graph_outreach_allowed === 0 &&
  audit.readiness_integrity.readiness_present &&
  audit.readiness_integrity.synthesized_entities >= 1000 &&
  audit.readiness_integrity.outreach_ready === 0 &&
  audit.readiness_integrity.verification_required >= 1000 &&
  audit.readiness_integrity.verification_queue > 0 &&
  Object.values(audit.safety_integrity).every(Boolean);

audit.findings = [];

if (!audit.pass) {
  for (const [section, data] of Object.entries(audit)) {
    if (
      data &&
      typeof data === "object" &&
      !Array.isArray(data)
    ) {
      for (const [key, value] of Object.entries(data)) {
        if (value === false || value === 0 || value === null) {
          audit.findings.push({ section, key, value });
        }
      }
    }
  }
}

const checkpoint = {
  checkpoint:
    "FINAL_BLACK_DRAGON_OPERATIONAL_AUDIT",

  generated_at:
    new Date().toISOString(),

  pass:
    audit.pass,

  findings:
    audit.findings,

  summary: {
    original_operational_targets:
      audit.original_black_dragon_integrity.operational_targets,

    national_cities:
      audit.national_runtime_integrity.national_cities,

    national_runtime_entities:
      audit.national_runtime_integrity.runtime_entities,

    propagation_edges:
      audit.graph_runtime_integrity.graph_edges,

    propagation_chains:
      audit.graph_runtime_integrity.propagation_chains,

    synthesized_readiness_entities:
      audit.readiness_integrity.synthesized_entities,

    verification_queue:
      audit.readiness_integrity.verification_queue
  }
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/final_audit/batch_083_final_black_dragon_operational_audit.json"),
  JSON.stringify(audit, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/final_audit/batch_083_final_black_dragon_operational_checkpoint.json"),
  JSON.stringify(checkpoint, null, 2)
);

console.log(JSON.stringify({
  status:
    "BATCH_083_FINAL_BLACK_DRAGON_OPERATIONAL_AUDIT_COMPLETE",

  pass:
    checkpoint.pass,

  findings:
    checkpoint.findings,

  summary:
    checkpoint.summary,

  checkpoint:
    "public/data/clients/black_dragon/final_audit/batch_083_final_black_dragon_operational_checkpoint.json"
}, null, 2));

if (!audit.pass) process.exit(1);
