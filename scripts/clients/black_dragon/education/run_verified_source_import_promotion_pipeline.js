const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const operationalPath =
  "public/data/clients/black_dragon/education/source_discovery/source_discovery_operational_index.v1.json";

const importPath =
  "public/data/clients/black_dragon/education/source_discovery/imports/verified_source_imports.v1.json";

const promotionPath =
  "public/data/clients/black_dragon/education/source_discovery/promotions/source_discovery_promotions.v1.json";

const contactQueuePath =
  "public/data/clients/black_dragon/education/source_discovery/contact_queue/contact_discovery_queue.v1.json";

const operational =
  readJson(operationalPath);

const imports =
  readJson(importPath);

const targets =
  operational.operational_targets || [];

const records =
  imports.import_records || [];

const validDomainClasses = [
  "official_domain",
  "government_domain",
  "education_domain",
  "institutional_domain"
];

const promoted = [];
const blocked = [];

for (const target of targets) {

  const match =
    records.find(r =>
      r.entity_id === target.entity_id
    );

  if (!match) {
    blocked.push({
      entity_id:
        target.entity_id,

      reason:
        "NO_VERIFIED_IMPORT_RECORD"
    });

    continue;
  }

  const valid =
    match.validation_status === "SOURCE_DISCOVERED" &&
    typeof match.source_confidence === "number" &&
    match.source_confidence >= 0.75 &&
    !!match.source_url &&
    validDomainClasses.includes(match.domain_classification) &&
    !match.generated_email_detected &&
    !match.generated_phone_detected &&
    !match.placeholder_contact_detected &&
    !match.private_personal_data_detected;

  if (!valid) {

    blocked.push({
      entity_id:
        target.entity_id,

      reason:
        "FAILED_PROMOTION_VALIDATION"
    });

    continue;
  }

  promoted.push({
    entity_id:
      target.entity_id,

    organization_name:
      target.organization_name,

    source_url:
      match.source_url,

    source_type:
      match.source_type,

    domain_classification:
      match.domain_classification,

    source_confidence:
      match.source_confidence,

    source_discovery_status:
      "SOURCE_DISCOVERED",

    outreach_status:
      "OUTREACH_BLOCKED",

    contact_discovery_status:
      "CONTACT_DISCOVERY_PENDING",

    next_action:
      "MANUAL_CONTACT_ROUTE_DISCOVERY",

    forbidden_actions: [
      "NO_OUTREACH",
      "NO_AUTO_CONTACT",
      "NO_RESPONSE_GENERATION"
    ],

    promoted_at:
      new Date().toISOString()
  });
}

const promotionPayload = {
  version:
    "black_dragon_source_discovery_promotions_v1_batch_070",

  generated_at:
    new Date().toISOString(),

  totals: {
    import_records:
      records.length,

    promoted:
      promoted.length,

    blocked:
      blocked.length
  },

  promoted_records:
    promoted,

  blocked_records:
    blocked
};

const contactQueue = {
  version:
    "black_dragon_contact_discovery_queue_v1_batch_070",

  generated_at:
    new Date().toISOString(),

  totals: {
    queued:
      promoted.length,

    outreach_blocked:
      promoted.filter(x =>
        x.outreach_status === "OUTREACH_BLOCKED"
      ).length
  },

  contact_discovery_queue:
    promoted
};

fs.writeFileSync(
  path.resolve(promotionPath),
  JSON.stringify(promotionPayload, null, 2)
);

fs.writeFileSync(
  path.resolve(contactQueuePath),
  JSON.stringify(contactQueue, null, 2)
);

console.log(JSON.stringify({
  status:
    "SOURCE_IMPORT_PROMOTION_PIPELINE_COMPLETE",

  totals:
    promotionPayload.totals,

  output:
    promotionPath
}, null, 2));
