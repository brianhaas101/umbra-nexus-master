const fs = require("fs");

const L10 = "public/data/intelligence/outputs/L10_COMMUNICATION_INTELLIGENCE.normalized.json";
const OUT = "public/data/intelligence/outputs/L10_contact_freshness_weighting.json";

const d = JSON.parse(fs.readFileSync(L10, "utf8"));

const output = {
  version: "nexus_L10_contact_freshness_weighting_v1",
  generated_at: new Date().toISOString(),
  total: d.evidence.length,
  freshness: d.evidence.map(e => ({
    entity_id: e.entity_id,
    evidence_id: e.evidence_id,
    freshness_score: e.freshness_score,
    freshness_band: e.freshness_score >= 0.8 ? "FRESH" : "REVIEW"
  }))
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[L10 CONTACT FRESHNESS] COMPLETE", output.total);
