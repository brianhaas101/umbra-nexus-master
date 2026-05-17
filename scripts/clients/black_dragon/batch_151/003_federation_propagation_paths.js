const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const overlaps = read(
  "public/data/clients/black_dragon/federation/southern_california/overlaps/federation_overlap_registry.json"
);

const federationPaths =
  overlaps.overlaps.map((overlap, index) => ({

    federation_path_id:
      `BD_SOCAL_PATH_${String(index + 1).padStart(5, "0")}`,

    root_entity:
      overlap.organizations[0].organization_name,

    participating_cities:
      overlap.participating_cities,

    overlap_count:
      overlap.overlap_count,

    propagation_type:
      "REGIONAL_MULTI_CITY_PROPAGATION",

    federation_priority:
      overlap.federation_priority,

    estimated_regional_reach:
      overlap.overlap_count * 10,

    recommended_strategy:
      overlap.federation_priority === "HIGH"
        ? "MULTI_CITY_MANUAL_REVIEW_PRIORITY"
        : "REGIONAL_REVIEW_QUEUE",

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  }));

const payload = {
  version:
    "black_dragon_southern_california_federation_paths_v1",

  generated_at:
    new Date().toISOString(),

  total_paths:
    federationPaths.length,

  federation_paths:
    federationPaths
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/paths/federation_propagation_paths.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(payload, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "FEDERATION_PROPAGATION_PATHS_COMPLETE",
  total_paths: payload.total_paths,
  output: out
}, null, 2));
