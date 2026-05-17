import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const l02 = path.join(root, "public", "intelligence", "layers", "L02_state_intelligence");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
}

const matrix = readJson(path.join(l02, "schemas", "state_coverage_matrix.json"));
const categories = readJson(path.join(l02, "schemas", "state_category_catalog.json"));

const states = ["AL", "AK", "AZ"];

const waveTargets = matrix.targets.filter(
  t => states.includes(t.state_code)
);

const grouped = {};

for (const state of states) {
  grouped[state] = waveTargets.filter(t => t.state_code === state);
}

const result = {
  wave_id: "L02_WAVE_AL_AK_AZ",
  states,
  total_targets: waveTargets.length,
  categories_per_state: categories.category_count,
  grouped,
  registry_mutation: false,
  promoted: false,
  client_paths_touched: false
};

if (waveTargets.length !== 45) {
  throw new Error(`Expected 45 targets. Found ${waveTargets.length}`);
}

console.log(JSON.stringify(result, null, 2));
