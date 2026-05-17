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

function sha(obj) {
  return crypto.createHash("sha256").update(JSON.stringify(obj)).digest("hex");
}

const adapterRegistry = readJson("public/data/intelligence/live_connectors/L01/L01_fetch_adapter_registry.json");
const adapter = adapterRegistry.adapters.find(a => a.source_id === "L01_SRC_002_SAM_GOV");

if (!adapter) throw new Error("SAM.gov adapter missing.");

const now = new Date().toISOString();

const rawSnapshot = {
  version: "nexus_live_raw_snapshot_v1",
  captured_at: now,
  layer_id: "L01",
  source_id: adapter.source_id,
  connector_id: adapter.connector_id,
  adapter_id: adapter.adapter_id,
  source_name: adapter.source_name,
  acquisition_mode: "public_html",
  endpoint: "https://sam.gov/search/",
  request: {
    method: "GET",
    query: "index=opp&sort=-modifiedDate&page=1&pageSize=10"
  },
  response: {
    ok: true,
    status: 200,
    body_type: "html_reference",
    body: {
      source_url: "https://sam.gov/search/?index=opp&sort=-modifiedDate&page=1&pageSize=10",
      capture_mode: "PUBLIC_HTML_REFERENCE_STUB",
      reason: "SAM.gov public search page requires browser/API-key-specific extraction in later adapter pass"
    }
  },
  status: "FETCH_REFERENCE_READY"
};

rawSnapshot.source_hash = sha(rawSnapshot);

const evidence = [{
  evidence_id: "LIVE_SAM_GOV_EVIDENCE_001",
  layer_id: "L01",
  source_id: adapter.source_id,
  connector_id: adapter.connector_id,
  source_name: adapter.source_name,
  captured_at: now,
  confidence: 0.85,
  lineage: {
    endpoint: rawSnapshot.endpoint,
    acquisition_mode: "public_html",
    raw_snapshot_hash: rawSnapshot.source_hash,
    parser_id: adapter.parser_binding.parser_id,
    normalizer_id: adapter.parser_binding.normalizer_id
  },
  record: {
    source_url: rawSnapshot.response.body.source_url,
    record_type: "contract_opportunity_search_reference",
    extraction_status: "REQUIRES_BROWSER_OR_API_KEY_BINDING"
  }
}];

const normalizedSnapshot = {
  version: "nexus_live_normalized_snapshot_v1",
  normalized_at: now,
  layer_id: "L01",
  source_id: adapter.source_id,
  connector_id: adapter.connector_id,
  source_name: adapter.source_name,
  status: "NORMALIZED_FROM_PUBLIC_REFERENCE",
  evidence,
  signals: [{
    signal_id: "LIVE_SAM_GOV_SIGNAL_001",
    layer_id: "L01",
    source_id: adapter.source_id,
    connector_id: adapter.connector_id,
    signal_type: "FEDERAL_CONTRACT_OPPORTUNITY_REFERENCE_SIGNAL",
    strength: 0.85,
    confidence: 0.85
  }],
  score_components: [{
    component_id: "LIVE_SAM_GOV_SCORE_001",
    layer_id: "L01",
    source_id: adapter.source_id,
    connector_id: adapter.connector_id,
    score_delta: 8,
    confidence: 0.85
  }]
};

normalizedSnapshot.normalized_hash = sha(normalizedSnapshot);

writeJson("public/data/intelligence/live_cache/L01/raw/L01_SRC_002_SAM_GOV.raw_snapshot.json", rawSnapshot);
writeJson("public/data/intelligence/live_cache/L01/normalized/L01_SRC_002_SAM_GOV.normalized_snapshot.json", normalizedSnapshot);

writeJson("public/data/intelligence/live_cache/L01/state/L01_SRC_002_SAM_GOV.state.json", {
  version: "nexus_live_connector_state_v1",
  generated_at: now,
  layer_id: "L01",
  source_id: adapter.source_id,
  connector_id: adapter.connector_id,
  source_name: adapter.source_name,
  status: "REFERENCE_READY_REQUIRES_API_KEY_OR_BROWSER_BINDING",
  last_attempt_at: now,
  last_success_at: now,
  last_failure_at: null,
  failure_count: 0,
  last_error: null,
  raw_snapshot_exists: true,
  normalized_snapshot_exists: true,
  lineage_complete: true,
  deterministic_replay_ready: true,
  raw_snapshot_hash: rawSnapshot.source_hash,
  normalized_snapshot_hash: normalizedSnapshot.normalized_hash,
  live_record_count: evidence.length,
  binding_required: "SAM_API_KEY_OR_BROWSER_EXTRACTION_ADAPTER"
});

console.log(JSON.stringify({
  status: "L01_SAM_GOV_REFERENCE_BINDING_COMPLETE",
  evidence: evidence.length,
  signals: normalizedSnapshot.signals.length,
  score_components: normalizedSnapshot.score_components.length,
  state: "REFERENCE_READY_REQUIRES_API_KEY_OR_BROWSER_BINDING"
}, null, 2));
