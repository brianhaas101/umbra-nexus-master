const fs = require("fs");

const A = "public/data/intelligence/outputs/L12_engagement_state_scoring.json";
const B = "public/data/intelligence/outputs/L12_response_quality_weighting.json";

const OUT = "public/data/intelligence/outputs/L12_follow_up_prioritization.json";

const a = JSON.parse(fs.readFileSync(A, "utf8"));
const b = JSON.parse(fs.readFileSync(B, "utf8"));

const q = new Map(
  b.quality.map(x => [x.entity_id, x.response_quality_score])
);

const priorities = a.states.map(x => ({
  entity_id: x.entity_id,
  follow_up_priority:
    Math.round(
      (x.state_score * 0.65) +
      ((q.get(x.entity_id) || 0) * 0.35)
    ),
  reason: "Derived from engagement state and response quality."
}));

fs.writeFileSync(
  OUT,
  JSON.stringify({
    version: "nexus_L12_follow_up_prioritization_v1",
    generated_at: new Date().toISOString(),
    total: priorities.length,
    priorities
  }, null, 2)
);

console.log("[L12 FOLLOW UP PRIORITY] COMPLETE", priorities.length);
