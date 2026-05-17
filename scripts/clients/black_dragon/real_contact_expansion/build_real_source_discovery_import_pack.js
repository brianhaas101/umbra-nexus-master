const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const queue = readJson(
  "public/data/clients/black_dragon/real_contact_expansion/seed_queues/national/real_public_source_discovery_seed_queue.v1.json"
);

const tasks =
  queue.discoveryTasks || queue.discovery_tasks || [];

const packRows = tasks.map((x, index) => ({
  import_row_id:
    `BD_SOURCE_IMPORT_ROW_${String(index + 1).padStart(6, "0")}`,

  discovery_task_id:
    x.discovery_task_id,

  client_id:
    "black_dragon",

  category:
    x.category,

  target_type:
    x.target_type,

  source_type:
    x.source_type,

  organization_seed:
    x.organization_seed,

  city:
    x.city,

  region:
    x.region,

  country:
    x.country || "USA",

  search_query:
    x.search_query,

  source_url:
    "",

  source_title:
    "",

  discovered_organization_name:
    "",

  contact_route:
    "",

  contact_route_type:
    "",

  contact_person_or_role:
    "",

  lat:
    "",

  lon:
    "",

  founder_review_notes:
    "",

  import_status:
    "AWAITING_REAL_SOURCE_INPUT",

  forbidden:
    "NO_PLACEHOLDERS_NO_GENERATED_CONTACTS_NO_PRIVATE_PERSONAL_DATA"
}));

const payload = {
  version:
    "black_dragon_real_source_discovery_import_pack_v1_batch_103",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  policy:
    "FOUNDER_MUST_FILL_REAL_SOURCE_FIELDS_BEFORE_IMPORT",

  totals: {
    import_rows:
      packRows.length,

    source_urls_filled:
      packRows.filter(x => !!x.source_url).length,

    contact_routes_filled:
      packRows.filter(x => !!x.contact_route).length,

    ready_for_import:
      0
  },

  required_to_import: [
    "source_url",
    "source_title",
    "discovered_organization_name",
    "contact_route",
    "contact_route_type",
    "lat",
    "lon"
  ],

  allowed_contact_route_types: [
    "EMAIL",
    "PHONE",
    "CONTACT_PAGE",
    "PUBLIC_ROLE_FORM"
  ],

  import_rows:
    packRows
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/real_contact_expansion/source_packs/json/real_source_discovery_import_pack.v1.json"
  ),
  JSON.stringify(payload, null, 2)
);

const headers = [
  "import_row_id",
  "discovery_task_id",
  "category",
  "target_type",
  "source_type",
  "organization_seed",
  "city",
  "region",
  "country",
  "search_query",
  "source_url",
  "source_title",
  "discovered_organization_name",
  "contact_route",
  "contact_route_type",
  "contact_person_or_role",
  "lat",
  "lon",
  "founder_review_notes",
  "import_status",
  "forbidden"
];

const lines = [headers.join(",")];

for (const row of packRows) {
  lines.push(
    headers.map(h => {
      const safe = String(row[h] ?? "").replace(/"/g, '""');
      return `"${safe}"`;
    }).join(",")
  );
}

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/real_contact_expansion/source_packs/csv/real_source_discovery_import_pack.csv"
  ),
  lines.join("\n")
);

console.log(JSON.stringify({
  status:
    "REAL_SOURCE_DISCOVERY_IMPORT_PACK_CREATED",

  totals:
    payload.totals,

  outputs: [
    "public/data/clients/black_dragon/real_contact_expansion/source_packs/json/real_source_discovery_import_pack.v1.json",
    "public/data/clients/black_dragon/real_contact_expansion/source_packs/csv/real_source_discovery_import_pack.csv"
  ]
}, null, 2));
