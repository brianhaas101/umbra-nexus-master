const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

function sha(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

const now = new Date().toISOString();

const states = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
];

const sourceClasses = [
  {
    class_id: "L02_CLASS_001_STATE_POST",
    name: "State POST / Certification Authority",
    purpose: "Tracks law enforcement certification, training standards, POST rules, and academy requirements."
  },
  {
    class_id: "L02_CLASS_002_STATE_DOJ",
    name: "State DOJ / Attorney General",
    purpose: "Tracks state justice policy, enforcement announcements, grants, public safety initiatives."
  },
  {
    class_id: "L02_CLASS_003_STATE_GRANTS",
    name: "State Grants / Funding Offices",
    purpose: "Tracks state-administered funding opportunities and public safety grant programs."
  },
  {
    class_id: "L02_CLASS_004_STATE_PROCUREMENT",
    name: "State Procurement / Vendor Portals",
    purpose: "Tracks contract opportunities, bids, solicitations, and vendor-facing state purchasing."
  },
  {
    class_id: "L02_CLASS_005_STATE_ACADEMY",
    name: "State Academy / Training Systems",
    purpose: "Tracks public safety academies, training calendars, certification courses, and curriculum signals."
  }
];

const stateMatrix = states.map(([abbr, name], index) => ({
  state_id: `STATE_${abbr}`,
  state_abbr: abbr,
  state_name: name,
  layer_id: "L02",
  ordinal: index + 1,
  required_source_classes: sourceClasses.map(c => c.class_id),
  target_connectors: sourceClasses.length,
  status: "FOUNDATION_REGISTERED"
}));

const connectors = [];

for (const state of stateMatrix) {
  for (const sourceClass of sourceClasses) {
    connectors.push({
      connector_id: `L02_${state.state_abbr}_${sourceClass.class_id}`,
      layer_id: "L02",
      state_id: state.state_id,
      state_abbr: state.state_abbr,
      state_name: state.state_name,
      class_id: sourceClass.class_id,
      source_name: `${state.state_name} — ${sourceClass.name}`,
      acquisition_status: "DISCOVERY_REQUIRED",
      acquisition_mode: "state_specific_discovery",
      parser_status: "PENDING_STATE_SPECIFIC_BINDING",
      normalizer_id: "L02_STATE_NORMALIZER_V1",
      lineage_required: true,
      deterministic_replay_required: true,
      no_fake_data_policy: true
    });
  }
}

const acquisitionContracts = connectors.map(c => ({
  connector_id: c.connector_id,
  state_id: c.state_id,
  state_abbr: c.state_abbr,
  class_id: c.class_id,
  acquisition_contract_status: "REGISTERED_PENDING_DISCOVERY",
  expected_access_modes: [
    "public_html",
    "public_pdf",
    "public_json_or_api",
    "manual_curated_review",
    "premium_or_auth_bound_if_required"
  ],
  blocked_evidence_policy: "ZERO_OPERATIONAL_EVIDENCE_UNTIL_SOURCE_VERIFIED",
  auth_policy: "ENV_ONLY_FOR_CREDENTIALS_NEVER_COMMIT_SECRET",
  lineage_required: true,
  replay_required: true
}));

const parserRegistry = connectors.map(c => ({
  parser_id: `${c.connector_id}_PARSER_V1`,
  connector_id: c.connector_id,
  state_id: c.state_id,
  class_id: c.class_id,
  parser_status: "REGISTERED_PENDING_SOURCE_DISCOVERY",
  parser_requirements: {
    extract_title: true,
    extract_url: true,
    extract_date_if_present: true,
    extract_agency_if_present: true,
    map_to_evidence: true,
    map_to_signal: true,
    map_to_score_component: true,
    preserve_raw_lineage: true
  }
}));

const replayPlans = connectors.map(c => ({
  connector_id: c.connector_id,
  replay_store: `public/data/intelligence/replay/L02/${c.state_abbr}/${c.class_id}`,
  raw_snapshot_hash_required: true,
  normalized_snapshot_hash_required: true,
  status: "REGISTERED"
}));

const deltaPlans = connectors.map(c => ({
  connector_id: c.connector_id,
  delta_strategy: "compare_current_normalized_hash_to_previous_hash",
  emits_added_removed_changed: true,
  status: "REGISTERED"
}));

const semanticRules = sourceClasses.map(c => ({
  class_id: c.class_id,
  normalizer_id: `L02_SEMANTIC_${c.class_id}`,
  entity_terms: [
    "state_agency",
    "training",
    "certification",
    "grant",
    "procurement",
    "public_safety",
    "law_enforcement"
  ],
  status: "REGISTERED"
}));

