const fs = require("fs");
const path = require("path");

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

const manifest = readJson(
  "public/data/intelligence/live_connectors/L01/L01_live_ingestion_batch_002.manifest.json"
);

const now = new Date().toISOString();

const adapters = manifest.connectors.map((connector, index) => {

  let expected_format = "json";

  if (connector.base_url.includes("justice.gov")) {
    expected_format = "html";
  }

  if (connector.base_url.includes("dhs.gov")) {
    expected_format = "html";
  }

  if (connector.base_url.includes("grants.gov")) {
    expected_format = "xml";
  }

  return {
    adapter_id: `L01_FETCH_ADAPTER_${String(index + 1).padStart(3, "0")}`,
    connector_id: connector.connector_id,
    source_id: connector.source_id,
    source_name: connector.source_name,

    runtime: {
      enabled: false,
      execution_mode: "deterministic_controlled",
      acquisition_mode: connector.acquisition_mode
    },

    endpoint: {
      base_url: connector.base_url,
      expected_format,
      method: "GET",
      timeout_ms: 15000
    },

    validation: {
      require_status_200: true,
      require_nonempty_body: true,
      require_expected_format: true,
      require_lineage_tracking: true
    },

    parser_binding: {
      parser_id: connector.parser_id,
      normalizer_id: connector.normalizer_id
    },

    runtime_tracking: {
      health_score: 1.0,
      successful_fetches: 0,
      failed_fetches: 0,
      last_runtime_status: "READY"
    },

    audit: {
      deterministic_replay_required: true,
      raw_snapshot_required: true,
      normalized_snapshot_required: true,
      audit_logging_required: true
    }
  };
});

const output = {
  version: "nexus_L01_fetch_adapter_registry_v1",
  generated_at: now,
  layer_id: "L01",
  adapter_count: adapters.length,
  adapters
};

writeJson(
  "public/data/intelligence/live_connectors/L01/L01_fetch_adapter_registry.json",
  output
);

console.log(JSON.stringify({
  status: "L01_FETCH_ADAPTER_REGISTRY_BUILT",
  adapters: adapters.length
}, null, 2));
