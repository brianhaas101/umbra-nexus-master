const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const roots = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/roots/multi_city_propagation_roots.json"
);

const overlaps = read(
  "public/data/clients/black_dragon/federation/southern_california/overlaps/federation_overlap_registry.json"
);

const chains = roots.roots.map((root, index) => {
  const overlap = overlaps.overlaps.find(o =>
    o.normalized_name === root.organization_name.toLowerCase().trim()
  );

  const participatingCities = overlap
    ? overlap.participating_cities
    : [root.city];

  return {
    corridor_chain_id:
      `BD_SOCAL_PROP_CHAIN_${String(index + 1).padStart(5, "0")}`,

    root_organization:
      root.organization_name,

    root_city:
      root.city,

    participating_cities:
      participatingCities,

    city_span:
      participatingCities.length,

    regional_score:
      root.regional_score,

    propagation_chain_type:
      participatingCities.length >= 2
        ? "CROSS_CITY_PROPAGATION_CHAIN"
        : "SINGLE_CITY_HIGH_VALUE_CHAIN",

    recommended_strategy:
      participatingCities.length >= 2
        ? "REGIONAL_MANUAL_REVIEW_PRIORITY"
        : "CITY_LEVEL_MANUAL_REVIEW",

    chain_strength:
      root.regional_score >= 9.5
        ? "HIGH"
        : root.regional_score >= 8.5
          ? "MEDIUM"
          : "REVIEW",

    client_action_class:
      "MANUAL_REVIEW_ONLY",

    automated_outreach_allowed:
      false,

    runtime_mutation_allowed:
      false
  };
});

const payload = {
  version:
    "black_dragon_southern_california_corridor_propagation_chains_v1",

  generated_at:
    new Date().toISOString(),

  chain_count:
    chains.length,

  chains
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/propagation/chains/corridor_propagation_chains.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CORRIDOR_PROPAGATION_CHAINS_COMPLETE",
  chain_count: payload.chain_count,
  output: out
}, null, 2));