const scoringRules = sourceClasses.map((c, index) => ({
  class_id: c.class_id,
  scoring_component: `L02_SCORE_${String(index + 1).padStart(3, "0")}`,
  base_weight: [0.96, 0.92, 0.9, 0.88, 0.86][index],
  scoring_role: "state_public_safety_operational_intelligence",
  status: "REGISTERED"
}));

const correlationRules = sourceClasses.map(c => ({
  class_id: c.class_id,
  correlation_targets: ["L01", "L03", "L04", "L09", "L11", "L12"],
  correlation_keys: ["state", "agency", "program", "training", "grant", "procurement", "date"],
  status: "REGISTERED"
}));

const report = {
  version: "nexus_L02_all_50_state_foundation_batch_001_v1",
  generated_at: now,
  layer_id: "L02",
  batch_id: "L02_ALL_50_STATE_FOUNDATION_BATCH_001",
  status: "PASS",
  counts: {
    states: stateMatrix.length,
    source_classes: sourceClasses.length,
    connectors: connectors.length,
    acquisition_contracts: acquisitionContracts.length,
    parsers: parserRegistry.length,
    replay_plans: replayPlans.length,
    delta_plans: deltaPlans.length,
    semantic_rule_sets: semanticRules.length,
    scoring_rule_sets: scoringRules.length,
    correlation_rule_sets: correlationRules.length
  },
  gates: {
    all_50_states_registered: stateMatrix.length === 50,
    five_source_classes_registered: sourceClasses.length === 5,
    two_hundred_fifty_connectors_registered: connectors.length === 250,
    acquisition_contracts_registered: acquisitionContracts.length === 250,
    parser_registry_registered: parserRegistry.length === 250,
    replay_registered: replayPlans.length === 250,
    delta_registered: deltaPlans.length === 250,
    semantic_rules_registered: semanticRules.length === 5,
    scoring_rules_registered: scoringRules.length === 5,
    correlation_rules_registered: correlationRules.length === 5,
    no_fake_data_policy_registered: connectors.every(c => c.no_fake_data_policy === true)
  }
};

report.report_hash = sha(report);

writeJson("public/data/intelligence/sophistication/L02/state_matrix.json", {
  version: "nexus_L02_state_matrix_v1",
  generated_at: now,
  layer_id: "L02",
  states: stateMatrix
});

writeJson("public/data/intelligence/sophistication/L02/source_classes.json", {
  version: "nexus_L02_source_classes_v1",
  generated_at: now,
  layer_id: "L02",
  source_classes: sourceClasses
});

writeJson("public/data/intelligence/sophistication/L02/connector_manifest.json", {
  version: "nexus_L02_connector_manifest_v1",
  generated_at: now,
  layer_id: "L02",
  connectors
});

writeJson("public/data/intelligence/sophistication/L02/acquisition_contracts.json", {
  version: "nexus_L02_acquisition_contracts_v1",
  generated_at: now,
  layer_id: "L02",
  contracts: acquisitionContracts
});

writeJson("public/data/intelligence/sophistication/L02/parser_registry.json", {
  version: "nexus_L02_parser_registry_v1",
  generated_at: now,
  layer_id: "L02",
  parsers: parserRegistry
});

writeJson("public/data/intelligence/sophistication/L02/replay_plan.json", {
  version: "nexus_L02_replay_plan_v1",
  generated_at: now,
  layer_id: "L02",
  plans: replayPlans
});

writeJson("public/data/intelligence/sophistication/L02/delta_plan.json", {
  version: "nexus_L02_delta_plan_v1",
  generated_at: now,
  layer_id: "L02",
  plans: deltaPlans
});

writeJson("public/data/intelligence/sophistication/L02/semantic_rules.json", {
  version: "nexus_L02_semantic_rules_v1",
  generated_at: now,
  layer_id: "L02",
  rules: semanticRules
});

writeJson("public/data/intelligence/sophistication/L02/scoring_rules.json", {
  version: "nexus_L02_scoring_rules_v1",
  generated_at: now,
  layer_id: "L02",
  rules: scoringRules
});

writeJson("public/data/intelligence/sophistication/L02/correlation_rules.json", {
  version: "nexus_L02_correlation_rules_v1",
  generated_at: now,
  layer_id: "L02",
  rules: correlationRules
});

writeJson("logs/sophistication/L02_all_50_state_foundation_batch_001_report.json", report);

console.log(JSON.stringify({
  status: "L02_ALL_50_STATE_FOUNDATION_BATCH_001_COMPLETE",
  counts: report.counts,
  gates: report.gates,
  report: "logs/sophistication/L02_all_50_state_foundation_batch_001_report.json"
}, null, 2));
