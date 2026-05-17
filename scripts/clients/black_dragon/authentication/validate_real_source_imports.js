const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function safeUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function norm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasNameOverlap(a, b) {
  const left = norm(a).split(" ").filter(Boolean);
  const right = new Set(norm(b).split(" ").filter(Boolean));

  if (!left.length || !right.size) return false;

  const meaningful = left.filter(x =>
    x.length >= 3 &&
    !["the", "and", "for", "office", "department", "division"].includes(x)
  );

  if (!meaningful.length) return false;

  return meaningful.some(x => right.has(x));
}

function validContactRoute(route) {
  if (!route) return false;

  const value = String(route).trim();

  if (!value) return false;

  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return true;
  if (/^https?:\/\//i.test(value)) return safeUrl(value);
  if (/^\+?1?[\s().-]*\d{3}[\s().-]*\d{3}[\s().-]*\d{4}$/.test(value)) return true;

  return false;
}

const queue = readJson(
  "public/data/clients/black_dragon/authentication/source_discovery/queues/verified_source_discovery_queue.v1.json"
);

const template = readJson(
  "public/data/clients/black_dragon/authentication/source_import/imports/real_source_import_template.v1.json"
);

const tasks = queue.discovery_tasks || [];
const imports = template.source_imports || [];

const byEntity = Object.fromEntries(
  tasks.map(x => [x.entity_id, x])
);

const validated = [];
const rejected = [];

for (const item of imports) {
  const task = byEntity[item.entity_id];

  const checks = {
    entity_exists:
      !!task,

    organization_name_match:
      !!task && hasNameOverlap(task.organization_name, item.organization_name),

    region_match:
      !!task && norm(task.region) === norm(item.region),

    source_url_valid:
      safeUrl(item.source_url),

    source_type_present:
      !!item.source_type,

    source_title_present:
      !!item.source_title,

    source_confidence_valid:
      typeof item.source_confidence === "number" &&
      item.source_confidence >= 0.75 &&
      item.source_confidence <= 1,

    contact_route_valid:
      validContactRoute(item.contact_route),

    generated_contact_blocked:
      !/example\.com|test\.com|fake|placeholder|sample/i.test(
        `${item.contact_route || ""} ${item.source_url || ""}`
      )
  };

  const pass =
    Object.values(checks).every(Boolean);

  const record = {
    ...item,
    validation_checks: checks,
    validation_status: pass ? "SOURCE_IMPORT_VALIDATED" : "SOURCE_IMPORT_REJECTED",
    validated_at: new Date().toISOString()
  };

  if (pass) validated.push(record);
  else rejected.push(record);
}

const validatedPayload = {
  version:
    "black_dragon_validated_source_imports_v1_batch_090",

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

  validated_source_imports:
    validated
};

const rejectedPayload = {
  version:
    "black_dragon_rejected_source_imports_v1_batch_090",

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

  rejected_source_imports:
    rejected
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/source_import/validated/validated_source_imports.v1.json"
  ),
  JSON.stringify(validatedPayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/source_import/rejected/rejected_source_imports.v1.json"
  ),
  JSON.stringify(rejectedPayload, null, 2)
);

console.log(JSON.stringify({
  status: "REAL_SOURCE_IMPORT_VALIDATION_COMPLETE",
  totals: validatedPayload.totals
}, null, 2));
