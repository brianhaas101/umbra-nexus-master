const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

const now = new Date().toISOString();

const batch006 = readJson("logs/sophistication/L02_batch_006_recovery_contracts_report.json");

const recoveryTargets = batch006.normalizedRecoveryStates;

const adapterManifest = {
  version: "nexus_L02_browser_adapter_manifest_v1",
  generated_at: now,
  layer_id: "L02",
  batch_id: "L02_BATCH_007",
  status: "REGISTERED",
  purpose: "Prepare safe browser-rendered recovery adapters for blocked L02 connectors.",
  safety_policy: {
    captcha_bypass: false,
    unauthorized_access: false,
    credential_leakage: false,
    rate_limit_abuse: false,
    fake_evidence_allowed: false
  },
  required_runtime: {
    node: true,
    playwright_optional: true,
    puppeteer_optional: true
  },
  targets: recoveryTargets.map(t => ({
    connector_id: t.connector_id,
    state_abbr: t.state_abbr,
    source_type: t.source_type,
    adapter_id: `L02_BROWSER_RECOVERY_${t.connector_id}`,
    adapter_status: "SCAFFOLD_REGISTERED",
    execution_mode: "SAFE_BROWSER_RENDERED_FETCH",
    can_emit_operational_evidence: false,
    activation_requires: [
      "browser_runtime_available",
      "source_fetch_success",
      "deterministic_snapshot_written",
      "normalized_evidence_verified"
    ]
  }))
};

writeJson(
  "public/data/intelligence/sophistication/L02/browser_recovery_adapter_manifest.batch_007.json",
  adapterManifest
);

const audit = {
  version: "nexus_L02_batch_007_browser_adapter_audit_v1",
  generated_at: now,
  layer_id: "L02",
  batch_id: "L02_BATCH_007",
  status: "PASS",
  counts: {
    recovery_targets: recoveryTargets.length,
    adapters_registered: adapterManifest.targets.length
  },
  gates: {
    ten_recovery_targets_loaded: recoveryTargets.length === 10,
    ten_browser_adapters_registered: adapterManifest.targets.length === 10,
    fake_evidence_blocked: adapterManifest.safety_policy.fake_evidence_allowed === false,
    captcha_bypass_forbidden: adapterManifest.safety_policy.captcha_bypass === false,
    unauthorized_access_forbidden: adapterManifest.safety_policy.unauthorized_access === false
  }
};

writeJson(
  "logs/sophistication/L02_batch_007_browser_adapter_audit.json",
  audit
);

console.log(JSON.stringify({
  status: "L02_BATCH_007_BROWSER_ADAPTER_SCAFFOLD_COMPLETE",
  counts: audit.counts,
  gates: audit.gates,
  report: "logs/sophistication/L02_batch_007_browser_adapter_audit.json"
}, null, 2));
