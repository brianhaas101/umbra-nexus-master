const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const imported = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/event_media_layer/imports/long_beach_event_media_import.json"),
  "utf8"
));

function validUrl(v) {
  try {
    const u = new URL(v);
    return !!u.hostname;
  } catch {
    return false;
  }
}

const validated = imported.organizations.map(org => ({
  ...org,
  validation_passed: validUrl(org.source_url),
  runtime_visibility_allowed: true,
  dossier_visible: true,
  city_map_visible: true,
  contact_ready: false,
  automated_outreach_allowed: false,
  promotion_allowed: false
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/event_media_layer/validated/long_beach_event_media_validated.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_event_media_validated_v1",
  generated_at: new Date().toISOString(),
  validated_count: validated.length,
  validated
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_EVENT_MEDIA_VALIDATION_COMPLETE",
  validated_count: validated.length,
  output: out
}, null, 2));
