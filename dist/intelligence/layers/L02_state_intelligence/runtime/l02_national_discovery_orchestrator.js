import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");
const matrixPath = path.join(l02, "schemas", "state_coverage_matrix.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const matrix = readJson(matrixPath);

assert(matrix.total_targets_created === 750, "Matrix must contain 750 targets.");
assert(matrix.states_required === 50, "Matrix must require 50 states.");
assert(matrix.categories_required_per_state === 15, "Matrix must require 15 categories.");

export function selectDiscoveryBatch({ state_codes = [], categories = [], limit = 3 } = {}) {
  let targets = matrix.targets;

  if (state_codes.length > 0) {
    const allowed = new Set(state_codes);
    targets = targets.filter(t => allowed.has(t.state_code));
  }

  if (categories.length > 0) {
    const allowed = new Set(categories);
    targets = targets.filter(t => allowed.has(t.category));
  }

  return Object.freeze(targets.slice(0, limit).map(t => Object.freeze({
    ...t,
    promoted: false,
    registry_mutation: false,
    l01_mutation: false,
    client_paths_touched: false
  })));
}

export function summarizeMatrix() {
  const states = new Set(matrix.targets.map(t => t.state_code));
  const categories = new Set(matrix.targets.map(t => t.category));

  return Object.freeze({
    matrix_id: matrix.matrix_id,
    total_targets: matrix.targets.length,
    states: states.size,
    categories: categories.size,
    l01_mutation: false,
    client_paths_touched: false
  });
}

if (import.meta.url === `file://${process.argv[1].replaceAll("\\", "/")}`) {
  const summary = summarizeMatrix();
  const sample = selectDiscoveryBatch({ state_codes: ["CA"], limit: 3 });

  console.log(JSON.stringify({
    result: "L02_NATIONAL_DISCOVERY_ORCHESTRATOR_PASS",
    summary,
    sample
  }, null, 2));
}
