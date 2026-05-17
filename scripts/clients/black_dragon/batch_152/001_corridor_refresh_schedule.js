const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schedule = {
  version:
    "black_dragon_southern_california_corridor_refresh_schedule_v1",

  generated_at:
    new Date().toISOString(),

  corridor:
    "SOUTHERN_CALIFORNIA",

  operational_cities: [
    "Long Beach",
    "Los Angeles",
    "San Diego"
  ],

  schedule_laws: {
    no_parallel_city_runtime_mutation: true,
    no_parallel_live_validation_same_city: true,
    city_refresh_windows_staggered: true,
    federation_rebuild_after_city_refreshes: true,
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_delete_without_quarantine: true
  },

  recurring_schedule: [
    {
      job_id: "SOCAL_DAILY_FRESHNESS_LONG_BEACH",
      city: "Long Beach",
      cadence: "DAILY",
      local_time: "06:00",
      job_type: "FRESHNESS_CHECK"
    },
    {
      job_id: "SOCAL_DAILY_FRESHNESS_LOS_ANGELES",
      city: "Los Angeles",
      cadence: "DAILY",
      local_time: "06:30",
      job_type: "FRESHNESS_CHECK"
    },
    {
      job_id: "SOCAL_DAILY_FRESHNESS_SAN_DIEGO",
      city: "San Diego",
      cadence: "DAILY",
      local_time: "07:00",
      job_type: "FRESHNESS_CHECK"
    },
    {
      job_id: "SOCAL_WEEKLY_LIVE_VALIDATION_LONG_BEACH",
      city: "Long Beach",
      cadence: "WEEKLY",
      local_time: "08:00",
      day: "MONDAY",
      job_type: "LIVE_ROUTE_VALIDATION"
    },
    {
      job_id: "SOCAL_WEEKLY_LIVE_VALIDATION_LOS_ANGELES",
      city: "Los Angeles",
      cadence: "WEEKLY",
      local_time: "08:30",
      day: "MONDAY",
      job_type: "LIVE_ROUTE_VALIDATION"
    },
    {
      job_id: "SOCAL_WEEKLY_LIVE_VALIDATION_SAN_DIEGO",
      city: "San Diego",
      cadence: "WEEKLY",
      local_time: "09:00",
      day: "MONDAY",
      job_type: "LIVE_ROUTE_VALIDATION"
    },
    {
      job_id: "SOCAL_WEEKLY_GRAPH_REBUILD",
      city: "FEDERATION",
      cadence: "WEEKLY",
      local_time: "10:00",
      day: "MONDAY",
      job_type: "FEDERATION_GRAPH_REBUILD"
    },
    {
      job_id: "SOCAL_WEEKLY_CLIENT_DELTA_FEED",
      city: "FEDERATION",
      cadence: "WEEKLY",
      local_time: "10:30",
      day: "MONDAY",
      job_type: "CLIENT_DELTA_FEED"
    }
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/automation/schedules/corridor_refresh_schedule.json"
);

fs.writeFileSync(out, JSON.stringify(schedule, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CORRIDOR_REFRESH_SCHEDULE_COMPLETE",
  scheduled_jobs: schedule.recurring_schedule.length,
  output: out
}, null, 2));
