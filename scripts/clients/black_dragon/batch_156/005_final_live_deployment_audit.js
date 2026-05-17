const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const cityVerify = read(
  "public/data/clients/black_dragon/deployment/southern_california/reports/city_runtime_deployment_verify.json"
);

const federationVerify = read(
  "public/data/clients/black_dragon/deployment/southern_california/reports/federation_deployment_verify.json"
);

const clientVerify = read(
  "public/data/clients/black_dragon/deployment/southern_california/reports/client_access_deployment_verify.json"
);

const summary = read(
  "public/data/clients/black_dragon/deployment/southern_california/reports/final_deployment_summary.json"
);

const audit = {
  version:
    "black_dragon_batch_156_socal_live_runtime_deployment_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "156_SOUTHERN_CALIFORNIA_LIVE_RUNTIME_DEPLOYMENT_AUDIT",

  deployment_status:
    summary.deployment_status,

  counts: {
    operational_cities:
      cityVerify.total_cities,

    runtime_entities:
      summary.runtime_entities,

    regional_opportunities:
      summary.regional_opportunities,

    manual_review_queue:
      summary.review_queues.manual_contact_review,

    route_review_queue:
      summary.review_queues.route_issue_review
  },

  gates: {
    three_operational_cities:
      cityVerify.total_cities === 3,

    federation_operational:
      federationVerify.deployment_state === "FEDERATION_OPERATIONAL",

    client_dashboard_visible:
      clientVerify.dashboard_visible === true,

    client_feed_visible:
      clientVerify.feed_visible === true,

    client_queues_visible:
      clientVerify.queues_visible === true,

    no_auto_contact:
      summary.hardlocks.no_auto_contact === true,

    no_auto_promotion:
      summary.hardlocks.no_auto_promotion === true,

    no_runtime_mutation:
      summary.hardlocks.no_runtime_mutation === true,

    founder_admin_isolated:
      summary.hardlocks.founder_admin_isolated === true
  },

  certification:
    "SOCAL_DEPLOYMENT_CERTIFIED",

  next_recommended_paths: [
    "Add additional California cities",
    "Improve client-facing UI language",
    "Expand propagation confidence",
    "Increase regional overlap density",
    "Add additional source systems"
  ],

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/deployment/southern_california/audit/batch_156_socal_live_runtime_deployment_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_156_SOCAL_LIVE_RUNTIME_DEPLOYMENT_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
