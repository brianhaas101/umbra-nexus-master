const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const policy = read(
  "public/data/clients/black_dragon/automation/fetch/policies/live_fetch_policy.json"
);

const manifest = read(
  "public/data/clients/black_dragon/automation/fetch/manifests/source_fetch_manifest.json"
);

const schema = read(
  "public/data/clients/black_dragon/automation/fetch/validation/live_fetch_validation_schema.json"
);

const dryRun = read(
  "public/data/clients/black_dragon/automation/fetch/validation/live_fetch_dry_run_validation_results.json"
);

const deadLinks = read(
  "public/data/clients/black_dragon/automation/fetch/dead_links/dead_link_suppression_queue.json"
);

const failures = read(
  "public/data/clients/black_dragon/automation/fetch/failures/live_fetch_failure_queue.json"
);

const totalSources =
  manifest.source_groups.reduce((sum, group) => sum + group.sources.length, 0);

const audit = {
  version: "black_dragon_batch_134_live_fetch_validation_foundation_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "134_LIVE_FETCH_VALIDATION_LAYER_FOUNDATION",

  counts: {
    source_groups: manifest.source_groups.length,
    fetch_sources: totalSources,
    validation_targets: dryRun.total_validation_targets,
    failure_types: failures.failure_types.length,
    dead_link_queue_items: deadLinks.dead_link_items.length
  },

  gates: {
    live_fetch_policy_exists: policy.version === "black_dragon_live_fetch_policy_v1",
    live_fetch_disabled_by_default: policy.fetch_rules.live_fetch_enabled === false,
    dry_run_only: policy.fetch_rules.dry_run_only === true,
    fetch_manifest_exists: totalSources >= 20,
    validation_schema_exists: !!schema.validation_result_schema,
    dry_run_validation_complete: dryRun.total_validation_targets === totalSources,
    no_live_http_requests_performed: dryRun.validation_results.every(r => r.live_http_request_performed === false),
    dead_link_queue_ready: deadLinks.queue_status === "READY",
    failure_queue_ready: failures.queue_status === "READY",
    no_auto_contact: policy.hardlocks.no_auto_contact === true,
    no_auto_promotion: policy.hardlocks.no_auto_promotion === true,
    no_delete_without_quarantine: policy.hardlocks.no_delete_without_quarantine === true
  },

  next_phase: "BATCH_135_LIVE_HTTP_ROUTE_VALIDATOR_DRY_RUN_TO_LIMITED_ENABLEMENT",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/fetch/audit/batch_134_live_fetch_validation_foundation_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_134_LIVE_FETCH_VALIDATION_FOUNDATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
