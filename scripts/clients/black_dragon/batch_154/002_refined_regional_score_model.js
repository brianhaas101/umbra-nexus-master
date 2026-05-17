const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const scores = read(
  "public/data/clients/black_dragon/federation/southern_california/scores/federation_regional_scores.json"
);

const confidence = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/overlap_confidence/overlap_confidence_registry.json"
);

const confidenceByName = new Map(
  confidence.confidence.map(row => [
    row.normalized_name,
    row
  ])
);

const refined = scores.scores.map(row => {
  const key =
    row.organization_name.toLowerCase().trim();

  const conf =
    confidenceByName.get(key);

  const confidenceMultiplier =
    conf
      ? conf.confidence_score
      : 0.55;

  const cityDiversityBoost =
    conf
      ? Math.min(0.75, conf.city_diversity * 0.22)
      : 0;

  const duplicateInflationPenalty =
    conf && conf.duplicate_inflation_risk === "POSSIBLE_DUPLICATE_INFLATION"
      ? 0.35
      : 0;

  const refinedRegionalScore =
    Number(Math.max(0,
      row.base_score +
      cityDiversityBoost +
      confidenceMultiplier -
      duplicateInflationPenalty
    ).toFixed(2));

  return {
    ...row,

    original_regional_score:
      row.regional_score,

    overlap_confidence_score:
      conf ? conf.confidence_score : null,

    city_diversity_boost:
      Number(cityDiversityBoost.toFixed(3)),

    duplicate_inflation_penalty:
      duplicateInflationPenalty,

    refined_regional_score:
      refinedRegionalScore,

    refined_priority:
      refinedRegionalScore >= 9.5
        ? "REFINED_REGIONAL_HOT"
        : refinedRegionalScore >= 8.5
          ? "REFINED_REGIONAL_WARM"
          : "REFINED_REGIONAL_REVIEW",

    score_explainability:
      conf
        ? "Score adjusted using overlap confidence, city diversity, and duplicate-inflation controls."
        : "Score uses city-level baseline with reduced regional confidence due to no multi-city overlap."
  };
})
.sort((a,b) => b.refined_regional_score - a.refined_regional_score)
.map((row, index) => ({
  ...row,
  refined_regional_rank: index + 1
}));

const payload = {
  version:
    "black_dragon_southern_california_refined_regional_scores_v1",

  generated_at:
    new Date().toISOString(),

  scored_entities:
    refined.length,

  scores:
    refined
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/refinement/score_model/refined_regional_scores.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "REFINED_REGIONAL_SCORE_MODEL_COMPLETE",
  scored_entities: payload.scored_entities,
  top_entity: refined[0]?.organization_name || null,
  output: out
}, null, 2));
