const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const sourcePlan = {
  version:
    "black_dragon_arizona_source_system_plan_v1",

  generated_at:
    new Date().toISOString(),

  state:
    "Arizona",

  source_categories: [
    {
      category:
        "DEALERSHIP_NETWORKS",

      target_sources: [
        "Harley-Davidson dealer systems",
        "independent motorcycle dealers",
        "used motorcycle dealer groups",
        "dealer event calendars"
      ]
    },
    {
      category:
        "EVENT_PROPAGATION",

      target_sources: [
        "Arizona motorcycle rallies",
        "swap meets",
        "bike nights",
        "regional event calendars",
        "charity rides"
      ]
    },
    {
      category:
        "MEDIA_AND_COMMUNITY",

      target_sources: [
        "motorcycle podcasts",
        "Arizona rider groups",
        "social riding clubs",
        "local motorcycle publications"
      ]
    },
    {
      category:
        "VETERAN_AND_NONPROFIT",

      target_sources: [
        "veteran rider groups",
        "LEMC overlap",
        "motorcycle nonprofits",
        "charity organizations"
      ]
    },
    {
      category:
        "CROSS_STATE_PROPAGATION",

      target_sources: [
        "California-Arizona travel routes",
        "regional event overlap",
        "shared sponsorship ecosystems",
        "touring corridors"
      ]
    }
  ],

  ingestion_rules: {
    all_entities_require_validation: true,
    all_contact_routes_require_review: true,
    no_auto_contact: true,
    quarantine_before_runtime: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/source_plans/arizona_source_system_plan.json"
);

fs.writeFileSync(out, JSON.stringify(sourcePlan, null, 2), "utf8");

console.log(JSON.stringify({
  status: "ARIZONA_SOURCE_SYSTEM_PLAN_COMPLETE",
  source_categories: sourcePlan.source_categories.length,
  output: out
}, null, 2));
