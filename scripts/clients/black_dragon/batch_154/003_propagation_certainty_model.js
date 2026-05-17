const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const chains = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/chains/corridor_propagation_chains.json"
);

const refinedScores = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/score_model/refined_regional_scores.json"
);

const scoreByCityOrg = new Map(
  refinedScores.scores.map(row => [
    `${row.organization_name.toLowerCase().trim()}::${row.city}`,
    row
  ])
);

const certainty = chains.chains.map((chain, index) => {
  const score =
    scoreByCityOrg.get(`${chain.root_organization.toLowerCase().trim()}::${chain.root_city}`);

  const citySpanScore =
    Math.min(1, chain.city_span / 3);

  const refinedScoreComponent =
    Math.min(1, (score?.refined_regional_score || chain.regional_score || 0) / 10);

  const weakChainPenalty =
    chain.city_span === 1 && chain.chain_strength !== "HIGH"
      ? 0.2
      : 0;

  const certaintyScore =
    Number(Math.max(0,
      citySpanScore * 0.35 +
      refinedScoreComponent * 0.55 -
      weakChainPenalty
    ).toFixed(3));

  return {
    propagation_certainty_id:
      `BD_SOCAL_CERTAINTY_${String(index + 1).padStart(5, "0")}`,

    corridor_chain_id:
      chain.corridor_chain_id,

    root_organization:
      chain.root_organization,

    root_city:
      chain.root_city,

    city_span:
      chain.city_span,

    original_chain_strength:
      chain.chain_strength,

    refined_regional_score:
      score?.refined_regional_score || null,

    certainty_score:
      certaintyScore,

    certainty_band:
      certaintyScore >= 0.8
        ? "HIGH_CERTAINTY"
        : certaintyScore >= 0.6
          ? "MEDIUM_CERTAINTY"
          : "REVIEW_CERTAINTY",

    weak_chain_penalty:
      weakChainPenalty,

    recommended_action:
      certaintyScore >= 0.8
        ? "PRIORITIZE_MANUAL_REVIEW"
        : certaintyScore >= 0.6
          ? "SECONDARY_MANUAL_REVIEW"
          : "HOLD_FOR_ADDITIONAL_SIGNAL",

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  };
});

const payload = {
  version:
    "black_dragon_southern_california_propagation_certainty_model_v1",

  generated_at:
    new Date().toISOString(),

  certainty_records:
    certainty.length,

  certainty
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/refinement/certainty/propagation_certainty_model.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "PROPAGATION_CERTAINTY_MODEL_COMPLETE",
  certainty_records: payload.certainty_records,
  output: out
}, null, 2));
