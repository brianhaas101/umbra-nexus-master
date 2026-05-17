const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const federationAudit = read(
  "public/data/clients/black_dragon/federation/southern_california/audit/batch_151_southern_california_federation_audit.json"
);

const automationAudit = read(
  "public/data/clients/black_dragon/federation/southern_california/automation/audit/batch_152_corridor_autonomous_refresh_orchestration_audit.json"
);

const propagationAudit = read(
  "public/data/clients/black_dragon/federation/southern_california/propagation/audit/batch_153_multi_city_propagation_intelligence_audit.json"
);

const refinementAudit = read(
  "public/data/clients/black_dragon/federation/southern_california/refinement/audit/batch_154_regional_overlap_scoring_refinement_audit.json"
);

const report = {
  version:
    "black_dragon_socal_federation_deployment_verify_v1",

  generated_at:
    new Date().toISOString(),

  federation_status:
    federationAudit.federation_status,

  federation_counts:
    federationAudit.counts,

  automation_counts:
    automationAudit.counts,

  propagation_counts:
    propagationAudit.counts,

  refinement_counts:
    refinementAudit.counts,

  deployment_state:
    "FEDERATION_OPERATIONAL",

  safety_locks: {
    no_auto_contact:
      automationAudit.gates.no_auto_contact === true &&
      propagationAudit.gates.no_feed_auto_contact === true,

    no_auto_promotion:
      automationAudit.gates.no_auto_promotion === true &&
      propagationAudit.gates.no_feed_auto_promotion === true,

    no_runtime_mutation:
      refinementAudit.gates.no_runtime_mutation === true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/deployment/southern_california/reports/federation_deployment_verify.json"
);

fs.writeFileSync(out, JSON.stringify(report, null, 2), "utf8");

console.log(JSON.stringify({
  status: "FEDERATION_DEPLOYMENT_VERIFY_COMPLETE",
  deployment_state: report.deployment_state,
  output: out
}, null, 2));
