const fs = require("fs");

const OUT = "public/data/intelligence/outputs/L12_relationship_strength_scoring.json";
const A = "public/data/intelligence/outputs/L12_follow_up_prioritization.json";

const a = JSON.parse(fs.readFileSync(A, "utf8"));

const relationships = a.priorities.map(x => ({
  entity_id: x.entity_id,
  relationship_strength_score:
    Math.max(20, Math.round(x.follow_up_priority * 0.7)),
  band: x.follow_up_priority >= 70 ? "WARM" : "EARLY"
}));

fs.writeFileSync(
  OUT,
  JSON.stringify({
    version: "nexus_L12_relationship_strength_scoring_v1",
    generated_at: new Date().toISOString(),
    total: relationships.length,
    relationships
  }, null, 2)
);

console.log("[L12 RELATIONSHIP STRENGTH] COMPLETE", relationships.length);
