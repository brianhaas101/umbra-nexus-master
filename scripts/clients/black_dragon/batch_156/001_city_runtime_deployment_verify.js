const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const runtimes = [
  {
    city: "Long Beach",
    runtime: read(
      "public/data/clients/black_dragon/city_runtime/long_beach_final/merged/long_beach_final_merged_city_entities.json"
    )
  },
  {
    city: "Los Angeles",
    runtime: read(
      "public/data/clients/black_dragon/city_runtime/los_angeles/merged/los_angeles_merged_city_entities.json"
    )
  },
  {
    city: "San Diego",
    runtime: read(
      "public/data/clients/black_dragon/city_runtime/san_diego/merged/san_diego_merged_city_entities.json"
    )
  }
];

const report = {
  version:
    "black_dragon_socal_city_runtime_deployment_verify_v1",

  generated_at:
    new Date().toISOString(),

  total_cities:
    runtimes.length,

  runtimes:
    runtimes.map(row => ({
      city:
        row.city,

      runtime_entities:
        row.runtime.deduped_city_entities,

      runtime_status:
        row.runtime.runtime_status,

      contact_ready_entities:
        row.runtime.contact_ready_entities || 0,

      duplicate_review_entities:
        row.runtime.duplicate_review_entities || 0,

      no_auto_contact:
        row.runtime.inherited_laws?.no_auto_contact === true,

      no_auto_promotion:
        row.runtime.inherited_laws?.no_auto_promotion === true
    }))
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/deployment/southern_california/reports/city_runtime_deployment_verify.json"
);

fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CITY_RUNTIME_DEPLOYMENT_VERIFY_COMPLETE",
  total_cities: report.total_cities,
  output: out
}, null, 2));
