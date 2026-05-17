const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const imported = JSON.parse(fs.readFileSync(
  path.join(ROOT,
    "public/data/clients/black_dragon/culture_expansion_layer/imports/long_beach_culture_expansion_import.json"),
  "utf8"
));

function score(o) {
  return (
    o.audience_relevance_score * 0.30 +
    o.propagation_score * 0.30 +
    o.book_sale_relevance * 0.20 +
    o.influencer_trust_score * 0.20
  );
}

const dossiers = imported.organizations
  .map(org => ({
    ...org,

    composite_rank_score:
      Number(score(org).toFixed(2)),

    priority_tier:
      score(org) >= 8.75
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

    automated_outreach_allowed:
      false
  }))
  .sort((a,b) => b.composite_rank_score - a.composite_rank_score)
  .map((d, i) => ({
    ...d,
    city_rank: i + 1
  }));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/culture_expansion_layer/dossiers/long_beach_culture_expansion_ranked_dossiers.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_culture_expansion_ranked_dossiers_v1",
  generated_at: new Date().toISOString(),
  total_dossiers: dossiers.length,
  dossiers
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CULTURE_EXPANSION_DOSSIERS_COMPLETE",
  total_dossiers: dossiers.length,
  output: out
}, null, 2));
