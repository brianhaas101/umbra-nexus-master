const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const longBeach = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
);

const losAngeles = read(
  "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
);

const sanDiego = read(
  "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
);

const allEntities = [
  ...longBeach.merged_entities.map(e => ({
    ...e,
    federation_city: "Long Beach"
  })),

  ...losAngeles.merged_entities.map(e => ({
    ...e,
    federation_city: "Los Angeles"
  })),

  ...sanDiego.merged_entities.map(e => ({
    ...e,
    federation_city: "San Diego"
  }))
];

const federation = {
  version:
    "black_dragon_southern_california_federation_entities_v1",

  generated_at:
    new Date().toISOString(),

  federation_id:
    "BLACK_DRAGON_SOUTHERN_CALIFORNIA",

  federation_status:
    "MULTI_CITY_OPERATIONAL",

  corridor:
    "SOUTHERN_CALIFORNIA",

  operational_cities: [
    "Long Beach",
    "Los Angeles",
    "San Diego"
  ],

  total_runtime_entities:
    allEntities.length,

  federation_entities:
    allEntities
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/graph/federation_entities.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(federation, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status: "FEDERATION_ENTITY_AGGREGATION_COMPLETE",
  total_runtime_entities: federation.total_runtime_entities,
  output: out
}, null, 2));
