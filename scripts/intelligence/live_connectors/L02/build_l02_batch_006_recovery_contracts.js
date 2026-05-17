const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

function sha(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

const now = new Date().toISOString();

const batch005 = readJson("logs/sophistication/L02_batch_005_report.json");

const blocked = batch005.results.filter(r => r.status === "LIVE_FETCH_EMPTY_OR_FAILED");

if (blocked.length !== 10) {
  throw new Error(`Expected 10 blocked connectors from Batch 005, found ${blocked.length}`);
}

const recoveryContracts = blocked.map(item => {
  const recoveryMode =
    item.source_type === "STATE_PROCUREMENT"
      ? "BROWSER_OR_DYNAMIC_PORTAL_REQUIRED"
      : item.source_type === "STATE_GRANTS"
        ? "QUERY_OR_DEEP_PAGE_DISCOVERY_REQUIRED"
        : "ACADEMY_PAGE_DEEP_DISCOVERY_REQUIRED";

  return {
    connector_id: item.connector_id,
    state_abbr: item.state_abbr,
    source_type: item.source_type,
    current_status: item.status,
    recovery_mode: recoveryMode,
    recovery_status: "RECOVERY_CONTRACT_REGISTERED",
    can_emit_operational_evidence: false,
    blocked_evidence_policy: "ZERO_OPERATIONAL_EVIDENCE_UNTIL_RECOVERY_SUCCESS",
    required_capabilities: {
      browser_adapter: item.source_type === "STATE_PROCUREMENT",
      dynamic_html: true,
      session_safe_fetch: true,
      pagination_handling: item.source_type === "STATE_PROCUREMENT",
      form_workflow_handling: item.source_type === "STATE_PROCUREMENT",
      deep_link_discovery: true,
      deterministic_replay: true,
      lineage_preservation: true
    },
    activation_gate: {
      recovery_adapter_exists: false,
      source_verified: false,
      live_fetch_verified: false,
      normalized_evidence_verified: false
    }
  };
});

const antiBotPolicies = blocked.map(item => ({
  connector_id: item.connector_id,
  state_abbr: item.state_abbr,
  source_type: item.source_type,
  policy_id: `L02_ANTIBOT_${item.connector_id}`,
  policy_status: "REGISTERED",
  allowed_methods: [
    "standard_public_fetch",
    "browser_rendered_fetch",
    "rate_limited_session_fetch",
    "manual_curated_review_if_required"
  ],
  forbidden_methods: [
    "captcha_bypass",
    "credential_leakage",
    "unauthorized_access",
    "rate_limit_abuse"
  ],
  failed_fetch_policy: "ZERO_EVIDENCE_ZERO_SIGNALS_ZERO_SCORE"
}));

const browserAdapters = blocked.map(item => ({
  connector_id: item.connector_id,
  state_abbr: item.state_abbr,
  source_type: item.source_type,
  adapter_id: `L02_BROWSER_ADAPTER_${item.connector_id}`,
  adapter_status: item.source_type === "STATE_PROCUREMENT"
    ? "REQUIRED_PENDING_IMPLEMENTATION"
    : "OPTIONAL_PENDING_SOURCE_REVIEW",
  headless_allowed: true,
  deterministic_snapshot_required: true,
  replay_capture_required: true,
  output_contract: {
    raw_snapshot: true,
    normalized_snapshot: true,
    evidence: true,
    signals: true,
    score_components: true
  }
}));

const sessionReplayContracts = blocked.map(item => ({
  connector_id: item.connector_id,
  state_abbr: item.state_abbr,
  source_type: item.source_type,
  replay_status: "REGISTERED",
  replay_store: `public/data/intelligence/replay/L02/${item.state_abbr}/${item.connector_id}`,
  required_artifacts: [
    "request_metadata",
    "response_metadata",
    "raw_snapshot_hash",
    "normalized_snapshot_hash",
    "recovery_adapter_hash"
  ]
}));

const normalizedRecoveryStates = blocked.map(item => ({
  connector_id: item.connector_id,
  state_abbr: item.state_abbr,
  source_type: item.source_type,
  recovery_status: "BOUND_FOR_RECOVERY",
  current_operational_status: "BLOCKED_OR_EMPTY_SAFE",
  evidence: 0,
  signals: 0,
  score_components: 0,
  no_fake_data_policy: true
}));

for (const item of blocked) {
  const statePath = `public/data/intelligence/live_cache/L02/state/${item.state_abbr}/${item.connector_id}.state.json`;
  const state = readJson(statePath);

  const nextState = {
    ...state,
    generated_at: now,
    status: "RECOVERY_CONTRACT_BOUND",
    previous_status: state.status,
    recovery_required: true,
    recovery_mode:
      item.source_type === "STATE_PROCUREMENT"
        ? "BROWSER_OR_DYNAMIC_PORTAL_REQUIRED"
        : "DEEP_DISCOVERY_REQUIRED",
    can_emit_operational_evidence: false,
    blocked_evidence_policy: "ZERO_OPERATIONAL_EVIDENCE_UNTIL_RECOVERY_SUCCESS",
    recovery_contract_hash: null
  };

  const contract = recoveryContracts.find(c => c.connector_id === item.connector_id);
  nextState.recovery_contract_hash = sha(contract);

  writeJson(statePath, nextState);
}

const report = {
  version: "nexus_L02_batch_006_recovery_contracts_v1",
  generated_at: now,
  layer_id: "L02",
  batch_id: "L02_BATCH_006",
  status: "PASS",
  purpose: "Bind recovery contracts for Batch 005 blocked connectors without emitting fake operational evidence.",
  counts: {
    blocked_connectors: blocked.length,
    recovery_contracts: recoveryContracts.length,
    anti_bot_policies: antiBotPolicies.length,
    browser_adapters: browserAdapters.length,
    replay_contracts: sessionReplayContracts.length,
    normalized_recovery_states: normalizedRecoveryStates.length
  },
  gates: {
    ten_blocked_connectors_identified: blocked.length === 10,
    recovery_contracts_registered: recoveryContracts.length === 10,
    anti_bot_policies_registered: antiBotPolicies.length === 10,
    browser_adapters_registered: browserAdapters.length === 10,
    replay_contracts_registered: sessionReplayContracts.length === 10,
    no_operational_evidence_emitted: normalizedRecoveryStates.every(x =>
      x.evidence === 0 && x.signals === 0 && x.score_components === 0
    ),
    no_fake_data_policy_preserved: true
  },
  blocked_connectors: blocked,
  recoveryContracts,
  antiBotPolicies,
  browserAdapters,
  sessionReplayContracts,
  normalizedRecoveryStates
};

report.report_hash = sha(report);

writeJson(
  "public/data/intelligence/sophistication/L02/recovery_contracts.batch_006.json",
  {
    version: "nexus_L02_recovery_contracts_batch_006_v1",
    generated_at: now,
    layer_id: "L02",
    contracts: recoveryContracts
  }
);

writeJson(
  "public/data/intelligence/sophistication/L02/anti_bot_policy.batch_006.json",
  {
    version: "nexus_L02_antibot_policy_batch_006_v1",
    generated_at: now,
    layer_id: "L02",
    policies: antiBotPolicies
  }
);

writeJson(
  "public/data/intelligence/sophistication/L02/browser_adapter_contracts.batch_006.json",
  {
    version: "nexus_L02_browser_adapter_contracts_batch_006_v1",
    generated_at: now,
    layer_id: "L02",
    adapters: browserAdapters
  }
);

writeJson(
  "public/data/intelligence/sophistication/L02/session_replay_contracts.batch_006.json",
  {
    version: "nexus_L02_session_replay_contracts_batch_006_v1",
    generated_at: now,
    layer_id: "L02",
    contracts: sessionReplayContracts
  }
);

writeJson(
  "logs/sophistication/L02_batch_006_recovery_contracts_report.json",
  report
);

console.log(JSON.stringify({
  status: "L02_BATCH_006_RECOVERY_CONTRACTS_COMPLETE",
  counts: report.counts,
  gates: report.gates,
  report: "logs/sophistication/L02_batch_006_recovery_contracts_report.json"
}, null, 2));
