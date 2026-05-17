const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = process.cwd();

function readJson(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8").replace(/^\uFEFF/, "")
  );
}

function writeJson(rel, data) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf8");
}

function sha(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

const adapters = readJson(
  "public/data/intelligence/live_connectors/L01/L01_fetch_adapter_registry.json"
);

const now = new Date().toISOString();

const executions = [];

for (const adapter of adapters.adapters) {

  const execution = {
    execution_id: `EXEC_${adapter.source_id}_${Date.now()}`,

    layer_id: "L01",

    source_id: adapter.source_id,

    adapter_id: adapter.adapter_id,

    execution_state: "READY_FOR_LIVE_FETCH",

    execution_mode: adapter.runtime.execution_mode,

    runtime_status: adapter.runtime_tracking.last_runtime_status,

    fetch_metadata: {
      method: adapter.endpoint.method,
      base_url: adapter.endpoint.base_url,
      expected_format: adapter.endpoint.expected_format,
      timeout_ms: adapter.endpoint.timeout_ms
    },

    validation_rules: adapter.validation,

    audit_requirements: adapter.audit,

    execution_timestamps: {
      created_at: now,
      started_at: null,
      completed_at: null
    },

    lineage: {
      parser_id: adapter.parser_binding.parser_id,
      normalizer_id: adapter.parser_binding.normalizer_id
    }
  };

  execution.execution_hash =
    sha(JSON.stringify(execution));

  executions.push(execution);
}

const ledger = {
  version: "nexus_L01_runtime_execution_ledger_v1",
  generated_at: now,
  layer_id: "L01",
  execution_count: executions.length,
  executions
};

writeJson(
  "public/data/intelligence/live_connectors/L01/L01_runtime_execution_ledger.json",
  ledger
);

console.log(JSON.stringify({
  status: "L01_RUNTIME_EXECUTION_LEDGER_BUILT",
  executions: executions.length
}, null, 2));
