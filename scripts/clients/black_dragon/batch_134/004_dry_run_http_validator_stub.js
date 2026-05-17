const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const manifest = read(
  "public/data/clients/black_dragon/automation/fetch/manifests/source_fetch_manifest.json"
);

const now = new Date().toISOString();

const validationResults = [];

let index = 1;

for (const group of manifest.source_groups) {
  for (const source of group.sources) {
    validationResults.push({
      validation_id: `BD_FETCH_VALIDATE_${String(index).padStart(5, "0")}`,
      source_name: source.source_name,
      source_category: group.category,
      validation_target: source.validation_target,
      checked_at: now,

      execution_mode: "DRY_RUN_NO_NETWORK_REQUEST",
      live_http_request_performed: false,

      http_status: null,
      resolved_final_url: null,
      redirect_count: 0,
      domain_resolved: null,
      contact_page_detected: null,
      robots_policy_status: "NOT_CHECKED_DRY_RUN",

      fetch_status: "PENDING_LIVE_FETCH_ENABLEMENT",
      freshness_status: "UNCHANGED",

      runtime_mutation_allowed: false,
      contact_ready_allowed: false,
      automated_outreach_allowed: false
    });

    index += 1;
  }
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/fetch/validation/live_fetch_dry_run_validation_results.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_live_fetch_dry_run_validation_results_v1",
  generated_at: now,
  total_validation_targets: validationResults.length,
  validation_results: validationResults
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LIVE_FETCH_DRY_RUN_VALIDATOR_COMPLETE",
  total_validation_targets: validationResults.length,
  live_http_request_performed: false,
  output: out
}, null, 2));
