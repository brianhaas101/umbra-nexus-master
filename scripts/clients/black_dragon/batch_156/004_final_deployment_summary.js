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

const summary = {
  version:
    "black_dragon_socal_final_deployment_summary_v1",

  generated_at:
    new Date().toISOString(),

  deployment_scope:
    "SOUTHERN_CALIFORNIA",

  deployment_status:
    "CLIENT_READY_WITH_MANUAL_ACTION_LOCKS",

  operational_cities:
    cityVerify.total_cities,

  federation_status:
    federationVerify.deployment_state,

  client_access_status:
    clientVerify.certification,

  runtime_entities:
    clientVerify.visible_counts.dashboard_runtime_entities,

  regional_opportunities:
    clientVerify.visible_counts.refined_client_opportunities,

  review_queues: {
    manual_contact_review:
      clientVerify.visible_counts.manual_contact_review_items,

    route_issue_review:
      clientVerify.visible_counts.route_issue_review_items
  },

  deployment_capabilities: [
    "City runtime intelligence",
    "Regional overlap scoring",
    "Propagation intelligence",
    "Dead-route review",
    "Manual contact review",
    "Regional opportunity ranking",
    "Federated refresh orchestration",
    "Client-safe dashboards"
  ],

  hardlocks: {
    no_auto_contact:
      federationVerify.safety_locks.no_auto_contact &&
      clientVerify.client_locks.no_auto_contact,

    no_auto_promotion:
      federationVerify.safety_locks.no_auto_promotion &&
      clientVerify.client_locks.no_auto_promotion,

    no_runtime_mutation:
      federationVerify.safety_locks.no_runtime_mutation &&
      clientVerify.client_locks.no_runtime_mutation,

    founder_admin_isolated:
      clientVerify.client_locks.founder_admin_forbidden
  },

  deployment_interpretation: {
    operational_meaning:
      "Black Dragon now has an operational Southern California intelligence corridor.",

    client_meaning:
      "The client can safely review opportunities, propagation chains, contact routes, and regional priorities without administrative mutation authority.",

    infrastructure_meaning:
      "The system supports recurring federation refresh, propagation ranking, overlap refinement, and client-safe operational review."
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/deployment/southern_california/reports/final_deployment_summary.json"
);

fs.writeFileSync(out, JSON.stringify(summary, null, 2), "utf8");

console.log(JSON.stringify({
  status: "FINAL_DEPLOYMENT_SUMMARY_COMPLETE",
  deployment_status: summary.deployment_status,
  runtime_entities: summary.runtime_entities,
  regional_opportunities: summary.regional_opportunities,
  output: out
}, null, 2));
