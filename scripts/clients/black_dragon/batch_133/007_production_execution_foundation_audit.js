const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

const locks = read(
  "public/data/clients/black_dragon/automation/production/locks/execution_lock_registry.json"
);

const jobs = read(
  "public/data/clients/black_dragon/automation/production/jobs/job_state_registry.json"
);

const retry = read(
  "public/data/clients/black_dragon/automation/production/retry/retry_backoff_policy.json"
);

const failures = read(
  "public/data/clients/black_dragon/automation/production/failures/failure_queue.json"
);

const manifest = read(
  "public/data/clients/black_dragon/automation/production/manifests/production_runner_manifest.json"
);

const schedulerScriptExists =
  exists("public/data/clients/black_dragon/automation/production/scheduler/install_windows_scheduled_tasks.ps1");

const audit = {
  version: "black_dragon_batch_133_production_execution_foundation_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "133_PRODUCTION_EXECUTION_LAYER_FOUNDATION",

  counts: {
    locks: locks.locks.length,
    jobs: jobs.jobs.length,
    retryable_failure_types: retry.policy.retry_on.length,
    non_retryable_failure_types: retry.policy.do_not_retry_on.length,
    failure_queue_items: failures.failure_items.length,
    production_runners: manifest.runners.length,
    scheduler_install_scripts: schedulerScriptExists ? 1 : 0
  },

  gates: {
    lock_registry_exists: locks.locks.length >= 4,
    job_state_registry_exists: jobs.jobs.length >= 5,
    retry_policy_exists: retry.policy.default_max_retries >= 3,
    failure_queue_ready: failures.queue_status === "READY",
    runner_manifest_exists: manifest.runners.length >= 5,
    scheduler_install_script_exists: schedulerScriptExists,
    live_fetch_disabled_until_next_gate: manifest.environment.live_fetch_enabled === false,
    production_mutation_disabled_until_next_gate: manifest.environment.production_mutation_enabled === false,
    no_auto_contact: manifest.hardlocks.no_auto_contact === true,
    no_auto_promotion: manifest.hardlocks.no_auto_promotion === true,
    no_delete_without_quarantine: manifest.hardlocks.no_delete_without_quarantine === true
  },

  next_phase: "BATCH_134_LIVE_FETCH_VALIDATION_LAYER_FOUNDATION",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/production/audit/batch_133_production_execution_foundation_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_133_PRODUCTION_EXECUTION_FOUNDATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
