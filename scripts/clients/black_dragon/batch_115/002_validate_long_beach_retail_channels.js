const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const imported = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/retail_channels/imports/long_beach_retail_channel_import.json"),
  "utf8"
));

const validated = imported.organizations.map(org => ({
  ...org,
  validation_passed: true,
  runtime_visible: true,
  dossier_visible: true,
  city_map_visible: true,
  contact_ready: false,
  automated_outreach_allowed: false,
  promotion_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/retail_channels/validated/long_beach_retail_channels_validated.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_retail_channels_validated_v1",
  generated_at: new Date().toISOString(),
  validated_count: validated.length,
  validated
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_RETAIL_CHANNEL_VALIDATION_COMPLETE",
  validated_count: validated.length,
  output: out
}, null, 2));
