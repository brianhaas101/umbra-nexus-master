const fs = require("fs");

const A = "public/data/intelligence/outputs/L10_contact_score_refinement.json";
const B = "public/data/intelligence/outputs/L10_communication_confidence_weighting.json";
const C = "public/data/intelligence/outputs/L10_fallback_route_scoring.json";
const D = "public/data/intelligence/outputs/L10_contact_freshness_weighting.json";

const OUT = "public/data/intelligence/outputs/L10_outreach_readiness_synthesis.json";

const a = JSON.parse(fs.readFileSync(A, "utf8"));
const b = JSON.parse(fs.readFileSync(B, "utf8"));
const c = JSON.parse(fs.readFileSync(C, "utf8"));
const d = JSON.parse(fs.readFileSync(D, "utf8"));

const conf = new Map(
  b.weights.map(x => [x.entity_id, x.combined_contact_confidence])
);

const route = new Map(
  c.routes.map(x => [x.entity_id, x.fallback_route_score])
);

const fresh = new Map(
  d.freshness.map(x => [x.entity_id, x.freshness_score])
);

const synthesis = a.refined.map(x => ({
  entity_id: x.entity_id,
  outreach_readiness_score:
    Math.round(
      (
        (x.refined_score * 0.45) +
        ((conf.get(x.entity_id) || 0) * 100 * 0.25) +
        ((route.get(x.entity_id) || 0) * 0.2) +
        ((fresh.get(x.entity_id) || 0) * 100 * 0.1)
      ) * 100
    ) / 100,
  reason:
    "Synthesized from refined score, contact confidence, route strength, and freshness."
}));

const output = {
  version: "nexus_L10_outreach_readiness_synthesis_v1",
  generated_at: new Date().toISOString(),
  total: synthesis.length,
  synthesis
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[L10 OUTREACH SYNTHESIS] COMPLETE", output.total);
