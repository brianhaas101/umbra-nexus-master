const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validated = JSON.parse(fs.readFileSync(
  path.join(ROOT,
    "public/data/clients/black_dragon/conversion_strategy_layer/validated/long_beach_conversion_strategy_validated.json"),
  "utf8"
));

function score(t) {
  return (
    t.conversion_probability * 0.35 +
    t.audience_fit_score * 0.25 +
    t.scale_potential * 0.20 +
    t.book_sale_relevance * 0.20
  );
}

const dossiers = validated.validated
  .map(t => ({
    dossier_id: `BD_CONVERSION_DOSSIER_${t.conversion_id}`,
    organization_name: t.organization_name,
    organization_type: t.organization_type,
    recommended_conversion_path: t.recommended_conversion_path,
    recommended_action: t.recommended_action,
    composite_rank_score: Number(score(t).toFixed(2)),
    conversion_probability: t.conversion_probability,
    audience_fit_score: t.audience_fit_score,
    scale_potential: t.scale_potential,
    book_sale_relevance: t.book_sale_relevance,
    priority_tier:
      score(t) >= 9.0 ? "HOT" :
      score(t) >= 8.0 ? "WARM" :
      "REVIEW",
    runtime_visible: true,
    dossier_visible: true,
    city_map_visible: true,
    contact_ready: false,
    evidence_note: t.evidence_note
  }))
  .sort((a,b) => b.composite_rank_score - a.composite_rank_score)
  .map((d, i) => ({
    ...d,
    city_rank: i + 1
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/conversion_strategy_layer/dossiers/long_beach_conversion_strategy_ranked_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_conversion_strategy_ranked_dossiers_v1",
  generated_at: new Date().toISOString(),
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CONVERSION_STRATEGY_DOSSIERS_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
