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

const registry = readJson("public/data/intelligence/live_connectors/L01_federal_live_connector.registry.json");

const selectedSourceIds = [
  "L01_SRC_006_FBI_PUBLIC_DATA",
  "L01_SRC_007_DEA_PUBLIC_RELEASES",
  "L01_SRC_008_FEMA_PREPAREDNESS_GRANTS",
  "L01_SRC_009_FEDERAL_REGISTER",
  "L01_SRC_010_BUREAU_OF_JUSTICE_STATISTICS"
];

const selected = registry.connectors.filter(c => selectedSourceIds.includes(c.source_id));

if (selected.length !== 5) {
  throw new Error(`Expected 5 L01 batch 002 connectors, found ${selected.length}`);
}

const now = new Date().toISOString();

const manifest = {
  version: "nexus_L01_live_sophistication_batch_002_manifest_v1",
  generated_at: now,
  layer_id: "L01",
  batch_id: "L01_LIVE_SOPHISTICATION_BATCH_002",
  batch_name: "Federal enforcement, preparedness, rulemaking, and justice statistics spine",
  connector_count: selected.length,
  execution_mode: "deterministic_live_ready",
  connectors: selected.map((connector, index) => ({
    execution_id: `L01_BATCH_002B_EXEC_${String(index + 1).padStart(3, "0")}`,
    connector_id: connector.connector_id,
    source_id: connector.source_id,
    source_name: connector.source_name,
    acquisition_mode: connector.acquisition_mode,
    base_url: connector.base_url,
    status: connector.status,
    parser_id: connector.parser_id,
    normalizer_id: connector.normalizer_id,
    cache_paths: {
      raw: `public/data/intelligence/live_cache/L01/raw/${connector.source_id}.raw_snapshot.json`,
      normalized: `public/data/intelligence/live_cache/L01/normalized/${connector.source_id}.normalized_snapshot.json`,
      state: `public/data/intelligence/live_cache/L01/state/${connector.source_id}.state.json`
    },
    lineage_required: true,
    deterministic_replay_required: true
  }))
};

writeJson(
  "public/data/intelligence/live_connectors/L01/L01_live_sophistication_batch_002.manifest.json",
  manifest
);

for (const connector of selected) {
  writeJson(
    `public/data/intelligence/live_cache/L01/state/${connector.source_id}.state.json`,
    {
      version: "nexus_live_connector_state_v1",
      generated_at: now,
      layer_id: "L01",
      source_id: connector.source_id,
      connector_id: connector.connector_id,
      source_name: connector.source_name,
      status: "READY_FOR_REFERENCE_OR_FETCH_BINDING",
      last_attempt_at: null,
      last_success_at: null,
      last_failure_at: null,
      failure_count: 0,
      last_error: null,
      raw_snapshot_exists: false,
      normalized_snapshot_exists: false,
      lineage_complete: false,
      deterministic_replay_ready: false
    }
  );
}

console.log(JSON.stringify({
  status: "L01_LIVE_SOPHISTICATION_BATCH_002_MANIFEST_BUILT",
  batch_id: manifest.batch_id,
  connectors: selected.length,
  sources: selected.map(s => s.source_id)
}, null, 2));
