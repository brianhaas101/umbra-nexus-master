const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/results/live_http_validation_results.json"
);

const registry = {
  version:
    "black_dragon_live_freshness_registry_v1",

  generated_at:
    new Date().toISOString(),

  freshness_records:
    results.validation_results.map(r => ({
      validation_id:
        r.validation_id,

      organization_name:
        r.organization_name,

      url:
        r.url,

      last_seen_at:
        r.checked_at,

      freshness_status:
        r.fetch_status === "VALID"
          ? "FRESH"
          : "REVIEW_REQUIRED",

      response_time_ms:
        r.response_time_ms
    })),

  freshness_rules: {
    successful_validation_refreshes_timestamp: true,
    timeout_flags_review_required: true,
    repeated_failures_trigger_decay: true,
    dead_routes_require_revalidation: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/freshness/live_freshness_registry.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(registry, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "LIVE_FRESHNESS_REGISTRY_COMPLETE",

  freshness_records:
    registry.freshness_records.length,

  output:
    out
}, null, 2));
