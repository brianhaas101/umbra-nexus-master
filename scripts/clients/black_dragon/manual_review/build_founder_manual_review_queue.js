const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const stagedContacts = readJson(
  "public/data/clients/black_dragon/authentication/contact_staging/imports/staged_contact_routes.v1.json"
);

const routes =
  stagedContacts.staged_contact_routes || [];

const reviewRows = routes.map((x, index) => ({
  manual_review_id:
    `BD_MANUAL_REVIEW_${String(index + 1).padStart(6, "0")}`,

  entity_id:
    x.entity_id,

  organization_name:
    x.organization_name,

  region:
    x.region,

  source_url:
    x.source_url,

  contact_route:
    x.contact_route,

  contact_email:
    x.contact_email || null,

  contact_phone:
    x.contact_phone || null,

  contact_page_url:
    x.contact_page_url || null,

  reviewer_decision:
    "PENDING",

  manual_review_pass:
    false,

  review_notes:
    null,

  founder_verified:
    false,

  outreach_allowed:
    false,

  contact_ready:
    false
}));

const payload = {
  version:
    "black_dragon_founder_manual_review_queue_v1_batch_097",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  founder_only:
    true,

  policy:
    "ONLY_FOUNDER_APPROVED_RECORDS_CAN_PROMOTE",

  totals: {
    review_rows:
      reviewRows.length,

    pending:
      reviewRows.filter(x =>
        x.reviewer_decision === "PENDING"
      ).length,

    approved:
      0,

    rejected:
      0
  },

  manual_review_rows:
    reviewRows
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/manual_review/exports/founder_manual_review_queue.v1.json"
  ),
  JSON.stringify(payload, null, 2)
);

const csv = [];

csv.push([
  "manual_review_id",
  "entity_id",
  "organization_name",
  "region",
  "source_url",
  "contact_route",
  "contact_email",
  "contact_phone",
  "contact_page_url",
  "reviewer_decision",
  "manual_review_pass",
  "review_notes"
].join(","));

for (const row of reviewRows) {

  const vals = [
    row.manual_review_id,
    row.entity_id,
    row.organization_name,
    row.region,
    row.source_url,
    row.contact_route,
    row.contact_email,
    row.contact_phone,
    row.contact_page_url,
    row.reviewer_decision,
    row.manual_review_pass,
    row.review_notes
  ];

  csv.push(
    vals.map(v => {
      const safe = String(v ?? "")
        .replace(/"/g, '""');
      return `"${safe}"`;
    }).join(",")
  );
}

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/manual_review/exports/founder_manual_review_queue.csv"
  ),
  csv.join("\n")
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/promotion/manual_review_import_template.v1.json"
  ),
  JSON.stringify({
    version:
      "black_dragon_manual_review_import_template_v1_batch_097_prefilled",

    generated_at:
      new Date().toISOString(),

    policy:
      "NO_PROMOTION_WITHOUT_MANUAL_REVIEW_APPROVAL",

    manual_reviews:
      reviewRows
  }, null, 2)
);

console.log(JSON.stringify({
  status:
    "FOUNDER_MANUAL_REVIEW_QUEUE_CREATED",

  totals:
    payload.totals,

  outputs: [
    "public/data/clients/black_dragon/manual_review/exports/founder_manual_review_queue.v1.json",
    "public/data/clients/black_dragon/manual_review/exports/founder_manual_review_queue.csv"
  ]
}, null, 2));
