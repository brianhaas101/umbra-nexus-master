const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function write(rel, data) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

const queue = read(
  "public/data/clients/black_dragon/automation/simulation/revalidation/long_beach_contact_route_revalidation_queue.json"
);

const results = queue.queue.map(task => ({
  ...task,
  simulated_check_status: "PENDING_EXTERNAL_CHECK",
  route_validity_result: "NOT_EXECUTED_STUB_ONLY",
  contact_ready_changed: false,
  runtime_mutation_performed: false
}));

const out = {
  version: "black_dragon_weekly_revalidation_runner_stub_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",
  total_revalidation_tasks: results.length,
  results,
  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    disable_contact_ready_only_after_failed_validation: true
  }
};

write(
  "public/data/clients/black_dragon/automation/execution_logs/weekly_revalidation_runner_log.json",
  out
);

console.log(JSON.stringify({
  status: "WEEKLY_REVALIDATION_RUNNER_STUB_COMPLETE",
  total_revalidation_tasks: results.length,
  output: "public/data/clients/black_dragon/automation/execution_logs/weekly_revalidation_runner_log.json"
}, null, 2));
