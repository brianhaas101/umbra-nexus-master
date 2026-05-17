const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const dashboard =
  readJson(
    "public/data/clients/black_dragon/education/runtime/dashboard/education_runtime_dashboard.v1.json"
  );

const runtime =
  readJson(
    "public/data/clients/black_dragon/education/runtime/integration/education_runtime_integration.v1.json"
  );

const audit = {
  version:
    "umbra_batch_071_education_runtime_integration_audit_v1",

  generated_at:
    new Date().toISOString(),

  dashboard_integrity: {

    runtime_visible:
      dashboard.status.runtime_visible === true,

    education_layer_live:
      dashboard.status.education_layer_live === true,

    outreach_disabled:
      dashboard.status.outreach_enabled === false,

    contact_generation_disabled:
      dashboard.status.contact_generation_enabled === false,

    response_generation_disabled:
      dashboard.status.response_generation_enabled === false,

    has_seed_targets:
      dashboard.totals.education_seed_targets === 600,

    has_operational_targets:
      dashboard.totals.operational_targets === 600,

    queue_visible:
      dashboard.totals.discovery_queue === 75
  },

  runtime_integrity: {

    runtime_layer_live:
      runtime.runtime_layer.layer_status === "LIVE_RUNTIME_VISIBLE",

    has_entity_classes:
      runtime.runtime_layer.entity_classes.length >= 4,

    runtime_features_present:
      runtime.runtime_layer.runtime_features.length >= 5,

    blocked_features_present:
      runtime.runtime_layer.blocked_features.length >= 4,

    outreach_generation_blocked:
      runtime.runtime_layer.blocked_features.includes(
        "outreach_generation"
      )
  }
};

audit.pass =
  audit.dashboard_integrity.runtime_visible &&
  audit.dashboard_integrity.education_layer_live &&
  audit.dashboard_integrity.outreach_disabled &&
  audit.dashboard_integrity.contact_generation_disabled &&
  audit.dashboard_integrity.response_generation_disabled &&
  audit.dashboard_integrity.has_seed_targets &&
  audit.dashboard_integrity.has_operational_targets &&
  audit.dashboard_integrity.queue_visible &&
  audit.runtime_integrity.runtime_layer_live &&
  audit.runtime_integrity.has_entity_classes &&
  audit.runtime_integrity.runtime_features_present &&
  audit.runtime_integrity.blocked_features_present &&
  audit.runtime_integrity.outreach_generation_blocked;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/education/runtime/audit/batch_071_runtime_integration_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
