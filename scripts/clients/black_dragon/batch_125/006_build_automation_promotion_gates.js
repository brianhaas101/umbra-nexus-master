const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const gates = {

  version:
    "black_dragon_automation_promotion_gates_v1",

  generated_at:
    new Date().toISOString(),

  rules: [

    {
      rule_id: "NO_AUTO_CONTACT",
      enabled: true,
      enforcement: "HARDLOCK"
    },

    {
      rule_id: "NO_AUTO_PROMOTION_TO_CONTACT_READY",
      enabled: true,
      enforcement: "HARDLOCK"
    },

    {
      rule_id: "DISCOVERY_QUEUE_ONLY_UNTIL_VERIFIED",
      enabled: true,
      enforcement: "REQUIRED"
    },

    {
      rule_id: "QUARANTINE_LOW_CONFIDENCE_ENTITIES",
      enabled: true,
      enforcement: "REQUIRED"
    },

    {
      rule_id: "REVALIDATE_STALE_CONTACT_ROUTES",
      enabled: true,
      enforcement: "REQUIRED"
    }
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/promotion_gates/automation_promotion_gates.json"
);

fs.writeFileSync(out, JSON.stringify(gates, null, 2));

console.log(JSON.stringify({
  status: "AUTOMATION_PROMOTION_GATES_COMPLETE",
  rules: gates.rules.length,
  output: out
}, null, 2));
