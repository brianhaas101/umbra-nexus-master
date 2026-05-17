const fs = require("fs");

const REG_PATH = "public/data/clients/black_dragon/black_dragon_50_state_source_registry.json";

function readJson(p){ return JSON.parse(fs.readFileSync(p,"utf8")); }

function main() {
  const reg = readJson(REG_PATH);

  const active = reg.states.filter(s =>
    Array.isArray(s.sources) &&
    s.sources.length > 0 &&
    s.sources.every(src => src.verified === true)
  );

  console.log("[INGEST] Active states:", active.map(s => s.state_code).join(", "));

  for (const s of active) {
    console.log("[INGEST] Running:", s.state_code);

    // This is where your existing per-state parsers plug in:
    // e.g. node scripts/connectors/<state>_parser.js
    // DO NOT create outputs here unless sources are verified (enforced above)

    // Placeholder for your actual parsers:
    // require(./connectors/_parser.js)();
  }

  console.log("[INGEST] COMPLETE");
}

main();
