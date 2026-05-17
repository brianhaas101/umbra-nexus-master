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

const grouped = {};

for (const entity of federation.federation_entities) {

  const key =
    entity.organization_name
      .toLowerCase()
      .trim();

  if (!grouped[key]) {
    grouped[key] = [];
  }

  grouped[key].push(entity);
}

const overlaps =
  Object.entries(grouped)
    .filter(([_, rows]) => rows.length > 1)
    .map(([name, rows], index) => ({
      federation_overlap_id:
        `BD_SOCAL_OVERLAP_${String(index + 1).padStart(5, "0")}`,

      normalized_name:
        name,

      overlap_count:
        rows.length,

      participating_cities:
        [...new Set(rows.map(r => r.federation_city))],

      organizations:
        rows.map(r => ({
          city:
            r.federation_city,

          organization_name:
            r.organization_name,

          city_rank:
            r.city_rank,

          best_score:
            r.best_score
        })),

      overlap_type:
        "REGIONAL_CORRIDOR_ENTITY",

      federation_priority:
        rows.some(r => r.best_score >= 9)
          ? "HIGH"
          : "MEDIUM"
    }));

const payload = {
  version:
    "black_dragon_southern_california_overlap_registry_v1",

  generated_at:
    new Date().toISOString(),

  overlap_count:
    overlaps.length,

  overlaps
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/overlaps/federation_overlap_registry.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(payload, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "FEDERATION_OVERLAP_ENGINE_COMPLETE",
  overlap_count: payload.overlap_count,
  output: out
}, null, 2));
