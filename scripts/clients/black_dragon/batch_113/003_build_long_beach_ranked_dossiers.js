const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validated = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/organization_import/validated/long_beach_validated_organizations.json"),
  "utf8"
));

function weightedScore(org) {
  return (
    Number(org.audience_relevance_score) * 0.4 +
    Number(org.mc_culture_relevance) * 0.3 +
    Number(org.book_sale_relevance) * 0.3
  );
}

const dossiers = validated.validated_organizations
  .map(org => ({
    dossier_id: `BD_DOSSIER_${org.organization_registry_id}`,
    organization_registry_id: org.organization_registry_id,
    organization_name: org.organization_name,
    city: org.city,
    state: org.state,
    organization_type: org.organization_type,
    source_url: org.source_url,
    source_title: org.source_title,
    audience_relevance_score: org.audience_relevance_score,
    mc_culture_relevance: org.mc_culture_relevance,
    book_sale_relevance: org.book_sale_relevance,
    composite_rank_score: Number(weightedScore(org).toFixed(2)),
    rank_reason: org.rank_reason,
    recommended_action: "SHOW_IN_CLIENT_MAP_AND_DOSSIER_FOR_MANUAL_REVIEW",
    contact_route_status: org.contact_route_status,
    contact_ready: false,
    dossier_visible: true,
    city_map_visible: true,
    automated_outreach_allowed: false
  }))
  .sort((a,b) => b.composite_rank_score - a.composite_rank_score)
  .map((dossier, index) => ({
    ...dossier,
    city_rank: index + 1,
    priority_tier:
      dossier.composite_rank_score >= 8.75 ? "HOT" :
      dossier.composite_rank_score >= 8.0 ? "WARM" :
      "REVIEW"
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_import/dossiers/long_beach_ranked_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_ranked_dossiers_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_RANKED_DOSSIERS_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
