const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const retainedRuntime = readJson(
  "public/data/clients/black_dragon/authentication/verified_runtime/verified_runtime_candidates.v1.json"
);

const retained =
  retainedRuntime.verified_runtime_candidates || [];

function normalizeRegion(region) {
  const r = String(region || "UNKNOWN").trim();
  const map = {
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Florida: "FL",
    Georgia: "GA",
    Indiana: "IN",
    Iowa: "IA"
  };
  return map[r] || r;
}

function makeOfficialQuery(entity) {
  const name = String(entity.organization_name || "").trim();
  const region = normalizeRegion(entity.region);
  return `${name} ${region} official website`;
}

function makeContactQuery(entity) {
  const name = String(entity.organization_name || "").trim();
  const region = normalizeRegion(entity.region);
  return `${name} ${region} contact official`;
}

function sourceStatus(entity) {
  if (entity.authentication_status === "PUBLIC_SOURCE_FOUND") {
    return "SOURCE_PRESENT_REQUIRES_VALIDATION";
  }

  if (entity.authentication_status === "AUTHENTICATION_PENDING") {
    return "SOURCE_DISCOVERY_REQUIRED";
  }

  return "SOURCE_REVIEW_REQUIRED";
}

const discoveryTasks = retained.map((entity, index) => {
  const status = sourceStatus(entity);

  return {
    discovery_task_id:
      `BD_SRC_DISC_${String(index + 1).padStart(6, "0")}`,

    entity_id:
      entity.entity_id,

    client_id:
      "black_dragon",

    organization_name:
      entity.organization_name,

    organization_type:
      entity.organization_type,

    city:
      entity.city || null,

    region:
      normalizeRegion(entity.region),

    original_region:
      entity.region,

    country:
      entity.country || "USA",

    authentication_status:
      entity.authentication_status,

    source_discovery_status:
      status,

    original_source_url:
      entity.original_source_url || null,

    public_source_present:
      entity.public_source_present === true,

    source_validation_required:
      true,

    contact_route_validation_required:
      true,

    manual_review_required:
      true,

    official_source_query:
      makeOfficialQuery(entity),

    official_contact_query:
      makeContactQuery(entity),

    search_queries: [
      makeOfficialQuery(entity),
      makeContactQuery(entity),
      `${entity.organization_name} ${normalizeRegion(entity.region)} public records`,
      `${entity.organization_name} ${normalizeRegion(entity.region)} official contact`
    ],

    required_validation_checks: [
      "official_public_source_exists",
      "organization_name_match",
      "state_or_region_match",
      "source_is_not_generated",
      "contact_route_is_public",
      "manual_reviewer_approval"
    ],

    visual_review_status:
      "PENDING_VISUAL_REVIEW",

    contact_ready:
      false,

    outreach_allowed:
      false,

    blocked_reason:
      "Requires official source validation, public contact-route validation, and manual review before contact-ready promotion."
  };
});

const byRegion = {};

for (const task of discoveryTasks) {
  if (!byRegion[task.region]) {
    byRegion[task.region] = [];
  }

  byRegion[task.region].push(task);
}

const regionQueues = Object.entries(byRegion)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([region, tasks]) => ({
    region,
    count: tasks.length,
    public_source_found:
      tasks.filter(x => x.authentication_status === "PUBLIC_SOURCE_FOUND").length,
    authentication_pending:
      tasks.filter(x => x.authentication_status === "AUTHENTICATION_PENDING").length,
    contact_ready:
      tasks.filter(x => x.contact_ready === true).length,
    outreach_allowed:
      tasks.filter(x => x.outreach_allowed === true).length,
    tasks
  }));

