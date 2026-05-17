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

const schedules = read(
  "public/data/clients/black_dragon/automation/schedules/recurring_pipeline_schedules.json"
);

const discovery = read(
  "public/data/clients/black_dragon/automation/discovery_queue/discovery_engine_registry.json"
);

const delta = read(
  "public/data/clients/black_dragon/automation/simulation/delta_feed/long_beach_weekly_delta_feed.json"
);

const run = {
  version: "black_dragon_weekly_discovery_runner_stub_v1",
  generated_at: new Date().toISOString(),
  runner_id: "BD_RUNNER_WEEKLY_DISCOVERY",
  city: "Long Beach",
  state: "CA",

  schedule_enabled:
    schedules.schedules.some(s => s.pipeline_id === "DISCOVERY_WEEKLY" && s.enabled === true),

  discovery_engine_enabled:
    discovery.enabled === true,

  execution_mode:
    "STUB_SIMULATION_ONLY",

  candidates_detected:
    delta.client_visible_summary.new_candidate_targets,

  runtime_promotion_performed:
    false,

  automated_contact_performed:
    false,

  output_state:
    "DISCOVERY_CANDIDATES_QUEUED_ONLY",

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    candidate_queue_only: true
  }
};

write(
  "public/data/clients/black_dragon/automation/execution_logs/weekly_discovery_runner_log.json",
  run
);

console.log(JSON.stringify({
  status: "WEEKLY_DISCOVERY_RUNNER_STUB_COMPLETE",
  candidates_detected: run.candidates_detected,
  output: "public/data/clients/black_dragon/automation/execution_logs/weekly_discovery_runner_log.json"
}, null, 2));
