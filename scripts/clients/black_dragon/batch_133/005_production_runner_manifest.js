const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const manifest = {
  version: "black_dragon_production_runner_manifest_v1",
  generated_at: new Date().toISOString(),

  environment: {
    project_root: "C:\\Dev\\Nexus_MASTER",
    node_required: true,
    powershell_required: true,
    windows_task_scheduler_supported: true,
    live_fetch_enabled: false,
    production_mutation_enabled: false
  },

  runners: [
    {
      runner_id: "BD_RUNNER_DAILY_FRESHNESS",
      script: "scripts/clients/black_dragon/automation/runners/daily_freshness_runner.js",
      job_id: "BD_JOB_DAILY_FRESHNESS_LONG_BEACH",
      lock_id: "BD_LOCK_LONG_BEACH_RUNTIME_MUTATION"
    },
    {
      runner_id: "BD_RUNNER_WEEKLY_DISCOVERY",
      script: "scripts/clients/black_dragon/automation/runners/weekly_discovery_runner.js",
      job_id: "BD_JOB_WEEKLY_DISCOVERY_LONG_BEACH",
      lock_id: "BD_LOCK_LONG_BEACH_DISCOVERY"
    },
    {
      runner_id: "BD_RUNNER_WEEKLY_REVALIDATION",
      script: "scripts/clients/black_dragon/automation/runners/weekly_revalidation_runner.js",
      job_id: "BD_JOB_WEEKLY_REVALIDATION_LONG_BEACH",
      lock_id: "BD_LOCK_LONG_BEACH_REVALIDATION"
    },
    {
      runner_id: "BD_RUNNER_WEEKLY_DELTA_FEED",
      script: "scripts/clients/black_dragon/automation/runners/weekly_delta_feed_runner.js",
      job_id: "BD_JOB_WEEKLY_DELTA_FEED_LONG_BEACH",
      lock_id: "BD_LOCK_LONG_BEACH_RUNTIME_MUTATION"
    },
    {
      runner_id: "BD_RUNNER_MONTHLY_RERANK",
      script: "scripts/clients/black_dragon/automation/runners/monthly_city_rerank_runner.js",
      job_id: "BD_JOB_MONTHLY_RERANK_LONG_BEACH",
      lock_id: "BD_LOCK_LONG_BEACH_RERANK"
    }
  ],

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true,
    live_fetch_requires_separate_enable_flag: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/production/manifests/production_runner_manifest.json"
);

fs.writeFileSync(out, JSON.stringify(manifest, null, 2), "utf8");

console.log(JSON.stringify({
  status: "PRODUCTION_RUNNER_MANIFEST_COMPLETE",
  runners: manifest.runners.length,
  output: out
}, null, 2));
