const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queries = {
  version:
    "black_dragon_discovery_query_templates_v1",

  generated_at:
    new Date().toISOString(),

  city:
    "Long Beach",

  state:
    "CA",

  templates: [

    {
      category:
        "EVENT_DISCOVERY",

      queries: [
        "Long Beach motorcycle events",
        "Southern California biker rally",
        "Long Beach bike night",
        "California motorcycle swap meet",
        "Long Beach motorcycle charity ride"
      ]
    },

    {
      category:
        "MOTORCYCLE_MEDIA",

      queries: [
        "best motorcycle podcasts california",
        "Southern California biker YouTube channels",
        "Long Beach biker Instagram",
        "motorcycle TikTok creators California"
      ]
    },

    {
      category:
        "DEALERSHIP_NETWORKS",

      queries: [
        "Harley dealer Long Beach",
        "Indian Motorcycle Southern California",
        "BMW Motorrad California"
      ]
    },

    {
      category:
        "VETERAN_AND_LEMC_NETWORKS",

      queries: [
        "CVMA California chapters",
        "Patriot Guard Riders California",
        "California LEMC chapters"
      ]
    },

    {
      category:
        "COMMUNITY_VENUES",

      queries: [
        "Long Beach motorcycle cafe",
        "Long Beach biker bar",
        "Long Beach tattoo motorcycle culture",
        "bike night Long Beach"
      ]
    }
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/database_expansion/queries/discovery_query_templates.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(queries, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "DISCOVERY_QUERY_TEMPLATES_COMPLETE",

  categories:
    queries.templates.length,

  output:
    out
}, null, 2));
