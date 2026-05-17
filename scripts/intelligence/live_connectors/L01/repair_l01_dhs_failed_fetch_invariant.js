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

function sha(obj) {
  return crypto.createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex");
}

const source_id = "L01_SRC_005_DHS_GRANT_PROGRAMS";

const rawPath =
  `public/data/intelligence/live_cache/L01/raw/${source_id}.raw_snapshot.json`;

const normPath =
  `public/data/intelligence/live_cache/L01/normalized/${source_id}.normalized_snapshot.json`;

const statePath =
  `public/data/intelligence/live_cache/L01/state/${source_id}.state.json`;

const raw = readJson(rawPath);
const norm = readJson(normPath);
const state = readJson(statePath);

const fetchSucceeded =
  raw.status === "FETCH_SUCCESS" &&
  raw.response &&
  raw.response.ok === true &&
  raw.response.status === 200;

if (!fetchSucceeded) {

  norm.evidence = [];
  norm.signals = [];
  norm.score_components = [];

  norm.status = "NORMALIZED_FETCH_EMPTY_OR_FAILED";

  norm.normalized_hash = sha(norm);

  state.status = "LIVE_FETCH_EMPTY_OR_FAILED";
  state.live_record_count = 0;

  state.normalized_snapshot_hash = norm.normalized_hash;

  state.last_error = {
    invariant_repair: true,
    reason: "FAILED_FETCH_CANNOT_GENERATE_EVIDENCE",
    raw_status: raw.status,
    response_status: raw.response?.status || null
  };

  writeJson(normPath, norm);
  writeJson(statePath, state);

  console.log(JSON.stringify({
    status: "DHS_INVARIANT_REPAIR_COMPLETE",
    evidence: norm.evidence.length,
    signals: norm.signals.length,
    score_components: norm.score_components.length
  }, null, 2));

} else {

  console.log(JSON.stringify({
    status: "NO_REPAIR_REQUIRED"
  }, null, 2));

}
