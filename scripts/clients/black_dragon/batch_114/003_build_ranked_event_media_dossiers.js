const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validated = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/event_media_layer/validated/long_beach_event_media_validated.json"),
  "utf8"
));

function score(org) {
  return (
    org.audience_relevance_score * 0.35 +
    org.mc_culture_relevance * 0.30 +
    org.book_sale_relevance * 0.25 +
    org.estimated_reach_score * 0.10
  );
}

const dossiers = validated.validated
  .map(org => ({
    dossier_id:
      `BD_EVENT_MEDIA_DOSSIER_${org.organization_registry_id}`,

    organization_name:
      org.organization_name,

    organization_type:
      org.organization_type,

    city:
      org.city,

    state:
      org.state,

    composite_rank_score:
      Number(score(org).toFixed(2)),

    audience_relevance_score:
      org.audience_relevance_score,

    mc_culture_relevance:
      org.mc_culture_relevance,

    book_sale_relevance:
      org.book_sale_relevance,

    estimated_reach_score:
      org.estimated_reach_score,

    rank_reason:
      org.rank_reason,

    source_url:
      org.source_url,

    priority_tier:
      score(org) >= 9.0
        ? "HOT"
        : score(org) >= 8.0
          ? "WARM"
          : "REVIEW",

    runtime_visible:
      true,

    dossier_visible:
      true,

    city_map_visible:
      true,

    contact_ready:
      false
  }))
  .sort((a,b) => b.composite_rank_score - a.composite_rank_score)
  .map((d, i) => ({
    ...d,
    city_rank: i + 1
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/event_media_layer/dossiers/long_beach_event_media_ranked_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_event_media_ranked_dossiers_v1",
  generated_at: new Date().toISOString(),
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_EVENT_MEDIA_DOSSIERS_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
