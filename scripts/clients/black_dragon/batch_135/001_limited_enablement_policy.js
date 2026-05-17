const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const policy = {
  version:
    "black_dragon_live_http_limited_enablement_policy_v1",

  generated_at:
    new Date().toISOString(),

  enablement_mode:
    "LIMITED_PUBLIC_ROUTE_VALIDATION",

  live_http_validation_enabled:
    true,

  allowed_request_types: [
    "HEAD",
    "SAFE_GET"
  ],

  forbidden_actions: [
    "FORM_SUBMISSION",
    "LOGIN",
    "AUTHENTICATED_REQUESTS",
    "CAPTCHA_BYPASS",
    "SCRAPE_PRIVATE_CONTENT",
    "AUTO_CONTACT",
    "AUTO_PROMOTION",
    "AUTO_DELETE"
  ],

  validation_permissions: {
    update_last_seen_timestamp: true,
    update_freshness_score: true,
    queue_dead_route_review: true,
    queue_revalidation: true,

    mutate_runtime_entity: false,
    promote_to_contact_ready: false,
    delete_runtime_entity: false
  },

  network_limits: {
    max_parallel_requests: 1,
    timeout_ms: 10000,
    max_redirects: 5,
    min_delay_between_requests_ms: 2000,
    max_requests_per_execution: 10
  },

  robots_policy: {
    robots_txt_respected: true,
    robots_block_is_hard_stop: true
  },

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/manifests/live_http_limited_enablement_policy.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(policy, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "LIVE_HTTP_LIMITED_ENABLEMENT_POLICY_COMPLETE",

  live_http_validation_enabled:
    policy.live_http_validation_enabled,

  output:
    out
}, null, 2));
