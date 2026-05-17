const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const runtimePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/exports/client_runtime_target_index.json"
);

const runtime = JSON.parse(
  fs.readFileSync(runtimePath, "utf8")
);

const cityMap = {};

runtime.runtime_targets.forEach(row => {

  const key =
    `${row.city}__${row.state}`;

  if (!cityMap[key]) {

    cityMap[key] = {

      city:
        row.city,

      state:
        row.state,

      country:
        row.country,

      total_targets:
        0,

      verified_contact_routes:
        0,

      dossier_visible:
        0,

      city_map_visible:
        0
    };
  }

  cityMap[key].total_targets += 1;

  if (row.verified_contact_route_status === "VERIFIED_CONTACT_ROUTE") {
    cityMap[key].verified_contact_routes += 1;
  }

  if (row.dossier_visible) {
    cityMap[key].dossier_visible += 1;
  }

  if (row.city_map_visible) {
    cityMap[key].city_map_visible += 1;
  }
});

const summary =
  Object.values(cityMap);

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/runtime_index/exports/city_runtime_summary.json"
);

fs.writeFileSync(out, JSON.stringify({

  version:
    "black_dragon_city_runtime_summary_v1",

  generated_at:
    new Date().toISOString(),

  total_cities:
    summary.length,

  cities:
    summary

}, null, 2));

console.log(JSON.stringify({

  status:
    "CITY_RUNTIME_SUMMARY_COMPLETE",

  total_cities:
    summary.length,

  output:
    out

}, null, 2));
