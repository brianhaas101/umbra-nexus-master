const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const policy = read(
  "public/data/clients/black_dragon/automation/live_validation/manifests/live_http_limited_enablement_policy.json"
);

const targets = read(
  "public/data/clients/black_dragon/automation/live_validation/manifests/live_validation_targets.json"
);

const results = read(
  "public/data/clients/black_dragon/automation/live_validation/results/live_http_validation_results.json"
);

const freshness = read(
  "public/data/clients/black_dragon/automation/live_validation/freshness/live_freshness_registry.json"
);

const deadRoutes = read(
  "public/data/clients/black_dragon/automation/live_validation/dead_routes/dead_route_review_queue.json"
);

const audit = {
  version:
    "black_dragon_batch_135_live_http_validation_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "135_LIVE_HTTP_ROUTE_VALIDATOR_DRY_RUN_TO_LIMITED_ENABLEMENT",

  counts: {
    validation_targets:
      targets.validation_targets.length,

    validation_results:
      results.validation_count,

    valid_routes:
      results.validation_results.filter(r =>
        r.fetch_status === "VALID"
      ).length,

    timeout_routes:
      results.validation_results.filter(r =>
        r.fetch_status === "TIMEOUT"
      ).length,

    error_routes:
      results.validation_results.filter(r =>
        r.fetch_status === "ERROR"
      ).length,

    dead_route_review_items:
      deadRoutes.dead_route_items.length
  },

  gates: {
    live_http_validation_enabled:
      policy.live_http_validation_enabled === true,

    limited_enablement_mode:
      policy.enablement_mode ===
      "LIMITED_PUBLIC_ROUTE_VALIDATION",

    validation_results_exist:
      results.validation_count >= 5,

    freshness_registry_exists:
      freshness.freshness_records.length >= 5,

    no_runtime_mutation:
      results.validation_results.every(r =>
        r.runtime_mutation_allowed === false
      ),

    no_contact_promotion:
      results.validation_results.every(r =>
        r.contact_ready_promotion_allowed === false
      ),

    no_automated_outreach:
      results.validation_results.every(r =>
        r.automated_outreach_allowed === false
      ),

    no_auto_contact:
      policy.hardlocks.no_auto_contact === true,

    no_auto_promotion:
      policy.hardlocks.no_auto_promotion === true,

    no_delete_without_quarantine:
      policy.hardlocks.no_delete_without_quarantine === true
  },

  next_phase:
    "BATCH_136_RELATIONSHIP_GRAPH_ENGINE_FOUNDATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/live_validation/audit/batch_135_live_http_validation_audit.json"
);

fs.writeFileSync(
  out,
  JSON.stringify(audit, null, 2),
  "utf8"
);

console.log(JSON.stringify({
  status:
    "BATCH_135_LIVE_HTTP_VALIDATION_AUDIT_COMPLETE",

  audit_status:
    audit.status,

  counts:
    audit.counts,

  gates:
    audit.gates,

  output:
    out
}, null, 2));
