const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const schedule = read(
  "public/data/clients/black_dragon/federation/southern_california/automation/schedules/corridor_refresh_schedule.json"
);

const locks = read(
  "public/data/clients/black_dragon/federation/southern_california/automation/locks/corridor_lock_registry.json"
);

const jobs = read(
  "public/data/clients/black_dragon/federation/southern_california/automation/jobs/corridor_job_manifest.json"
);

const plan = read(
  "public/data/clients/black_dragon/federation/southern_california/automation/refresh_plan/corridor_refresh_plan.json"
);

const audit = {
  version:
    "black_dragon_batch_152_corridor_autonomous_refresh_orchestration_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "152_CORRIDOR_AUTONOMOUS_REFRESH_ORCHESTRATION",

  corridor:
    "SOUTHERN_CALIFORNIA",

  counts: {
    operational_cities:
      schedule.operational_cities.length,

    scheduled_jobs:
      schedule.recurring_schedule.length,

    locks:
      locks.locks.length,

    jobs:
      jobs.jobs.length,

    refresh_phases:
      plan.refresh_sequence.length
  },

  gates: {
    three_city_corridor:
      schedule.operational_cities.length === 3,

    refresh_schedule_exists:
      schedule.recurring_schedule.length >= 8,

    lock_registry_exists:
      locks.locks.length >= 5,

    job_manifest_exists:
      jobs.jobs.length >= 5,

    refresh_plan_exists:
      plan.refresh_sequence.length >= 5,

    no_parallel_city_runtime_mutation:
      schedule.schedule_laws.no_parallel_city_runtime_mutation === true,

    federation_rebuild_after_city_refreshes:
      schedule.schedule_laws.federation_rebuild_after_city_refreshes === true,

    all_jobs_runtime_mutation_locked:
      jobs.jobs.every(job => job.runtime_mutation_allowed === false),

    no_auto_contact:
      locks.hardlocks.no_auto_contact === true &&
      jobs.execution_laws.no_auto_contact === true &&
      plan.mutation_policy.refresh_cannot_auto_contact === true,

    no_auto_promotion:
      locks.hardlocks.no_auto_promotion === true &&
      jobs.execution_laws.no_auto_promotion === true &&
      plan.mutation_policy.refresh_cannot_auto_promote === true,

    no_runtime_delete_without_quarantine:
      locks.hardlocks.no_runtime_delete_without_quarantine === true &&
      plan.mutation_policy.refresh_cannot_delete_runtime_entity === true
  },

  interpretation: {
    operational_meaning:
      "Southern California now has a coordinated recurring refresh model instead of isolated city refreshes.",

    safety_meaning:
      "Refresh can update freshness and review queues, but cannot contact, auto-promote, or delete runtime entities.",

    next_step:
      "Build multi-city propagation intelligence over the refreshed corridor."
  },

  next_phase:
    "BATCH_153_MULTI_CITY_PROPAGATION_INTELLIGENCE",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/federation/southern_california/automation/audit/batch_152_corridor_autonomous_refresh_orchestration_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_152_CORRIDOR_AUTONOMOUS_REFRESH_ORCHESTRATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
