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
  const source_id = "L01_SRC_006_FBI_PUBLIC_DATA";
  const statePath = `public/data/intelligence/live_cache/L01/state/${source_id}.state.json`;
  const state = readJson(statePath);

  const now = new Date().toISOString();
  const endpoint = "https://api.usa.gov/crime/fbi/cde/arrest/agencies?API_KEY=DEMO_KEY";

  const rawSnapshot = {
    version: "nexus_live_raw_snapshot_v1",
    captured_at: now,
    layer_id: "L01",
    source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    acquisition_mode: "public_api",
    endpoint,
    request: {
      method: "GET",
      purpose: "fbi_crime_data_api_agency_arrest_reference_fetch"
    },
    response: null,
    status: "PENDING"
  };

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "User-Agent": "UmbraNexus/1.0 public-data-research",
        "Accept": "application/json"
      }
    });

    const text = await response.text();

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = {
        parse_error: true,
        raw_text_preview: text.slice(0, 1000)
      };
    }

    rawSnapshot.response = {
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      body_type: body && !body.parse_error ? "json" : "non_json",
      body
    };

    rawSnapshot.status = response.ok && !body.parse_error ? "FETCH_SUCCESS" : "FETCH_FAILED";
  } catch (error) {
    rawSnapshot.response = {
      ok: false,
      error_name: error.name,
      error_message: error.message
    };
    rawSnapshot.status = "FETCH_EXCEPTION";
  }

  rawSnapshot.source_hash = sha(rawSnapshot);

  const body = rawSnapshot.response?.body || {};
  const rows =
    Array.isArray(body.results) ? body.results.slice(0, 10) :
    Array.isArray(body.data) ? body.data.slice(0, 10) :
    Array.isArray(body) ? body.slice(0, 10) :
    [];

  const evidence = rows.map((item, index) => ({
    evidence_id: `LIVE_FBI_PUBLIC_DATA_EVIDENCE_${String(index + 1).padStart(3, "0")}`,
    layer_id: "L01",
    source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    captured_at: now,
    confidence: rawSnapshot.status === "FETCH_SUCCESS" ? 0.94 : 0.6,
    lineage: {
      endpoint,
      acquisition_mode: "public_api",
      raw_snapshot_hash: rawSnapshot.source_hash,
      parser_id: "FBI_CRIME_DATA_API_PARSER_V1",
      normalizer_id: "L01_FEDERAL_NORMALIZER_V1"
    },
    record: item
  }));

  const liveSuccess = rawSnapshot.status === "FETCH_SUCCESS" && evidence.length > 0;

  const normalizedSnapshot = {
    version: "nexus_live_normalized_snapshot_v1",
    normalized_at: now,
    layer_id: "L01",
    source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    status: liveSuccess ? "NORMALIZED_FROM_LIVE_FETCH" : "NORMALIZED_FETCH_EMPTY_OR_FAILED",
    evidence,
    signals: evidence.map((e, index) => ({
      signal_id: `LIVE_FBI_PUBLIC_DATA_SIGNAL_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id,
      connector_id: state.connector_id,
      signal_type: "FEDERAL_FBI_PUBLIC_DATA_LIVE_SIGNAL",
      strength: 0.94,
      confidence: e.confidence
    })),
    score_components: evidence.map((e, index) => ({
      component_id: `LIVE_FBI_PUBLIC_DATA_SCORE_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id,
      connector_id: state.connector_id,
      score_delta: 9,
      confidence: e.confidence
    }))
  };

  normalizedSnapshot.normalized_hash = sha(normalizedSnapshot);

  writeJson(`public/data/intelligence/live_cache/L01/raw/${source_id}.raw_snapshot.json`, rawSnapshot);
  writeJson(`public/data/intelligence/live_cache/L01/normalized/${source_id}.normalized_snapshot.json`, normalizedSnapshot);

  const nextState = {
    ...state,
    generated_at: now,
    status: liveSuccess ? "LIVE_FETCH_SUCCESS" : "LIVE_FETCH_EMPTY_OR_FAILED",
    last_attempt_at: now,
    last_success_at: liveSuccess ? now : state.last_success_at,
    last_failure_at: liveSuccess ? null : now,
    failure_count: liveSuccess ? 0 : (state.failure_count || 0) + 1,
    last_error: liveSuccess ? null : {
      raw_status: rawSnapshot.status,
      response_status: rawSnapshot.response?.status || null,
      evidence_count: evidence.length
    },
    raw_snapshot_exists: true,
    normalized_snapshot_exists: true,
    lineage_complete: true,
    deterministic_replay_ready: true,
    raw_snapshot_hash: rawSnapshot.source_hash,
    normalized_snapshot_hash: normalizedSnapshot.normalized_hash,
    live_record_count: evidence.length,
    binding_required: liveSuccess ? null : "FBI_CRIME_DATA_QUERY_OR_API_KEY_REVIEW",
    upgraded_from_reference: liveSuccess
  };

  writeJson(statePath, nextState);

  console.log(JSON.stringify({
    status: "L01_FBI_PUBLIC_DATA_LIVE_FETCH_COMPLETE",
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
