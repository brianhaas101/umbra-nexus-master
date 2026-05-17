const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const federation = read(
  "public/data/clients/black_dragon/federation/southern_california/graph/federation_entities.json"
);

const overlaps = read(
  "public/data/clients/black_dragon/federation/southern_california/overlaps/federation_overlap_registry.json"
);

const overlapMap = new Map();

for (const overlap of overlaps.overlaps) {
  overlapMap.set(
    overlap.normalized_name,
    overlap
  );
}

const scores =
  federation.federation_entities
    .map(entity => {

      const overlap =
        overlapMap.get(
          entity.organization_name
            .toLowerCase()
            .trim()
        );

      const regionalScore =
        Number((
          entity.best_score +
          ((overlap?.overlap_count || 1) * 0.5)
        ).toFixed(2));

      return {
        federation_entity_id:
          entity.city_runtime_entity_id,

        organization_name:
          entity.organization_name,

        city:
          entity.federation_city,

        city_rank:
          entity.city_rank,

        base_score:
          entity.best_score,

        overlap_count:
          overlap?.overlap_count || 1,

        regional_score:
          regionalScore,

        federation_priority:
          regionalScore >= 9.5
            ? "REGIONAL_HOT"
            : regionalScore >= 8.5
              ? "REGIONAL_WARM"
              : "REGIONAL_REVIEW"
      };
    })
    .sort((a,b) => b.regional_score - a.regional_score)
    .map((row, index) => ({
      ...row,
      regional_rank: index + 1
    }));

const payload = {
  version:
    "black_dragon_southern_california_regional_scores_v1",

  generated_at:
    new Date().toISOString(),

  scored_entities:
    scores.length,

  scores
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/scores/federation_regional_scores.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(payload, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "FEDERATION_REGIONAL_SCORES_COMPLETE",
  scored_entities: payload.scored_entities,
  top_entity: scores[0]?.organization_name || null,
  output: out
}, null, 2));
