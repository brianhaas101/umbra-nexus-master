const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const candidates = [
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json",
  "public/data/clients/black_dragon/black_dragon_pass3_expanded_targets.json",
  "public/data/clients/black_dragon/targets_master.json",
  "public/data/clients/black_dragon/targets_with_dossiers.json"
];

let sourceFile = null;
let sourcePayload = null;

for (const file of candidates) {
  if (fs.existsSync(path.resolve(file))) {
    const payload = readJson(file);

    const records =
      payload.targets ||
      payload.records ||
      payload.operational_targets ||
      payload.expanded_targets ||
      payload.items ||
      (Array.isArray(payload) ? payload : null);

    if (records && records.length) {
      sourceFile = file;
      sourcePayload = payload;
      break;
    }
  }
}

if (!sourceFile || !sourcePayload) {
  throw new Error("No authentication source dataset found.");
}

const records =
  sourcePayload.targets ||
  sourcePayload.records ||
  sourcePayload.operational_targets ||
  sourcePayload.expanded_targets ||
  sourcePayload.items ||
  sourcePayload;

const normalized = records.map((record, index) => {
  const name =
    record.organization_name ||
    record.target_name ||
    record.name ||
    record.label ||
    `UNKNOWN_TARGET_${String(index + 1).padStart(5, "0")}`;

  const region =
    record.region ||
    record.state ||
    record.state_abbr ||
    "UNKNOWN_REGION";

  const entityId =
    record.entity_id ||
    `BD_AUTH_ENTITY_${String(index + 1).padStart(6, "0")}`;

  return {
    auth_task_id:
      `BD_AUTH_TASK_${String(index + 1).padStart(6, "0")}`,

    entity_id:
      entityId,

    client_id:
      "black_dragon",

    module:
      "entity_authentication_v1",

    organization_name:
      String(name).trim(),

    target_name:
      String(record.target_name || name).trim(),

    organization_type:
      record.organization_type || "UNKNOWN",

    city:
      record.city || null,

    region:
      region,

    country:
      record.country || "USA",

    source_file:
      record.source_file || sourceFile,

    original_source_url:
      record.source_url || null,

    public_source_present:
      record.public_source_present === true || !!record.source_url,

    authentication_status:
      record.source_url ? "PUBLIC_SOURCE_FOUND" : "AUTHENTICATION_PENDING",

    contact_status:
      record.contact_status || "NO_CONTACT_ATTACHED",

    outreach_allowed:
      false,

    authentication_required:
      true,

    required_before_outreach: [
      "verify_public_source",
      "verify_organization_match",
      "verify_region_match",
      "verify_contact_route",
      "manual_review"
    ],

    forbidden_actions: [
      "NO_OUTREACH",
      "NO_AUTO_CONTACT",
      "NO_RESPONSE_GENERATION",
      "NO_QUEUE_INSERTION_UNTIL_AUTHENTICATED"
    ],

    search_queries: [
      `${name} ${region} official`,
      `${name} ${region} public safety official`,
      `${name} ${region} contact official`
    ],

    next_action:
      record.source_url
        ? "VALIDATE_EXISTING_PUBLIC_SOURCE"
        : "DISCOVER_PUBLIC_SOURCE",

    created_at:
      new Date().toISOString()
  };
});

const queue = {
  version:
    "black_dragon_entity_authentication_queue_v1_batch_086",

  generated_at:
    new Date().toISOString(),

  source_file:
    sourceFile,

  client_id:
    "black_dragon",

  module:
    "entity_authentication_v1",

  totals: {
    authentication_tasks:
      normalized.length,

    pending_authentication:
      normalized.filter(x =>
        x.authentication_status === "AUTHENTICATION_PENDING"
      ).length,

    public_source_found:
      normalized.filter(x =>
        x.authentication_status === "PUBLIC_SOURCE_FOUND"
      ).length,

    outreach_allowed:
      normalized.filter(x =>
        x.outreach_allowed === true
      ).length
  },

  authentication_tasks:
    normalized
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/authentication/queues/entity_authentication_queue.v1.json"),
  JSON.stringify(queue, null, 2)
);

console.log(JSON.stringify({
  status: "ENTITY_AUTHENTICATION_QUEUE_CREATED",
  source_file: sourceFile,
  totals: queue.totals
}, null, 2));
