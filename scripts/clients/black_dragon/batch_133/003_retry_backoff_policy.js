const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const retry = {
  version: "black_dragon_production_retry_backoff_policy_v1",
  generated_at: new Date().toISOString(),

  policy: {
    default_max_retries: 3,
    backoff_strategy: "EXPONENTIAL_WITH_CAP",
    first_retry_delay_minutes: 5,
    second_retry_delay_minutes: 15,
    third_retry_delay_minutes: 45,
    max_delay_minutes: 60,
    retry_on: [
      "NETWORK_TIMEOUT",
      "TEMPORARY_FETCH_FAILURE",
      "TRANSIENT_PARSE_FAILURE",
      "LOCK_STALE_RECOVERY"
    ],
    do_not_retry_on: [
      "SCHEMA_VIOLATION",
      "HARDLOCK_VIOLATION",
      "UNAUTHORIZED_SOURCE",
      "ROBOTS_POLICY_BLOCK",
      "CONTACT_AUTOMATION_ATTEMPT"
    ]
  },

  failure_escalation: {
    after_max_retries: "MOVE_TO_FAILURE_QUEUE",
    client_visible_failure: false,
    founder_review_required: true,
    runtime_mutation_allowed_after_failure: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/production/retry/retry_backoff_policy.json"
);

fs.writeFileSync(out, JSON.stringify(retry, null, 2), "utf8");

console.log(JSON.stringify({
  status: "RETRY_BACKOFF_POLICY_COMPLETE",
  max_retries: retry.policy.default_max_retries,
  output: out
}, null, 2));
