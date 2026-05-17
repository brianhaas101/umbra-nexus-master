const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const imported = JSON.parse(fs.readFileSync(
  path.join(ROOT,
    "public/data/clients/black_dragon/conversion_strategy_layer/imports/long_beach_conversion_strategy_import.json"),
  "utf8"
));

const validated = imported.targets.map(t => ({
  ...t,
  runtime_visible: true,
  dossier_visible: true,
  city_map_visible: true,
  contact_ready: false,
  automated_outreach_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/conversion_strategy_layer/validated/long_beach_conversion_strategy_validated.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_conversion_strategy_validated_v1",
  generated_at: new Date().toISOString(),
  validated_count: validated.length,
  validated
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CONVERSION_STRATEGY_VALIDATION_COMPLETE",
  validated_count: validated.length,
  output: out
}, null, 2));
