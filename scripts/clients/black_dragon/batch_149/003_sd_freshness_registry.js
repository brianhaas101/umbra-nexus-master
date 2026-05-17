const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/san_diego/results/live_http_validation_results.json"
);

const freshness = {
  version:
    "black_dragon_san_diego_live_freshness_registry_v1",

  generated_at:
    new Date().toISOString(),

  freshness_records:
    results.validation_results.map(row => ({
      validation_id:
        row.validation_id,

      organization_name:
        row.organization_name,

      route_type:
        row.route_type,

      url:
        row.url,

      last_seen_at:
        row.checked_at,

      fetch_status:
        row.fetch_status,

      freshness_status:
        row.fetch_status === "VALID"
          ? "FRESH"
          : "REVIEW_REQUIRED",

      response_time_ms:
        row.response_time_ms,

      runtime_mutation_allowed:
        false
    })),

  freshness_laws: {
    valid_route_refreshes_last_seen: true,
    review_required_before_decay: true,
    no_runtime_delete: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/san_diego/freshness/live_freshness_registry.json"
);

fs.writeFileSync(out, JSON.stringify(freshness, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_FRESHNESS_REGISTRY_COMPLETE",
  freshness_records: freshness.freshness_records.length,
  output: out
}, null, 2));
