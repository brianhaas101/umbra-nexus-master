const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schedules = {

  version:
    "black_dragon_recurring_pipeline_schedules_v1",

  generated_at:
    new Date().toISOString(),

  schedules: [

    {
      pipeline_id: "DISCOVERY_WEEKLY",
      frequency: "WEEKLY",
      enabled: true,
      purpose: "Discover new candidate organizations."
    },

    {
      pipeline_id: "SIGNAL_REFRESH_DAILY",
      frequency: "DAILY",
      enabled: true,
      purpose: "Refresh freshness timestamps and scores."
    },

    {
      pipeline_id: "CONTACT_ROUTE_REVALIDATION_WEEKLY",
      frequency: "WEEKLY",
      enabled: true,
      purpose: "Recheck verified public contact routes."
    },

    {
      pipeline_id: "FULL_CITY_RERANK_MONTHLY",
      frequency: "MONTHLY",
      enabled: true,
      purpose: "Re-rank all city entities using fresh signals."
    },

    {
      pipeline_id: "DELTA_FEED_GENERATION_WEEKLY",
      frequency: "WEEKLY",
      enabled: true,
      purpose: "Generate client-visible update feed."
    }
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/schedules/recurring_pipeline_schedules.json"
);

fs.writeFileSync(out, JSON.stringify(schedules, null, 2));

console.log(JSON.stringify({
  status: "RECURRING_PIPELINE_SCHEDULES_COMPLETE",
  schedules: schedules.schedules.length,
  output: out
}, null, 2));
