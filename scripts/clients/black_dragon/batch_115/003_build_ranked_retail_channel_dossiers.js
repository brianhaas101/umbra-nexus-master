const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const validated = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/retail_channels/validated/long_beach_retail_channels_validated.json"),
  "utf8"
));

function score(org) {
  return (
    org.audience_relevance_score * 0.30 +
    org.mc_culture_relevance * 0.25 +
    org.book_sale_relevance * 0.25 +
    org.physical_conversion_score * 0.20
  );
}

const dossiers = validated.validated
  .map(org => ({
    dossier_id:
      `BD_RETAIL_DOSSIER_${org.organization_registry_id}`,

    organization_name:
      org.organization_name,

    organization_type:
      org.organization_type,

    composite_rank_score:
      Number(score(org).toFixed(2)),

    audience_relevance_score:
      org.audience_relevance_score,

    mc_culture_relevance:
      org.mc_culture_relevance,

    book_sale_relevance:
      org.book_sale_relevance,

    physical_conversion_score:
      org.physical_conversion_score,

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
      false,

    rank_reason:
      org.rank_reason
  }))
  .sort((a,b) => b.composite_rank_score - a.composite_rank_score)
  .map((d, i) => ({
    ...d,
    city_rank: i + 1
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/retail_channels/dossiers/long_beach_retail_channel_ranked_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_retail_channel_ranked_dossiers_v1",
  generated_at: new Date().toISOString(),
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_RETAIL_CHANNEL_DOSSIERS_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
