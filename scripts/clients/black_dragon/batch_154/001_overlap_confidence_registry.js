const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const overlaps = read(
  "public/data/clients/black_dragon/federation/southern_california/overlaps/federation_overlap_registry.json"
);

const confidence = overlaps.overlaps.map((overlap, index) => {
  const cityDiversity =
    new Set(overlap.participating_cities || []).size;

  const scoreSpread =
    Math.max(...overlap.organizations.map(o => o.best_score || 0)) -
    Math.min(...overlap.organizations.map(o => o.best_score || 0));

  const confidenceScore =
    Number(Math.min(1,
      0.35 +
      cityDiversity * 0.2 +
      overlap.overlap_count * 0.12 -
      Math.min(0.18, scoreSpread * 0.03)
    ).toFixed(3));

  return {
    overlap_confidence_id:
      `BD_SOCAL_OVERLAP_CONF_${String(index + 1).padStart(5, "0")}`,

    federation_overlap_id:
      overlap.federation_overlap_id,

    normalized_name:
      overlap.normalized_name,

    participating_cities:
      overlap.participating_cities,

    overlap_count:
      overlap.overlap_count,

    city_diversity:
      cityDiversity,

    score_spread:
      Number(scoreSpread.toFixed(3)),

    confidence_score:
      confidenceScore,

    confidence_band:
      confidenceScore >= 0.85
        ? "HIGH_CONFIDENCE"
        : confidenceScore >= 0.65
          ? "MEDIUM_CONFIDENCE"
          : "REVIEW_CONFIDENCE",

    duplicate_inflation_risk:
      overlap.overlap_count > cityDiversity
        ? "POSSIBLE_DUPLICATE_INFLATION"
        : "LOW",

    scoring_action:
      confidenceScore >= 0.65
        ? "ALLOW_REGIONAL_BOOST"
        : "CAP_REGIONAL_BOOST_PENDING_REVIEW",

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  };
});

const payload = {
  version:
    "black_dragon_southern_california_overlap_confidence_registry_v1",

  generated_at:
    new Date().toISOString(),

  confidence_records:
    confidence.length,

  confidence
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/refinement/overlap_confidence/overlap_confidence_registry.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "OVERLAP_CONFIDENCE_REGISTRY_COMPLETE",
  confidence_records: payload.confidence_records,
  output: out
}, null, 2));
