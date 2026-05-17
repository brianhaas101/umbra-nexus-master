import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");
const taxonomyPath = path.join(l02, "schemas", "failure_taxonomy.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

const taxonomy = readJson(taxonomyPath);
const allowed = new Set(taxonomy.failure_classes);

export function classifyFailure(event) {

  if (!event || typeof event !== "object") {
    return Object.freeze({
      failure_class: "runtime_failure",
      defer: true,
      promote: false,
      reason: "invalid_failure_event",
      client_paths_touched: false
    });
  }

  if (event.status === "FETCH_ERROR") {
    return Object.freeze({
      failure_class: "fetch_error",
      defer: true,
      promote: false,
      reason: event.error || "fetch_error",
      client_paths_touched: false
    });
  }

  if (typeof event.status === "number" && event.status >= 400) {
    return Object.freeze({
      failure_class: "http_error",
      defer: true,
      promote: false,
      reason: `http_${event.status}`,
      client_paths_touched: false
    });
  }

  const sample = String(event.sample || event.text || "").toLowerCase();

  if (
    sample.includes("captcha") ||
    sample.includes("access denied") ||
    sample.includes("forbidden") ||
    sample.includes("incapsula") ||
    sample.includes("akamai") ||
    sample.includes("just a moment")
  ) {
    return Object.freeze({
      failure_class: "blocked_or_challenge_page",
      defer: true,
      promote: false,
      reason: "challenge_or_block_page_detected",
      client_paths_touched: false
    });
  }

  if ((event.payload_length || 0) < 1000) {
    return Object.freeze({
      failure_class: "payload_too_small",
      defer: true,
      promote: false,
      reason: "payload_below_minimum",
      client_paths_touched: false
    });
  }

  if (event.identity_markers_present === false) {
    return Object.freeze({
      failure_class: "identity_markers_missing",
      defer: true,
      promote: false,
      reason: "state_identity_markers_missing",
      client_paths_touched: false
    });
  }

  if (event.category_signals_present === false) {
    return Object.freeze({
      failure_class: "category_signals_missing",
      defer: true,
      promote: false,
      reason: "category_signals_missing",
      client_paths_touched: false
    });
  }

  return Object.freeze({
    failure_class: "runtime_failure",
    defer: true,
    promote: false,
    reason: event.reason || "unclassified_failure",
    client_paths_touched: false
  });
}

const tests = [
  classifyFailure({ status: "FETCH_ERROR", error: "fetch failed" }),
  classifyFailure({ status: 403 }),
  classifyFailure({ status: 200, payload_length: 212, sample: "Incapsula resource" }),
  classifyFailure({ status: 200, payload_length: 12 }),
  classifyFailure({ status: 200, payload_length: 2000, identity_markers_present: false }),
  classifyFailure({ status: 200, payload_length: 2000, category_signals_present: false })
];

for (const t of tests) {
  if (t.promote !== false) throw new Error("Failure taxonomy promoted failed target.");
  if (t.defer !== true) throw new Error("Failure taxonomy defer failed.");
  if (!allowed.has(t.failure_class)) throw new Error(`Unknown failure class: ${t.failure_class}`);
  if (!t.reason) throw new Error("Failure reason missing.");
}

console.log("L02_FAILURE_TAXONOMY_RUNTIME_PASS");