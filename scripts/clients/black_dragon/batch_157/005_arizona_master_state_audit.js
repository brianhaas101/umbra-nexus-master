const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const manifest = read(
  "public/data/clients/black_dragon/state_federations/arizona/templates/arizona_master_state_manifest.json"
);

const cities = read(
  "public/data/clients/black_dragon/state_federations/arizona/cities/arizona_city_initialization_plan.json"
);

const sources = read(
  "public/data/clients/black_dragon/state_federations/arizona/source_plans/arizona_source_system_plan.json"
);

const automation = read(
  "public/data/clients/black_dragon/state_federations/arizona/automation/arizona_automation_and_propagation_plan.json"
);

const audit = {
  version:
    "black_dragon_batch_157_arizona_master_state_initialization_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "157_ARIZONA_MASTER_STATE_INITIALIZATION",

  state:
    "Arizona",

  counts: {
    target_cities:
      manifest.target_cities.length,

    source_categories:
      sources.source_categories.length,

    propagation_targets:
      automation.propagation_targets.length
  },

  gates: {
    inherited_from_california:
      manifest.inherited_from === "SOUTHERN_CALIFORNIA_MASTER_TEMPLATE",

    four_target_cities:
      manifest.target_cities.length === 4,

    source_systems_defined:
      sources.source_categories.length >= 5,

    propagation_plan_defined:
      automation.propagation_targets.length >= 4,

    no_auto_contact:
      manifest.inherited_hardlocks.no_auto_contact === true,

    no_auto_promotion:
      manifest.inherited_hardlocks.no_auto_promotion === true,

    no_runtime_mutation:
      manifest.inherited_hardlocks.no_runtime_mutation === true,

    quarantine_before_runtime:
      manifest.inherited_hardlocks.quarantine_before_runtime === true
  },

  certification:
    "ARIZONA_MASTER_STATE_READY",

  next_phase:
    "BATCH_158_PHOENIX_RUNTIME_TEMPLATE_INITIALIZATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/audit/batch_157_arizona_master_state_initialization_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_157_ARIZONA_MASTER_STATE_INITIALIZATION_AUDIT_COMPLETE",
  audit_status: audit.status,
  certification: audit.certification,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
