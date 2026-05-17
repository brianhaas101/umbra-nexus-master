const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function validEmail(value) {
  if (!value) return false;

  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(
    String(value).trim()
  );
}

function validPhone(value) {
  if (!value) return false;

  return /^\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s().-]*\d{4}$/.test(
    String(value).trim()
  );
}

function validUrl(value) {
  if (!value || typeof value !== "string") return false;

  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

function hasPlaceholder(value) {
  return /example\.com|test\.com|fake|placeholder|sample/i.test(
    String(value || "")
  );
}

const validatedSources = readJson(
  "public/data/clients/black_dragon/authentication/source_import/validated/validated_source_imports.v1.json"
);

const records =
  validatedSources.validated_source_imports || [];

const stagedContacts = [];
const blockedContacts = [];

for (const record of records) {

  const route =
    record.contact_route || null;

  const email =
    record.contact_email || null;

  const phone =
    record.contact_phone || null;

  const page =
    record.contact_page_url || null;

  const checks = {

    has_route:
      !!route,

    valid_email:
      !email || validEmail(email),

    valid_phone:
      !phone || validPhone(phone),

    valid_page:
      !page || validUrl(page),

    no_placeholder:
      !hasPlaceholder(
        `${route || ""} ${email || ""} ${phone || ""} ${page || ""}`
      )
  };

  const pass =
    checks.has_route &&
    checks.valid_email &&
    checks.valid_phone &&
    checks.valid_page &&
    checks.no_placeholder;

  const output = {

    entity_id:
      record.entity_id,

    organization_name:
      record.organization_name,

    region:
      record.region,

    source_url:
      record.source_url,

    contact_route:
      route,

    contact_email:
      email,

    contact_phone:
      phone,

    contact_page_url:
      page,

    staging_checks:
      checks,

    staging_status:
      pass
        ? "CONTACT_ROUTE_STAGED"
        : "CONTACT_ROUTE_BLOCKED",

    manual_review_required:
      true,

    outreach_allowed:
      false,

    contact_ready:
      false
  };

  if (pass) {
    stagedContacts.push(output);
  } else {
    blockedContacts.push(output);
  }
}

const stagedPayload = {
  version:
    "black_dragon_staged_contact_routes_v1_batch_096",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  policy:
    "ONLY_REAL_VALID_CONTACT_ROUTES_CAN_STAGE",

  totals: {
    validated_sources:
      records.length,

    staged_contacts:
      stagedContacts.length,

    blocked_contacts:
      blockedContacts.length,

    contact_ready:
      0,

    outreach_allowed:
      0
  },

  staged_contact_routes:
    stagedContacts
};

const blockedPayload = {
  version:
    "black_dragon_blocked_contact_routes_v1_batch_096",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  totals: {
    validated_sources:
      records.length,

    staged_contacts:
      stagedContacts.length,

    blocked_contacts:
      blockedContacts.length
  },

  blocked_contact_routes:
    blockedContacts
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/contact_staging/imports/staged_contact_routes.v1.json"
  ),
  JSON.stringify(stagedPayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/contact_staging/imports/blocked_contact_routes.v1.json"
  ),
  JSON.stringify(blockedPayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/contact_validation/contact_route_import_template.v1.json"
  ),
  JSON.stringify({
    version:
      "black_dragon_contact_route_import_template_v1_batch_096_prefilled",

    generated_at:
      new Date().toISOString(),

    policy:
      "ONLY_VERIFIABLE_PUBLIC_CONTACT_ROUTES_ALLOWED",

    contact_route_imports:
      stagedContacts
  }, null, 2)
);

console.log(JSON.stringify({
  status:
    "CONTACT_ROUTE_STAGING_COMPLETE",

  totals:
    stagedPayload.totals,

  next:
    "Run validate_contact_routes.js then batch_091 audit."
}, null, 2));
