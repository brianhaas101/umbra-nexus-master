const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const templatePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/inputs/official_contact_route_import_template.json"
);

const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

function validUrl(v) {
  try {
    const u = new URL(v);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

function routePresent(v) {
  return typeof v === "string" && v.trim().length > 0;
}

const allowed = new Set(template.allowed_contact_route_types);

const validated = [];
const rejected = [];

for (const row of template.official_contact_routes) {
  const missing = [];

  for (const field of template.required_fields) {
    if (!row[field]) missing.push(field);
  }

  const pageUrlValid = validUrl(row.official_contact_page_url);
  const routeValid = routePresent(row.official_contact_route);
  const typeAllowed = allowed.has(row.official_contact_route_type);

  const passed =
    missing.length === 0 &&
    pageUrlValid &&
    routeValid &&
    typeAllowed;

  const result = {
    ...row,
    validation_timestamp: new Date().toISOString(),
    validation_passed: passed,
    missing_required_fields: missing,
    official_contact_page_url_valid: pageUrlValid,
    official_contact_route_present: routeValid,
    official_contact_route_type_allowed: typeAllowed,
    founder_review_required: true,
    outreach_allowed: false,
    promotion_allowed: false
  };

  if (passed) {
    validated.push(result);
  } else {
    rejected.push({
      ...result,
      rejection_reasons: [
        ...(missing.length ? ["MISSING_REQUIRED_FIELDS"] : []),
        ...(!pageUrlValid ? ["INVALID_OFFICIAL_CONTACT_PAGE_URL"] : []),
        ...(!routeValid ? ["MISSING_OFFICIAL_CONTACT_ROUTE"] : []),
        ...(!typeAllowed ? ["DISALLOWED_CONTACT_ROUTE_TYPE"] : [])
      ]
    });
  }
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/audit/007_official_contact_route_validation.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_official_contact_route_validator_v1",
  generated_at: new Date().toISOString(),
  total_imported: template.official_contact_routes.length,
  validated: validated.length,
  rejected: rejected.length,
  validated_contact_routes: validated,
  rejected_contact_routes: rejected
}, null, 2));

console.log(JSON.stringify({
  status: "OFFICIAL_CONTACT_ROUTE_VALIDATOR_COMPLETE",
  total_imported: template.official_contact_routes.length,
  validated: validated.length,
  rejected: rejected.length,
  output: out
}, null, 2));
