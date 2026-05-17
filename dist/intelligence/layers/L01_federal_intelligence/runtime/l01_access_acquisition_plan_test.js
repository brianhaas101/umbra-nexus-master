import fs from "node:fs";

const file = "C:/Dev/Nexus_MASTER/public/intelligence/layers/L01_federal_intelligence/schemas/federal_access_acquisition_plan.json";
const plan = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(plan.contract_id === "L01_federal_access_acquisition_plan", "Bad contract id.");
assert(plan.protected_sources.length === 5, "Expected 5 protected sources.");
assert(plan.immediate_replacement_candidates.length >= 5, "Expected at least 5 replacement candidates.");
assert(plan.completion_standard.pass_token_required_for_activation === true, "Pass-token rule missing.");
assert(plan.completion_standard.all_sources_must_emit_provenance === true, "Provenance rule missing.");
assert(plan.completion_standard.all_sources_must_bridge_to_pipe01 === true, "PIPE_01 bridge rule missing.");
assert(plan.client_paths_touched === false, "Client path violation.");

console.log("L01_ACCESS_ACQUISITION_PLAN_PASS");
