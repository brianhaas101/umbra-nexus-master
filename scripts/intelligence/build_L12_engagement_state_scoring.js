const fs = require("fs");

const L12 = "public/data/intelligence/outputs/L12_ENGAGEMENT_RESPONSE.normalized.json";
const OUT = "public/data/intelligence/outputs/L12_engagement_state_scoring.json";

const d = JSON.parse(fs.readFileSync(L12, "utf8"));

const states = d.signals.map(s => ({
  entity_id: s.entity_id,
  state: s.signal_value,
  state_score: s.signal_value === "NEW" ? 70 : 50
}));

fs.writeFileSync(
  OUT,
  JSON.stringify({
    version: "nexus_L12_engagement_state_scoring_v1",
    generated_at: new Date().toISOString(),
    total: states.length,
    states
  }, null, 2)
);

console.log("[L12 STATE SCORING] COMPLETE", states.length);
