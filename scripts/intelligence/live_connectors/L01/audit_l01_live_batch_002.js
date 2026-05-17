const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, "")
  );
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const manifest = readJson(
  "public/data/intelligence/live_connectors/L01/L01_live_ingestion_batch_002.manifest.json"
);

const adapters = readJson(
  "public/data/intelligence/live_connectors/L01/L01_fetch_adapter_registry.json"
);

const ledger = readJson(
  "public/data/intelligence/live_connectors/L01/L01_runtime_execution_ledger.json"
);

const report = {
  version: "nexus_L01_live_batch_002_audit_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L01",
  batch_id: "L01_LIVE_BATCH_002",
  status: "PASS",
  failures: [],
  gates: {
    manifest_5_connectors: manifest.connector_count === 5,
    fetch_adapters_5: adapters.adapter_count === 5,
    execution_ledger_5: ledger.execution_count === 5,
    raw_snapshots_present: true,
    normalized_snapshots_present: true,
    state_files_present: true,
    lineage_complete: true,
    execution_states_valid: true
  },
  counts: {
    manifest_connectors: manifest.connector_count,
    adapters: adapters.adapter_count,
    executions: ledger.execution_count,
    raw_snapshots: 0,
    normalized_snapshots: 0,
    state_files: 0
  },
  source_report: []
};

function fail(code) {
  report.status = "FAIL";
  report.failures.push(code);
}

if (!report.gates.manifest_5_connectors) fail("MANIFEST_CONNECTOR_COUNT_INVALID");
if (!report.gates.fetch_adapters_5) fail("FETCH_ADAPTER_COUNT_INVALID");
if (!report.gates.execution_ledger_5) fail("EXECUTION_LEDGER_COUNT_INVALID");

for (const connector of manifest.connectors) {
  const rawPath = `public/data/intelligence/live_cache/L01/raw/${connector.source_id}.raw_snapshot.json`;
  const normalizedPath = `public/data/intelligence/live_cache/L01/normalized/${connector.source_id}.normalized_snapshot.json`;
  const statePath = `public/data/intelligence/live_cache/L01/state/${connector.source_id}.state.json`;

  const rawExists = exists(rawPath);
  const normalizedExists = exists(normalizedPath);
  const stateExists = exists(statePath);

  if (rawExists) report.counts.raw_snapshots++;
  if (normalizedExists) report.counts.normalized_snapshots++;
  if (stateExists) report.counts.state_files++;

  let state = null;
  if (stateExists) state = readJson(statePath);

  const sourceStatus = {
    source_id: connector.source_id,
    raw_snapshot: rawExists,
    normalized_snapshot: normalizedExists,
    state_file: stateExists,
    lineage_complete: state ? state.lineage_complete === true : false,
    deterministic_replay_ready: state ? state.deterministic_replay_ready === true : false,
    status: state ? state.status : "MISSING_STATE"
  };

  if (!rawExists) fail(`${connector.source_id}_RAW_MISSING`);
  if (!normalizedExists) fail(`${connector.source_id}_NORMALIZED_MISSING`);
  if (!stateExists) fail(`${connector.source_id}_STATE_MISSING`);
  if (state && state.lineage_complete !== true) fail(`${connector.source_id}_LINEAGE_INCOMPLETE`);
  if (state && state.deterministic_replay_ready !== true) fail(`${connector.source_id}_REPLAY_NOT_READY`);

  report.source_report.push(sourceStatus);
}

if (report.counts.raw_snapshots !== 5) {
  report.gates.raw_snapshots_present = false;
  fail("RAW_SNAPSHOT_COUNT_INVALID");
}

if (report.counts.normalized_snapshots !== 5) {
  report.gates.normalized_snapshots_present = false;
  fail("NORMALIZED_SNAPSHOT_COUNT_INVALID");
}

if (report.counts.state_files !== 5) {
  report.gates.state_files_present = false;
  fail("STATE_FILE_COUNT_INVALID");
}

for (const execution of ledger.executions) {
  if (execution.execution_state !== "READY_FOR_LIVE_FETCH") {
    report.gates.execution_states_valid = false;
    fail(`${execution.source_id}_EXECUTION_STATE_INVALID`);
  }
}

fs.mkdirSync(path.join(ROOT, "logs/sophistication"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "logs/sophistication/L01_live_batch_002_audit.json"),
  JSON.stringify(report, null, 2),
  "utf8"
);

console.log(JSON.stringify(report, null, 2));
