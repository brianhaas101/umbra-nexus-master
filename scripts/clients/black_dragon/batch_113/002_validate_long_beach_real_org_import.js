const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const input = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/organization_import/imports/long_beach_real_organization_import.json"),
  "utf8"
));

function validUrl(v) {
  try {
    const u = new URL(v);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

const required = [
  "organization_registry_id",
  "city",
  "state",
  "organization_name",
  "organization_type",
  "source_url",
  "source_title",
  "source_confidence",
  "audience_relevance_score",
  "mc_culture_relevance",
  "book_sale_relevance"
];

const validated = [];
const rejected = [];

for (const org of input.organizations) {
  const missing = required.filter(k => org[k] === undefined || org[k] === null || String(org[k]).trim() === "");
  const urlOk = validUrl(org.source_url);
  const cityOk = org.city === "Long Beach" && org.state === "CA";
  const scoreOk =
    Number(org.audience_relevance_score) >= 0 &&
    Number(org.mc_culture_relevance) >= 0 &&
    Number(org.book_sale_relevance) >= 0;

  const passed = missing.length === 0 && urlOk && cityOk && scoreOk;

  const record = {
    ...org,
    validation_passed: passed,
    missing_required_fields: missing,
    source_url_valid: urlOk,
    city_state_valid: cityOk,
    scores_valid: scoreOk,
    runtime_visibility_allowed: passed,
    dossier_visible: passed,
    city_map_visible: passed,
    contact_ready: false,
    automated_outreach_allowed: false,
    promotion_allowed: false
  };

  if (passed) validated.push(record);
  else rejected.push(record);
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_import/validated/long_beach_validated_organizations.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_validated_organizations_v1",
  generated_at: new Date().toISOString(),
  total_imported: input.organizations.length,
  validated: validated.length,
  rejected: rejected.length,
  validated_organizations: validated,
  rejected_organizations: rejected
}, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_ORGANIZATION_VALIDATION_COMPLETE",
  imported: input.organizations.length,
  validated: validated.length,
  rejected: rejected.length,
  output: out
}, null, 2));