const visualRows = discoveryTasks.map((task, index) => ({
  row_id:
    `BD_VISUAL_REVIEW_ROW_${String(index + 1).padStart(6, "0")}`,

  entity_id:
    task.entity_id,

  organization_name:
    task.organization_name,

  organization_type:
    task.organization_type,

  city:
    task.city,

  region:
    task.region,

  authentication_status:
    task.authentication_status,

  source_discovery_status:
    task.source_discovery_status,

  visual_review_status:
    task.visual_review_status,

  source_url:
    task.original_source_url,

  contact_route:
    null,

  reviewer_decision:
    "PENDING",

  contact_ready:
    false,

  outreach_allowed:
    false
}));

const masterPayload = {
  version:
    "black_dragon_verified_source_discovery_queue_v1_batch_089",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  policy:
    "NO_VISUAL_CONFIRMATION_NO_CLIENT_ACCESS_NO_CONTACT_READY_PROMOTION",

  totals: {
    retained_entities:
      retained.length,

    discovery_tasks:
      discoveryTasks.length,

    region_queues:
      regionQueues.length,

    public_source_found:
      discoveryTasks.filter(x => x.authentication_status === "PUBLIC_SOURCE_FOUND").length,

    authentication_pending:
      discoveryTasks.filter(x => x.authentication_status === "AUTHENTICATION_PENDING").length,

    contact_ready:
      discoveryTasks.filter(x => x.contact_ready === true).length,

    outreach_allowed:
      discoveryTasks.filter(x => x.outreach_allowed === true).length
  },

  discovery_tasks:
    discoveryTasks
};

const visualManifest = {
  version:
    "black_dragon_visual_contact_review_manifest_v1_batch_089",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  access_policy:
    "BLACK_DRAGON_CLIENT_ACCESS_BLOCKED_UNTIL_VISUAL_REVIEW_COMPLETE",

  totals: {
    visual_rows:
      visualRows.length,

    pending_visual_review:
      visualRows.filter(x => x.visual_review_status === "PENDING_VISUAL_REVIEW").length,

    contact_ready:
      visualRows.filter(x => x.contact_ready === true).length,

    outreach_allowed:
      visualRows.filter(x => x.outreach_allowed === true).length
  },

  columns: [
    "organization_name",
    "organization_type",
    "city",
    "region",
    "authentication_status",
    "source_discovery_status",
    "source_url",
    "contact_route",
    "reviewer_decision",
    "contact_ready",
    "outreach_allowed"
  ],

  visual_review_rows:
    visualRows
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/source_discovery/queues/verified_source_discovery_queue.v1.json"
  ),
  JSON.stringify(masterPayload, null, 2)
);

for (const regionQueue of regionQueues) {
  fs.writeFileSync(
    path.resolve(
      `public/data/clients/black_dragon/authentication/source_discovery/queues/region_${regionQueue.region}_source_discovery_queue.v1.json`
    ),
    JSON.stringify({
      version: `black_dragon_region_${regionQueue.region}_source_discovery_queue_v1_batch_089`,
      generated_at: new Date().toISOString(),
      client_id: "black_dragon",
      region: regionQueue.region,
      count: regionQueue.count,
      public_source_found: regionQueue.public_source_found,
      authentication_pending: regionQueue.authentication_pending,
      contact_ready: regionQueue.contact_ready,
      outreach_allowed: regionQueue.outreach_allowed,
      tasks: regionQueue.tasks
    }, null, 2)
  );
}

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/source_discovery/visual/visual_contact_review_manifest.v1.json"
  ),
  JSON.stringify(visualManifest, null, 2)
);

console.log(JSON.stringify({
  status:
    "VERIFIED_SOURCE_DISCOVERY_QUEUE_CREATED",

  totals:
    masterPayload.totals,

  visual:
    visualManifest.totals,

  outputs: [
    "public/data/clients/black_dragon/authentication/source_discovery/queues/verified_source_discovery_queue.v1.json",
    "public/data/clients/black_dragon/authentication/source_discovery/visual/visual_contact_review_manifest.v1.json",
    "public/data/clients/black_dragon/authentication/source_discovery/queues/region_*_source_discovery_queue.v1.json"
  ]
}, null, 2));
