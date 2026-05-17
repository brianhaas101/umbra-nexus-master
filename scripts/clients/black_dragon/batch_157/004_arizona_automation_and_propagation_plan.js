const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const plan = {
  version:
    "black_dragon_arizona_automation_and_propagation_plan_v1",

  generated_at:
    new Date().toISOString(),

  automation_model: {
    refresh_strategy:
      "STATE_LEVEL_RECURRING_REFRESH",

    federation_strategy:
      "CITY_TO_STATE_PROPAGATION",

    overlap_strategy:
      "CONFIDENCE_WEIGHTED_OVERLAP",

    propagation_strategy:
      "REGIONAL_AND_CROSS_STATE_PROPAGATION"
  },

  propagation_targets: [
    {
      target:
        "California-Arizona crossover events",

      expected_value:
        "high overlap confidence growth"
    },
    {
      target:
        "dealer referral chains",

      expected_value:
        "regional conversion propagation"
    },
    {
      target:
        "veteran network crossover",

      expected_value:
        "trusted referral expansion"
    },
    {
      target:
        "touring route overlap",

      expected_value:
        "cross-state propagation emergence"
    }
  ],

  inherited_hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_runtime_mutation: true
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/state_federations/arizona/automation/arizona_automation_and_propagation_plan.json"
);

fs.writeFileSync(out, JSON.stringify(plan, null, 2), "utf8");

console.log(JSON.stringify({
  status: "ARIZONA_AUTOMATION_AND_PROPAGATION_PLAN_COMPLETE",
  propagation_targets: plan.propagation_targets.length,
  output: out
}, null, 2));
