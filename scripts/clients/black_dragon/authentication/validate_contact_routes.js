const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function normalize(v) {
  return String(v || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function validUrl(value) {
  if (!value || typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
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

function hasPlaceholder(value) {
  return /example\.com|test\.com|fake|placeholder|sample/i.test(
    String(value || "")
  );
}

function sameRegion(a, b) {
  return normalize(a) === normalize(b);
}

function nameOverlap(a, b) {
  const left =
    normalize(a).split(" ").filter(Boolean);

  const right =
    new Set(
      normalize(b).split(" ").filter(Boolean)
    );

  const meaningful =
    left.filter(x =>
      x.length >= 3 &&
      ![
        "department",
        "division",
        "office",
        "bureau",
        "county",
        "city"
      ].includes(x)
    );

  if (!meaningful.length) return false;

  return meaningful.some(x => right.has(x));
}

const sourceImports = readJson(
  "public/data/clients/black_dragon/authentication/source_import/validated/validated_source_imports.v1.json"
);

const contactTemplate = readJson(
  "public/data/clients/black_dragon/authentication/contact_validation/contact_route_import_template.v1.json"
);

const imports =
  contactTemplate.contact_route_imports || [];

const sourceRecords =
  sourceImports.validated_source_imports || [];

const sourceMap =
  Object.fromEntries(
    sourceRecords.map(x => [x.entity_id, x])
  );

const validated = [];
const rejected = [];

for (const item of imports) {

  const source =
    sourceMap[item.entity_id];

  const checks = {
    source_record_exists:
      !!source,

    organization_name_match:
      !!source &&
      nameOverlap(
        source.organization_name,
        item.organization_name
      ),

    region_match:
      !!source &&
      sameRegion(
        source.region,
        item.region
      ),

    contact_route_present:
      !!item.contact_route,

    contact_route_not_placeholder:
      !hasPlaceholder(item.contact_route),

    contact_page_valid:
      !item.contact_page_url ||
      validUrl(item.contact_page_url),

    email_valid:
      !item.contact_email ||
      validEmail(item.contact_email),

    phone_valid:
      !item.contact_phone ||
      validPhone(item.contact_phone),

    at_least_one_contact_method:
      !!(
        item.contact_email ||
        item.contact_phone ||
        item.contact_page_url
      ),

    generated_contact_blocked:
      !hasPlaceholder(
        `${item.contact_email || ""} ${item.contact_phone || ""} ${item.contact_page_url || ""}`
      )
  };

  const pass =
    Object.values(checks).every(Boolean);

  const record = {
    ...item,

    validation_checks:
      checks,

    validation_status:
      pass
        ? "CONTACT_ROUTE_VALIDATED"
        : "CONTACT_ROUTE_REJECTED",

    contact_route_verified:
      pass,

    outreach_allowed:
      false,

    contact_ready:
      false,

    validated_at:
      new Date().toISOString()
  };

  if (pass) validated.push(record);
  else rejected.push(record);
}

const validatedPayload = {
  version:
    "black_dragon_validated_contact_routes_v1_batch_091",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  totals: {
    imported:
      imports.length,

    validated:
      validated.length,

    rejected:
      rejected.length
  },

  validated_contact_routes:
    validated
};

const rejectedPayload = {
  version:
    "black_dragon_rejected_contact_routes_v1_batch_091",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  totals: {
    imported:
      imports.length,

    validated:
      validated.length,

    rejected:
      rejected.length
  },

  rejected_contact_routes:
    rejected
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/contact_validation/validated/validated_contact_routes.v1.json"
  ),
  JSON.stringify(validatedPayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/contact_validation/rejected/rejected_contact_routes.v1.json"
  ),
  JSON.stringify(rejectedPayload, null, 2)
);

console.log(JSON.stringify({
  status:
    "CONTACT_ROUTE_VALIDATION_COMPLETE",

  totals:
    validatedPayload.totals
}, null, 2));
