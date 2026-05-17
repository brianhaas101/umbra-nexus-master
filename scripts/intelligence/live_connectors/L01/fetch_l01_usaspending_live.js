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
  const adapterRegistry = readJson("public/data/intelligence/live_connectors/L01/L01_fetch_adapter_registry.json");

  const adapter = adapterRegistry.adapters.find(a => a.source_id === "L01_SRC_001_USA_SPENDING");

  if (!adapter) {
    throw new Error("USAspending adapter missing.");
  }

  const now = new Date().toISOString();

  const endpoint = "https://api.usaspending.gov/api/v2/search/spending_by_award/";

  const payload = {
    filters: {
      award_type_codes: ["02", "03", "04", "05"],
      time_period: [
        {
          start_date: "2025-01-01",
          end_date: "2026-05-08"
        }
      ],
      agencies: [
        {
          type: "awarding",
          tier: "toptier",
          name: "Department of Justice"
        },
        {
          type: "awarding",
          tier: "toptier",
          name: "Department of Homeland Security"
        }
      ]
    },
    fields: [
      "Award ID",
      "Recipient Name",
      "Start Date",
      "End Date",
      "Award Amount",
      "Awarding Agency",
      "Awarding Sub Agency",
      "Award Type",
      "Description"
    ],
    page: 1,
    limit: 10,
    sort: "Award Amount",
    order: "desc"
  };

  const rawSnapshot = {
    version: "nexus_live_raw_snapshot_v1",
    captured_at: now,
    layer_id: "L01",
    source_id: adapter.source_id,
    connector_id: adapter.connector_id,
    adapter_id: adapter.adapter_id,
    source_name: adapter.source_name,
    acquisition_mode: "public_api",
    endpoint,
    request: {
      method: "POST",
      payload
    },
    response: null,
    status: "PENDING"
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "UmbraNexus/1.0 public-data-research"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        parse_error: true,
        raw_text_preview: text.slice(0, 500)
      };
    }

    rawSnapshot.response = {
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      body_type: parsed && !parsed.parse_error ? "json" : "non_json",
      body: parsed
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
    evidence_id: `LIVE_USASPENDING_EVIDENCE_${String(index + 1).padStart(3, "0")}`,
    layer_id: "L01",
    source_id: adapter.source_id,
    connector_id: adapter.connector_id,
    source_name: adapter.source_name,
    captured_at: now,
    confidence: rawSnapshot.status === "FETCH_SUCCESS" ? 0.98 : 0.6,
    lineage: {
      endpoint,
      acquisition_mode: "public_api",
      raw_snapshot_hash: rawSnapshot.source_hash,
      parser_id: adapter.parser_binding.parser_id,
      normalizer_id: adapter.parser_binding.normalizer_id
    },
    record: item
  }));

  const normalizedSnapshot = {
    version: "nexus_live_normalized_snapshot_v1",
    normalized_at: now,
    layer_id: "L01",
    source_id: adapter.source_id,
    connector_id: adapter.connector_id,
    source_name: adapter.source_name,
    status: rawSnapshot.status === "FETCH_SUCCESS" ? "NORMALIZED_FROM_LIVE_FETCH" : "NORMALIZED_FETCH_FAILED",
    evidence,
    signals: evidence.map((e, index) => ({
      signal_id: `LIVE_USASPENDING_SIGNAL_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id: adapter.source_id,
      connector_id: adapter.connector_id,
      signal_type: "FEDERAL_SPENDING_AWARD_SIGNAL",
      strength: 0.98,
      confidence: e.confidence
    })),
    score_components: evidence.map((e, index) => ({
      component_id: `LIVE_USASPENDING_SCORE_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id: adapter.source_id,
      connector_id: adapter.connector_id,
      score_delta: 10,
      confidence: e.confidence
    }))
  };

  normalizedSnapshot.normalized_hash = sha(normalizedSnapshot);

  writeJson("public/data/intelligence/live_cache/L01/raw/L01_SRC_001_USA_SPENDING.raw_snapshot.json", rawSnapshot);
  writeJson("public/data/intelligence/live_cache/L01/normalized/L01_SRC_001_USA_SPENDING.normalized_snapshot.json", normalizedSnapshot);

  const state = {
    version: "nexus_live_connector_state_v1",
    generated_at: now,
    layer_id: "L01",
    source_id: adapter.source_id,
    connector_id: adapter.connector_id,
    source_name: adapter.source_name,
    status: rawSnapshot.status === "FETCH_SUCCESS" ? "LIVE_FETCH_SUCCESS" : "LIVE_FETCH_FAILED",
    last_attempt_at: now,
    last_success_at: rawSnapshot.status === "FETCH_SUCCESS" ? now : null,
    last_failure_at: rawSnapshot.status === "FETCH_SUCCESS" ? null : now,
    failure_count: rawSnapshot.status === "FETCH_SUCCESS" ? 0 : 1,
    last_error: rawSnapshot.status === "FETCH_SUCCESS" ? null : rawSnapshot.response,
    raw_snapshot_exists: true,
    normalized_snapshot_exists: true,
    lineage_complete: true,
    deterministic_replay_ready: true,
    raw_snapshot_hash: rawSnapshot.source_hash,
    normalized_snapshot_hash: normalizedSnapshot.normalized_hash,
    live_record_count: evidence.length
  };

  writeJson("public/data/intelligence/live_cache/L01/state/L01_SRC_001_USA_SPENDING.state.json", state);

  console.log(JSON.stringify({
    status: "L01_USASPENDING_LIVE_FETCH_COMPLETE",
    fetch_status: rawSnapshot.status,
    http_status: rawSnapshot.response?.status || null,
    evidence: evidence.length,
    signals: normalizedSnapshot.signals.length,
    score_components: normalizedSnapshot.score_components.length,
    state: state.status
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
