const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queuePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_discovery/queues/city_organization_discovery_queue.json"
);

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const manifest = [];

queue.queue.forEach(task => {

  const city = task.city;
  const state = task.state;

  const searches = [

    `${city} ${state} motorcycle club`,
    `${city} ${state} ABATE chapter`,
    `${city} ${state} biker rights organization`,
    `${city} ${state} motorcycle rally`,
    `${city} ${state} Harley Davidson dealership`,
    `${city} ${state} motorcycle repair shop`,
    `${city} ${state} custom motorcycle builder`,
    `${city} ${state} motorcycle podcast`,
    `${city} ${state} motorcycle association`,
    `${city} ${state} law enforcement motorcycle unit`,
    `${city} ${state} gang task force`,
    `${city} ${state} biker event organizer`,
    `${city} ${state} veteran motorcycle association`,
    `${city} ${state} outlaw motorcycle gang investigator`,
    `${city} ${state} motorcycle museum`
  ];

  searches.forEach((query, index) => {

    manifest.push({

      discovery_query_id:
        `${task.organization_discovery_task_id}_QUERY_${String(index + 1).padStart(2, "0")}`,

      organization_discovery_task_id:
        task.organization_discovery_task_id,

      city,
      state,

      search_query:
        query,

      source_type:
        "REAL_PUBLIC_SOURCE_DISCOVERY",

      placeholder_results_forbidden:
        true,

      synthetic_entities_forbidden:
        true,

      runtime_visibility_allowed:
        false
    });
  });
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_discovery/templates/city_discovery_query_manifest.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_city_discovery_query_manifest_v1",
  generated_at: new Date().toISOString(),
  total_queries: manifest.length,
  queries: manifest
}, null, 2));

console.log(JSON.stringify({
  status: "CITY_DISCOVERY_QUERY_MANIFEST_COMPLETE",
  total_queries: manifest.length,
  output: out
}, null, 2));
