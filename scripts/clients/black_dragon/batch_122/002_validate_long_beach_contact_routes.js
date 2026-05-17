const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const imported = JSON.parse(fs.readFileSync(
  path.join(ROOT,
    "public/data/clients/black_dragon/contact_resolution/long_beach/imports/long_beach_contact_route_import.json"),
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

const validated = imported.routes.map(r => ({
  ...r,
  validation_passed: validUrl(r.public_contact_url),
  outreach_executed: false,
  automated_outreach_allowed: false,
  founder_review_required: false,
  client_manual_action_only: true
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/long_beach/validated/long_beach_contact_routes_validated.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_contact_routes_validated_v1",
  generated_at: new Date().toISOString(),
  validated_routes: validated.length,
  validated
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_CONTACT_ROUTE_VALIDATION_COMPLETE",
  validated_routes: validated.length,
  output: out
}, null, 2));
