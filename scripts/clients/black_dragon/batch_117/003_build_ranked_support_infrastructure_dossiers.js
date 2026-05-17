const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validated = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/support_infrastructure_layer/validated/long_beach_support_infrastructure_validated.json"),
  "utf8"
));

function score(org) {
  return (
    org.audience_relevance_score * 0.25 +
    org.mc_culture_relevance * 0.25 +
    org.book_sale_relevance * 0.25 +
    org.infrastructure_score * 0.25
  );
}

const dossiers = validated.validated
  .map(org => ({
    dossier_id: `BD_SUPPORT_DOSSIER_${org.organization_registry_id}`,
    organization_registry_id: org.organization_registry_id,
    organization_name: org.organization_name,
    organization_type: org.organization_type,
    city: org.city,
    state: org.state,
    source_url: org.source_url,
    source_title: org.source_title,
    composite_rank_score: Number(score(org).toFixed(2)),
    audience_relevance_score: org.audience_relevance_score,
    mc_culture_relevance: org.mc_culture_relevance,
    book_sale_relevance: org.book_sale_relevance,
    infrastructure_score: org.infrastructure_score,
    priority_tier:
      score(org) >= 8.75 ? "HOT" :
      score(org) >= 8.0 ? "WARM" :
      "REVIEW",
    rank_reason: org.rank_reason,
    runtime_visible: true,
    dossier_visible: true,
    city_map_visible: true,
    contact_ready: false
  }))
  .sort((a,b) => b.composite_rank_score - a.composite_rank_score)
  .map((d, i) => ({ ...d, city_rank: i + 1 }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/support_infrastructure_layer/dossiers/long_beach_support_infrastructure_ranked_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_support_infrastructure_ranked_dossiers_v1",
  generated_at: new Date().toISOString(),
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_SUPPORT_INFRASTRUCTURE_DOSSIERS_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
