const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

function isValidUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const u = new URL(value);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

const queue = readJson(
  "public/data/clients/black_dragon/authentication/source_discovery/queues/verified_source_discovery_queue.v1.json"
);

const tasks = queue.discovery_tasks || [];

const staged = tasks
  .filter(x =>
    x.public_source_present === true &&
    isValidUrl(x.original_source_url)
  )
  .map(x => ({
    entity_id: x.entity_id,
    organization_name: x.organization_name,
    region: x.region,
    source_url: x.original_source_url,
    source_type: "PUBLIC_SOURCE_EXISTING",
    source_title: x.organization_name,
    source_confidence: 0.80,
    contact_route: null,
    staged_from: "verified_source_discovery_queue.v1.json",
    manual_review_required: true,
    contact_route_required: true
  }));

const notStageable = tasks
  .filter(x =>
    !(x.public_source_present === true && isValidUrl(x.original_source_url))
  )
  .map(x => ({
    entity_id: x.entity_id,
    organization_name: x.organization_name,
    region: x.region,
    reason: "NO_VALID_SOURCE_URL_PRESENT",
    public_source_present: x.public_source_present,
    original_source_url: x.original_source_url || null
  }));

const payload = {
  version: "black_dragon_existing_public_source_staging_v1_batch_095",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon",
  policy: "ONLY_EXISTING_VALID_HTTP_PUBLIC_SOURCE_URLS_ARE_STAGED",
  totals: {
    retained_entities: tasks.length,
    staged_source_imports: staged.length,
    not_stageable: notStageable.length,
    contact_ready: 0,
    outreach_allowed: 0
  },
  source_imports: staged,
  not_stageable: notStageable
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/authentication/source_staging/imports/staged_real_source_imports.v1.json"),
  JSON.stringify(payload, null, 2)
);

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/authentication/source_import/imports/real_source_import_template.v1.json"),
  JSON.stringify({
    version: "black_dragon_real_source_import_template_v1_batch_095_prefilled",
    generated_at: new Date().toISOString(),
    policy: "ONLY_OFFICIAL_OR_PUBLIC_VERIFIABLE_SOURCES_CAN_BE_IMPORTED",
    required_fields: [
      "entity_id",
      "organization_name",
      "region",
      "source_url",
      "source_type",
      "source_title",
      "source_confidence",
      "contact_route"
    ],
    source_imports: staged
  }, null, 2)
);

console.log(JSON.stringify({
  status: "REAL_SOURCE_STAGING_COMPLETE",
  totals: payload.totals,
  next: "Run validate_real_source_imports.js then batch_090 audit."
}, null, 2));
