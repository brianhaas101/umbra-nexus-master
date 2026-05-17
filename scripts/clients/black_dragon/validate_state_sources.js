const fs = require("fs");

const REG_PATH = "public/data/clients/black_dragon/black_dragon_50_state_source_registry.json";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function fail(message) {
  throw new Error(message);
}

function validateSource(src, stateCode) {
  if (!src || typeof src !== "object") fail("[" + stateCode + "] source not object");
  if (!src.url || typeof src.url !== "string") fail("[" + stateCode + "] missing url");
  if (!src.type || typeof src.type !== "string") fail("[" + stateCode + "] missing type");
  if (src.verified !== true) fail("[" + stateCode + "] source not verified true");
  if (!src.last_verified_at) fail("[" + stateCode + "] missing last_verified_at");
}

function main() {
  const reg = readJson(REG_PATH);

  let totalStates = 0;
  let statesReady = 0;
  let totalSources = 0;

  for (const state of reg.states || []) {
    totalStates++;

    if (!Array.isArray(state.sources) || state.sources.length === 0) continue;

    for (const source of state.sources) {
      validateSource(source, state.state_code);
      totalSources++;
    }

    statesReady++;
  }

  console.log("[VALIDATE] States:", totalStates);
  console.log("[VALIDATE] States with verified sources:", statesReady);
  console.log("[VALIDATE] Total verified sources:", totalSources);
}

main();
