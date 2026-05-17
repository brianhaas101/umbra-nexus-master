const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const visualManifest = readJson(
  "public/data/clients/black_dragon/authentication/source_discovery/visual/visual_contact_review_manifest.v1.json"
);

const verifiedRuntime = readJson(
  "public/data/clients/black_dragon/authentication/verified_runtime/verified_runtime_candidates.v1.json"
);

const sourceQueue = readJson(
  "public/data/clients/black_dragon/authentication/source_discovery/queues/verified_source_discovery_queue.v1.json"
);

const rows =
  visualManifest.visual_review_rows || [];

const runtime =
  verifiedRuntime.verified_runtime_candidates || [];

const queue =
  sourceQueue.discovery_tasks || [];

const runtimeMap =
  Object.fromEntries(
    runtime.map(x => [x.entity_id, x])
  );

const queueMap =
  Object.fromEntries(
    queue.map(x => [x.entity_id, x])
  );

const founderRows = rows.map((row, index) => {

  const runtimeEntity =
    runtimeMap[row.entity_id] || {};

  const queueEntity =
    queueMap[row.entity_id] || {};

  return {

    founder_review_id:
      `BD_FOUNDER_REVIEW_${String(index + 1).padStart(6, "0")}`,

    entity_id:
      row.entity_id,

    organization_name:
      row.organization_name,

    organization_type:
      row.organization_type,

    city:
      row.city,

    region:
      row.region,

    authentication_status:
      row.authentication_status,

    source_discovery_status:
      row.source_discovery_status,

    source_url:
      row.source_url || null,

    public_source_present:
      queueEntity.public_source_present === true,

    visual_review_status:
      row.visual_review_status,

    reviewer_decision:
      row.reviewer_decision,

    contact_ready:
      row.contact_ready,

    outreach_allowed:
      row.outreach_allowed,

    quarantine_status:
      runtimeEntity.quarantine_status || "UNKNOWN",

    source_validation_required:
      queueEntity.source_validation_required === true,

    contact_route_validation_required:
      queueEntity.contact_route_validation_required === true,

    manual_review_required:
      queueEntity.manual_review_required === true,

    official_source_query:
      queueEntity.official_source_query || null,

    official_contact_query:
      queueEntity.official_contact_query || null,

    founder_action_required:
      "VISUAL_REVIEW_AND_REAL_SOURCE_CONFIRMATION_REQUIRED"
  };
});

const exportPayload = {
  version:
    "black_dragon_founder_visual_review_directory_v1_batch_094",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  founder_access_only:
    true,

  policy:
    "NO_CLIENT_ACCESS_UNTIL_FOUNDER_VISUAL_REVIEW_COMPLETES",

  totals: {
    founder_review_rows:
      founderRows.length,

    contact_ready:
      founderRows.filter(x => x.contact_ready === true).length,

    outreach_allowed:
      founderRows.filter(x => x.outreach_allowed === true).length,

    public_source_present:
      founderRows.filter(x => x.public_source_present === true).length,

    pending_visual_review:
      founderRows.filter(x =>
        x.reviewer_decision === "PENDING"
      ).length
  },

  founder_review_rows:
    founderRows
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/founder_review/exports/founder_visual_review_directory.v1.json"
  ),
  JSON.stringify(exportPayload, null, 2)
);

const csvRows = [];

csvRows.push([
  "entity_id",
  "organization_name",
  "organization_type",
  "city",
  "region",
  "authentication_status",
  "source_discovery_status",
  "public_source_present",
  "reviewer_decision",
  "contact_ready",
  "outreach_allowed",
  "official_source_query",
  "official_contact_query"
].join(","));

for (const row of founderRows) {

  const values = [
    row.entity_id,
    row.organization_name,
    row.organization_type,
    row.city,
    row.region,
    row.authentication_status,
    row.source_discovery_status,
    row.public_source_present,
    row.reviewer_decision,
    row.contact_ready,
    row.outreach_allowed,
    row.official_source_query,
    row.official_contact_query
  ];

  csvRows.push(
    values.map(v => {
      const safe = String(v ?? "")
        .replace(/"/g, '""');
      return `"${safe}"`;
    }).join(",")
  );
}

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/founder_review/exports/founder_visual_review_directory.csv"
  ),
  csvRows.join("\n")
);

console.log(JSON.stringify({
  status:
    "FOUNDER_VISUAL_REVIEW_DIRECTORY_EXPORT_COMPLETE",

  totals:
    exportPayload.totals,

  outputs: [
    "public/data/clients/black_dragon/founder_review/exports/founder_visual_review_directory.v1.json",
    "public/data/clients/black_dragon/founder_review/exports/founder_visual_review_directory.csv"
  ]
}, null, 2));
