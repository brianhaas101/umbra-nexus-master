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

function extractLinks(html, pattern) {
  const links = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  let match;

  while ((match = re.exec(html)) !== null) {
    const href = match[1];
    const label = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    if (pattern.test(label + " " + href)) {
      links.push({ href, label });
    }
  }

  return links.slice(0, 10);
}

async function fetchAndNormalize(config) {
  const statePath = `public/data/intelligence/live_cache/L01/state/${config.source_id}.state.json`;
  const state = readJson(statePath);

  const now = new Date().toISOString();

  const rawSnapshot = {
    version: "nexus_live_raw_snapshot_v1",
    captured_at: now,
    layer_id: "L01",
    source_id: config.source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    acquisition_mode: "public_html_deep_reference",
    endpoint: config.endpoint,
    request: {
      method: "GET",
      purpose: config.purpose
    },
    response: null,
    status: "PENDING"
  };

  try {
    const response = await fetch(config.endpoint, {
      method: "GET",
      headers: {
        "User-Agent": "UmbraNexus/1.0 public-data-research",
        "Accept": "text/html,*/*"
      }
    });

    const html = await response.text();
    const links = extractLinks(html, config.pattern);

    rawSnapshot.response = {
      ok: response.ok,
      status: response.status,
      status_text: response.statusText,
      body_type: "html",
      html_length: html.length,
      extracted_links: links
    };

    rawSnapshot.status = response.ok && links.length > 0 ? "FETCH_SUCCESS" : "FETCH_EMPTY_OR_FAILED";
  } catch (error) {
    rawSnapshot.response = {
      ok: false,
      error_name: error.name,
      error_message: error.message
    };
    rawSnapshot.status = "FETCH_EXCEPTION";
  }

  rawSnapshot.source_hash = sha(rawSnapshot);

  const links = rawSnapshot.response?.extracted_links || [];
  const liveSuccess = rawSnapshot.status === "FETCH_SUCCESS" && links.length > 0;

  const evidence = liveSuccess ? links.map((item, index) => ({
    evidence_id: `${config.evidence_prefix}_${String(index + 1).padStart(3, "0")}`,
    layer_id: "L01",
    source_id: config.source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    captured_at: now,
    confidence: config.confidence,
    lineage: {
      endpoint: config.endpoint,
      acquisition_mode: "public_html_deep_reference",
      raw_snapshot_hash: rawSnapshot.source_hash,
      parser_id: config.parser_id,
      normalizer_id: "L01_FEDERAL_NORMALIZER_V1"
    },
    record: {
      label: item.label,
      href: item.href,
      record_type: config.record_type
    }
  })) : [];

  const normalizedSnapshot = {
    version: "nexus_live_normalized_snapshot_v1",
    normalized_at: now,
    layer_id: "L01",
    source_id: config.source_id,
    connector_id: state.connector_id,
    source_name: state.source_name,
    status: liveSuccess ? "NORMALIZED_FROM_DEEP_REFERENCE_FETCH" : "NORMALIZED_DEEP_REFERENCE_EMPTY_OR_FAILED",
    evidence,
    signals: evidence.map((e, index) => ({
      signal_id: `${config.signal_prefix}_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id: config.source_id,
      connector_id: state.connector_id,
      signal_type: config.signal_type,
      strength: config.confidence,
      confidence: e.confidence
    })),
    score_components: evidence.map((e, index) => ({
      component_id: `${config.score_prefix}_${String(index + 1).padStart(3, "0")}`,
      layer_id: "L01",
      source_id: config.source_id,
      connector_id: state.connector_id,
      score_delta: config.score_delta,
      confidence: e.confidence
    }))
  };

  normalizedSnapshot.normalized_hash = sha(normalizedSnapshot);

  writeJson(`public/data/intelligence/live_cache/L01/raw/${config.source_id}.raw_snapshot.json`, rawSnapshot);
  writeJson(`public/data/intelligence/live_cache/L01/normalized/${config.source_id}.normalized_snapshot.json`, normalizedSnapshot);

  const nextState = {
    ...state,
    generated_at: now,
    status: liveSuccess ? "DEEP_REFERENCE_FETCH_SUCCESS" : "DEEP_REFERENCE_FETCH_EMPTY_OR_FAILED",
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
    binding_required: liveSuccess ? null : config.binding_required,
    upgraded_from_reference: liveSuccess,
    deep_reference_complete: liveSuccess
  };

  writeJson(statePath, nextState);

  return {
    source_id: config.source_id,
    state: nextState.status,
    evidence: evidence.length,
    signals: normalizedSnapshot.signals.length,
    score_components: normalizedSnapshot.score_components.length,
    success: liveSuccess
  };
}

async function main() {
  const configs = [
    {
      source_id: "L01_SRC_004_DOJ_GRANT_PROGRAMS",
      endpoint: "https://www.justice.gov/grants",
      purpose: "doj_grants_deep_reference_parser_conversion",
      pattern: /grant|funding|program|award|solicitation|opportunity|justice|public safety|law enforcement/i,
      parser_id: "DOJ_GRANT_PAGE_DEEP_LINK_PARSER_V1",
      evidence_prefix: "LIVE_DOJ_GRANT_DEEP_EVIDENCE",
      signal_prefix: "LIVE_DOJ_GRANT_DEEP_SIGNAL",
      score_prefix: "LIVE_DOJ_GRANT_DEEP_SCORE",
      signal_type: "DOJ_GRANT_PROGRAM_DEEP_REFERENCE_SIGNAL",
      record_type: "doj_grant_program_deep_reference",
      confidence: 0.9,
      score_delta: 9,
      binding_required: "DOJ_GRANT_PAGE_PARSER_REVIEW"
    },
    {
      source_id: "L01_SRC_010_BUREAU_OF_JUSTICE_STATISTICS",
      endpoint: "https://bjs.ojp.gov/data",
      purpose: "bjs_dataset_catalog_deep_reference_parser_conversion",
      pattern: /data|dataset|collection|statistics|justice|law enforcement|crime|corrections|police/i,
      parser_id: "BJS_DATASET_CATALOG_DEEP_LINK_PARSER_V1",
      evidence_prefix: "LIVE_BJS_DATASET_DEEP_EVIDENCE",
      signal_prefix: "LIVE_BJS_DATASET_DEEP_SIGNAL",
      score_prefix: "LIVE_BJS_DATASET_DEEP_SCORE",
      signal_type: "BJS_DATASET_DEEP_REFERENCE_SIGNAL",
      record_type: "bjs_dataset_catalog_deep_reference",
      confidence: 0.88,
      score_delta: 8,
      binding_required: "BJS_DATASET_PARSER_REVIEW"
    }
  ];

  const results = [];

  for (const config of configs) {
    results.push(await fetchAndNormalize(config));
  }

  const report = {
    version: "nexus_L01_full_sophistication_batch_002_v1",
    generated_at: new Date().toISOString(),
    layer_id: "L01",
    batch_id: "L01_FULL_SOPHISTICATION_BATCH_002",
    status: results.every(r => r.success) ? "PASS" : "PARTIAL",
    purpose: "Eliminate deep-reference pending for DOJ and BJS through deterministic deep parser conversion.",
    results
  };

  writeJson("logs/sophistication/L01_full_sophistication_batch_002_report.json", report);

  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
