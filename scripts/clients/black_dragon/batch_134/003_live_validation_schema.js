const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const schema = {
  version: "black_dragon_live_fetch_validation_schema_v1",
  generated_at: new Date().toISOString(),

  validation_result_schema: {
    validation_id: "string",
    source_name: "string",
    source_url: "string",
    source_category: "string",
    checked_at: "ISO_TIMESTAMP",
    http_status: "number_or_null",
    resolved_final_url: "string_or_null",
    redirect_count: "number",
    domain_resolved: "boolean",
    contact_page_detected: "boolean",
    robots_policy_status: "ALLOWED_BLOCKED_UNKNOWN",
    fetch_status: "VALID_STALE_BROKEN_BLOCKED_FAILED",
    freshness_status: "FRESH_AGING_STALE",
    runtime_mutation_allowed: "boolean",
    contact_ready_allowed: "boolean",
    automated_outreach_allowed: "boolean"
  },

  status_rules: {
    http_200_to_299: "VALID",
    http_300_to_399: "VALID_WITH_REDIRECT",
    http_400_to_499: "BROKEN_CLIENT_ERROR",
    http_500_to_599: "FAILED_SERVER_ERROR",
    dns_failure: "BROKEN_DOMAIN",
    timeout: "FAILED_TIMEOUT",
    robots_blocked: "BLOCKED_BY_POLICY"
  },

  mutation_rules: {
    validation_can_update_freshness: true,
    validation_can_queue_dead_link: true,
    validation_can_queue_revalidation: true,
    validation_cannot_contact: true,
    validation_cannot_promote_to_contact_ready: true,
    validation_cannot_delete_runtime_entity: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/fetch/validation/live_fetch_validation_schema.json"
);

fs.writeFileSync(out, JSON.stringify(schema, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LIVE_FETCH_VALIDATION_SCHEMA_COMPLETE",
  output: out
}, null, 2));
