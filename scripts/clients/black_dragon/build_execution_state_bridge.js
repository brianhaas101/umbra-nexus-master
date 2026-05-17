const fs = require("fs");

const INPUT = "public/data/clients/black_dragon/outreach_execution_log.json";
const OUTPUT = "public/data/clients/black_dragon/execution_state_bridge.json";

const data = JSON.parse(fs.readFileSync(INPUT, "utf8"));

const states = {};

for (const t of data.targets || []) {
  const s = t.status || "UNKNOWN";

  if (!states[s]) states[s] = 0;
  states[s]++;
}

const out = {
  version: "black_dragon_execution_state_bridge_v1",
  generated_at: new Date().toISOString(),
  total_targets: (data.targets || []).length,
  state_counts: states
};

fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2));

console.log("[EXECUTION BRIDGE] COMPLETE");
