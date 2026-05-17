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
  const source_id = "L01_SRC_009_FEDERAL_REGISTER";
  const statePath = `public/data/intelligence/live_cache/L01/state/${source_id}.state.json`;
  const state = readJson(statePath);

  const now = new Date().toISOString();

  const endpoint =
    "https://www.federalregister.gov/api/v1/documents.json?per_page=10&order=newest&conditions%5Bterm%5D=public%20safety%20law%20enforcement%20grant";

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
      purpose: "federal_register_public_safety_rulemaking_search"
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

    const body = await response.json();

    rawSnapshot.response = {
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      body_type: "json",
      body
    };

    rawSnapshot.status = response.ok ? "FETCH_SUCCESS" : "FETCH_FAILED";
  } catch (error) {
    rawSnapshot.response = {
      ok: false,
      error_name: error.name,
      error_message: error.message
    };
    rawSnapshot.status = "FETCH_EXCEPTION";
  }

  rawSnapshot.source_hash = sha(rawSnapshot);

  const results = rawSnapshot.response?.body?.results || [];

  const evidence = results.map((item, index) => ({
    evidence_id: `LIVE_FEDERAL_REGISTER_EVIDENCE_${String(index + 1).padStart(3, "0")}`,
    layer_id: "L01",
    source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    captured_at: now,
    confidence: rawSnapshot.status === "FETCH_SUCCESS" ? 0.95 : 0.6,
    lineage: {
      endpoint,
      acquisition_mode: "public_api",
      raw_snapshot_hash: rawSnapshot.source_hash,
      parser_id: "FEDERAL_REGISTER_API_PARSER_V1",
      normalizer_id: "L01_FEDERAL_NORMALIZER_V1"
    },
    record: {
      document_number: item.document_number || null,
      title: item.title || null,
      type: item.type || null,
      agency_names: item.agencies ? item.agencies.map(a => a.name) : [],
      publication_date: item.publication_date || null,
      html_url: item.html_url || null,
      pdf_url: item.pdf_url || null,
      abstract: item.abstract || null
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
      signal_id: `LIVE_FEDERAL_REGISTER_SIGNAL_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id,
      connector_id: state.connector_id,
      signal_type: "FEDERAL_RULEMAKING_LIVE_SIGNAL",
      strength: 0.95,
      confidence: e.confidence
    })),
    score_components: evidence.map((e, index) => ({
      component_id: `LIVE_FEDERAL_REGISTER_SCORE_${String(index + 1).padStart(3, "0")}`,
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
    status: "L01_FEDERAL_REGISTER_LIVE_FETCH_COMPLETE",
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
