const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const manifest = {
  version:
    "black_dragon_southern_california_corridor_job_manifest_v1",

  generated_at:
    new Date().toISOString(),

  corridor:
    "SOUTHERN_CALIFORNIA",

  execution_mode:
    "ORCHESTRATED_SAFE_REFRESH",

  jobs: [
    {
      job_id: "SOCAL_JOB_REFRESH_LONG_BEACH",
      city: "Long Beach",
      required_lock: "SOCAL_LOCK_LONG_BEACH_REFRESH",
      runner_type: "CITY_REFRESH",
      live_validation_enabled: true,
      runtime_mutation_allowed: false
    },
    {
      job_id: "SOCAL_JOB_REFRESH_LOS_ANGELES",
      city: "Los Angeles",
      required_lock: "SOCAL_LOCK_LOS_ANGELES_REFRESH",
      runner_type: "CITY_REFRESH",
      live_validation_enabled: true,
      runtime_mutation_allowed: false
    },
    {
      job_id: "SOCAL_JOB_REFRESH_SAN_DIEGO",
      city: "San Diego",
      required_lock: "SOCAL_LOCK_SAN_DIEGO_REFRESH",
      runner_type: "CITY_REFRESH",
      live_validation_enabled: true,
      runtime_mutation_allowed: false
    },
    {
      job_id: "SOCAL_JOB_FEDERATION_GRAPH_REBUILD",
      city: "FEDERATION",
      required_lock: "SOCAL_LOCK_FEDERATION_REBUILD",
      runner_type: "FEDERATION_REBUILD",
      live_validation_enabled: false,
      runtime_mutation_allowed: false
    },
    {
      job_id: "SOCAL_JOB_CLIENT_DELTA_FEED",
      city: "FEDERATION",
      required_lock: "SOCAL_LOCK_CLIENT_DELTA_FEED",
      runner_type: "CLIENT_DELTA_FEED",
      live_validation_enabled: false,
      runtime_mutation_allowed: false
    }
  ],

  execution_laws: {
    city_jobs_run_before_federation_jobs: true,
    federation_jobs_require_city_jobs_complete: true,
    failed_city_refresh_does_not_delete_runtime: true,
    failed_city_refresh_queues_review: true,
    no_auto_contact: true,
    no_auto_promotion: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/automation/jobs/corridor_job_manifest.json"
);

fs.writeFileSync(out, JSON.stringify(manifest, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CORRIDOR_JOB_MANIFEST_COMPLETE",
  jobs: manifest.jobs.length,
  output: out
}, null, 2));
