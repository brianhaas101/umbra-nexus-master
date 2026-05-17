const fs = require("fs");

const L12 = "public/data/intelligence/outputs/L12_ENGAGEMENT_RESPONSE.normalized.json";
const OUT = "public/data/intelligence/outputs/L12_response_quality_weighting.json";

const d = JSON.parse(fs.readFileSync(L12, "utf8"));

const quality = d.evidence.map(e => ({
  entity_id: e.entity_id,
  response_quality_score:
    e.normalized_value?.status === "NEW" ? 50 : 65,
  confidence_score: e.confidence_score
}));

fs.writeFileSync(
  OUT,
  JSON.stringify({
    version: "nexus_L12_response_quality_weighting_v1",
    generated_at: new Date().toISOString(),
    total: quality.length,
    quality
  }, null, 2)
);

console.log("[L12 RESPONSE QUALITY] COMPLETE", quality.length);
