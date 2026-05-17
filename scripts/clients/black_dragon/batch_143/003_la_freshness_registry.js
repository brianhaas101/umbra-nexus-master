const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/results/live_http_validation_results.json"
);

const freshness = {
  version: "black_dragon_los_angeles_live_freshness_registry_v1",
  generated_at: new Date().toISOString(),
  city: "Los Angeles",
  state: "CA",
  freshness_records: results.validation_results.map(row => ({
    validation_id: row.validation_id,
    organization_name: row.organization_name,
    route_type: row.route_type,
    url: row.url,
    last_seen_at: row.checked_at,
    fetch_status: row.fetch_status,
    freshness_status:
      row.fetch_status === "VALID"
        ? "FRESH"
        : "REVIEW_REQUIRED",
    response_time_ms: row.response_time_ms,
    runtime_mutation_allowed: false
  })),
  freshness_laws: {
    valid_route_refreshes_last_seen: true,
    non_valid_route_requires_review: true,
    repeated_failure_triggers_decay_later: true,
    no_runtime_delete: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/los_angeles/freshness/live_freshness_registry.json"
);

fs.writeFileSync(out, JSON.stringify(freshness, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LOS_ANGELES_LIVE_FRESHNESS_REGISTRY_COMPLETE",
  freshness_records: freshness.freshness_records.length,
  output: out
}, null, 2));
