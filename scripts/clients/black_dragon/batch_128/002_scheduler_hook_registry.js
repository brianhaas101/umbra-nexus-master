const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const scheduler = {
  version: "black_dragon_autonomous_scheduler_hook_registry_v1",
  generated_at: new Date().toISOString(),

  client_id: "black_dragon_omg_cert_v1",
  city: "Long Beach",
  state: "CA",

  scheduler_status: "REGISTERED_NOT_OS_INSTALLED",

  hooks: [
    {
      hook_id: "BD_SCHED_DAILY_FRESHNESS",
      pipeline_id: "SIGNAL_REFRESH_DAILY",
      runner_script: "scripts/clients/black_dragon/automation/runners/daily_freshness_runner.js",
      cadence: "DAILY",
      recommended_time_local: "06:00",
      enabled: true
    },
    {
      hook_id: "BD_SCHED_WEEKLY_DISCOVERY",
      pipeline_id: "DISCOVERY_WEEKLY",
      runner_script: "scripts/clients/black_dragon/automation/runners/weekly_discovery_runner.js",
      cadence: "WEEKLY",
      recommended_day: "MONDAY",
      recommended_time_local: "07:00",
      enabled: true
    },
    {
      hook_id: "BD_SCHED_WEEKLY_REVALIDATION",
      pipeline_id: "CONTACT_ROUTE_REVALIDATION_WEEKLY",
      runner_script: "scripts/clients/black_dragon/automation/runners/weekly_revalidation_runner.js",
      cadence: "WEEKLY",
      recommended_day: "MONDAY",
      recommended_time_local: "07:30",
      enabled: true
    },
    {
      hook_id: "BD_SCHED_WEEKLY_DELTA_FEED",
      pipeline_id: "DELTA_FEED_GENERATION_WEEKLY",
      runner_script: "scripts/clients/black_dragon/automation/runners/weekly_delta_feed_runner.js",
      cadence: "WEEKLY",
      recommended_day: "MONDAY",
      recommended_time_local: "08:00",
      enabled: true
    },
    {
      hook_id: "BD_SCHED_MONTHLY_RERANK",
      pipeline_id: "FULL_CITY_RERANK_MONTHLY",
      runner_script: "scripts/clients/black_dragon/automation/runners/monthly_city_rerank_runner.js",
      cadence: "MONTHLY",
      recommended_day_of_month: 1,
      recommended_time_local: "09:00",
      enabled: true
    }
  ],

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/scheduler/scheduler_hook_registry.json"
);

fs.writeFileSync(out, JSON.stringify(scheduler, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SCHEDULER_HOOK_REGISTRY_COMPLETE",
  hooks: scheduler.hooks.length,
  output: out
}, null, 2));
