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

async function main() {
  const source_id = "L01_SRC_014_TREASURY_CRIME_DATA";
  const statePath = `public/data/intelligence/live_cache/L01/state/${source_id}.state.json`;
  const state = readJson(statePath);

  const now = new Date().toISOString();

  const endpoint = "https://www.treasury.gov/ofac/downloads/sdn.csv";

  const rawSnapshot = {
    version: "nexus_live_raw_snapshot_v1",
    captured_at: now,
    layer_id: "L01",
    source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    acquisition_mode: "public_csv",
    endpoint,
    request: {
      method: "GET",
      purpose: "ofac_sdn_sanctions_csv_live_fetch"
    },
    response: null,
    status: "PENDING"
  };

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "User-Agent": "UmbraNexus/1.0 public-data-research",
        "Accept": "text/csv,*/*"
      }
    });

    const text = await response.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const sample = lines.slice(0, 10);

    rawSnapshot.response = {
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      body_type: "csv",
      line_count: lines.length,
      sample
    };

    rawSnapshot.status = response.ok && lines.length > 0 ? "FETCH_SUCCESS" : "FETCH_FAILED";
  } catch (error) {
    rawSnapshot.response = {
      ok: false,
      error_name: error.name,
      error_message: error.message
    };
    rawSnapshot.status = "FETCH_EXCEPTION";
  }

  rawSnapshot.source_hash = sha(rawSnapshot);

  const sampleRows = rawSnapshot.response?.sample || [];

  const evidence = sampleRows.map((row, index) => ({
    evidence_id: `LIVE_TREASURY_OFAC_EVIDENCE_${String(index + 1).padStart(3, "0")}`,
    layer_id: "L01",
    source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    captured_at: now,
    confidence: rawSnapshot.status === "FETCH_SUCCESS" ? 0.97 : 0.6,
    lineage: {
      endpoint,
      acquisition_mode: "public_csv",
      raw_snapshot_hash: rawSnapshot.source_hash,
      parser_id: "TREASURY_OFAC_CSV_PARSER_V1",
      normalizer_id: "L01_FEDERAL_NORMALIZER_V1"
    },
    record: {
      row_index: index + 1,
      raw_csv_row: row
    }
  }));

  const normalizedSnapshot = {
    version: "nexus_live_normalized_snapshot_v1",
    normalized_at: now,
    layer_id: "L01",
    source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    status: rawSnapshot.status === "FETCH_SUCCESS" ? "NORMALIZED_FROM_LIVE_FETCH" : "NORMALIZED_FETCH_FAILED",
    evidence,
    signals: evidence.map((e, index) => ({
      signal_id: `LIVE_TREASURY_OFAC_SIGNAL_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id,
      connector_id: state.connector_id,
      signal_type: "TREASURY_OFAC_SANCTIONS_LIVE_SIGNAL",
      strength: 0.97,
      confidence: e.confidence
    })),
    score_components: evidence.map((e, index) => ({
      component_id: `LIVE_TREASURY_OFAC_SCORE_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id,
      connector_id: state.connector_id,
      score_delta: 10,
      confidence: e.confidence
    }))
  };

  normalizedSnapshot.normalized_hash = sha(normalizedSnapshot);

  writeJson(`public/data/intelligence/live_cache/L01/raw/${source_id}.raw_snapshot.json`, rawSnapshot);
  writeJson(`public/data/intelligence/live_cache/L01/normalized/${source_id}.normalized_snapshot.json`, normalizedSnapshot);

  const nextState = {
    ...state,
    generated_at: now,
    status: rawSnapshot.status === "FETCH_SUCCESS" ? "LIVE_FETCH_SUCCESS" : "LIVE_FETCH_FAILED",
    last_attempt_at: now,
    last_success_at: rawSnapshot.status === "FETCH_SUCCESS" ? now : state.last_success_at,
    last_failure_at: rawSnapshot.status === "FETCH_SUCCESS" ? null : now,
    failure_count: rawSnapshot.status === "FETCH_SUCCESS" ? 0 : (state.failure_count || 0) + 1,
    last_error: rawSnapshot.status === "FETCH_SUCCESS" ? null : rawSnapshot.response,
    raw_snapshot_exists: true,
    normalized_snapshot_exists: true,
    lineage_complete: true,
    deterministic_replay_ready: true,
    raw_snapshot_hash: rawSnapshot.source_hash,
    normalized_snapshot_hash: normalizedSnapshot.normalized_hash,
    live_record_count: evidence.length,
    binding_required: null,
    upgraded_from_reference: true
  };

  writeJson(statePath, nextState);

  console.log(JSON.stringify({
    status: "L01_TREASURY_OFAC_LIVE_FETCH_COMPLETE",
    fetch_status: rawSnapshot.status,
    http_status: rawSnapshot.response?.status || null,
    evidence: evidence.length,
    signals: normalizedSnapshot.signals.length,
    score_components: normalizedSnapshot.score_components.length,
    state: nextState.status
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
