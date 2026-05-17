const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const jobs = {
  version: "black_dragon_production_job_state_registry_v1",
  generated_at: new Date().toISOString(),

  city: "Long Beach",
  state: "CA",

  jobs: [
    {
      job_id: "BD_JOB_DAILY_FRESHNESS_LONG_BEACH",
      runner: "daily_freshness_runner.js",
      cadence: "DAILY",
      state: "READY",
      last_started_at: null,
      last_completed_at: null,
      last_status: "NEVER_RUN",
      retry_count: 0,
      max_retries: 3,
      lock_required: "BD_LOCK_LONG_BEACH_RUNTIME_MUTATION"
    },
    {
      job_id: "BD_JOB_WEEKLY_DISCOVERY_LONG_BEACH",
      runner: "weekly_discovery_runner.js",
      cadence: "WEEKLY",
      state: "READY",
      last_started_at: null,
      last_completed_at: null,
      last_status: "NEVER_RUN",
      retry_count: 0,
      max_retries: 3,
      lock_required: "BD_LOCK_LONG_BEACH_DISCOVERY"
    },
    {
      job_id: "BD_JOB_WEEKLY_REVALIDATION_LONG_BEACH",
      runner: "weekly_revalidation_runner.js",
      cadence: "WEEKLY",
      state: "READY",
      last_started_at: null,
      last_completed_at: null,
      last_status: "NEVER_RUN",
      retry_count: 0,
      max_retries: 3,
      lock_required: "BD_LOCK_LONG_BEACH_REVALIDATION"
    },
    {
      job_id: "BD_JOB_WEEKLY_DELTA_FEED_LONG_BEACH",
      runner: "weekly_delta_feed_runner.js",
      cadence: "WEEKLY",
      state: "READY",
      last_started_at: null,
      last_completed_at: null,
      last_status: "NEVER_RUN",
      retry_count: 0,
      max_retries: 2,
      lock_required: "BD_LOCK_LONG_BEACH_RUNTIME_MUTATION"
    },
    {
      job_id: "BD_JOB_MONTHLY_RERANK_LONG_BEACH",
      runner: "monthly_city_rerank_runner.js",
      cadence: "MONTHLY",
      state: "READY",
      last_started_at: null,
      last_completed_at: null,
      last_status: "NEVER_RUN",
      retry_count: 0,
      max_retries: 2,
      lock_required: "BD_LOCK_LONG_BEACH_RERANK"
    }
  ],

  job_laws: {
    job_must_write_execution_log: true,
    job_must_respect_lock: true,
    job_must_write_snapshot_if_runtime_changes: true,
    job_must_fail_closed_on_error: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/production/jobs/job_state_registry.json"
);

fs.writeFileSync(out, JSON.stringify(jobs, null, 2), "utf8");

console.log(JSON.stringify({
  status: "JOB_STATE_REGISTRY_COMPLETE",
  jobs: jobs.jobs.length,
  output: out
}, null, 2));
