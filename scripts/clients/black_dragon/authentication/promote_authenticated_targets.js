const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const candidates = readJson(
  "public/data/clients/black_dragon/authentication/verified_runtime/verified_runtime_candidates.v1.json"
);

const validatedSources = readJson(
  "public/data/clients/black_dragon/authentication/source_import/validated/validated_source_imports.v1.json"
);

const validatedContacts = readJson(
  "public/data/clients/black_dragon/authentication/contact_validation/validated/validated_contact_routes.v1.json"
);

const manualTemplate = readJson(
  "public/data/clients/black_dragon/authentication/promotion/manual_review_import_template.v1.json"
);

const entities =
  candidates.verified_runtime_candidates || [];

const sourceMap =
  Object.fromEntries(
    (validatedSources.validated_source_imports || []).map(x => [x.entity_id, x])
  );

const contactMap =
  Object.fromEntries(
    (validatedContacts.validated_contact_routes || []).map(x => [x.entity_id, x])
  );

const manualMap =
  Object.fromEntries(
    (manualTemplate.manual_reviews || []).map(x => [x.entity_id, x])
  );

const eligible = [];
const blocked = [];

for (const entity of entities) {

  const source =
    sourceMap[entity.entity_id] || null;

  const contact =
    contactMap[entity.entity_id] || null;

  const review =
    manualMap[entity.entity_id] || null;

  const checks = {

    not_quarantined:
      entity.quarantine_status === "NOT_QUARANTINED",

    official_source_validated:
      !!source &&
      source.validation_status === "SOURCE_IMPORT_VALIDATED",

    contact_route_validated:
      !!contact &&
      contact.validation_status === "CONTACT_ROUTE_VALIDATED" &&
      contact.contact_route_verified === true,

    manual_review_approved:
      !!review &&
      review.reviewer_decision === "APPROVED" &&
      review.manual_review_pass === true,

    no_generated_contact:
      !/example\.com|test\.com|fake|placeholder|sample/i.test(
        `${contact?.contact_email || ""} ${contact?.contact_phone || ""} ${contact?.contact_page_url || ""}`
      ),

    entity_client_scoped:
      entity.client_id === "black_dragon"
  };

  const pass =
    Object.values(checks).every(Boolean);

  const promotedRecord = {

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
      entity.region,

    country:
      entity.country || "USA",

    source_url:
      source?.source_url || null,

    source_type:
      source?.source_type || null,

    source_title:
      source?.source_title || null,

    source_confidence:
      source?.source_confidence || null,

    contact_route:
      contact?.contact_route || null,

    contact_email:
      contact?.contact_email || null,

    contact_phone:
      contact?.contact_phone || null,

    contact_page_url:
      contact?.contact_page_url || null,

    manual_review:
      review || null,

    promotion_checks:
      checks,

    promotion_status:
      pass
        ? "PROMOTED_CONTACT_READY"
        : "BLOCKED_PENDING_AUTHENTICATION",

    contact_ready:
      pass,

    outreach_allowed:
      pass,

    promoted_at:
      pass ? new Date().toISOString() : null
  };

  if (pass) {
    eligible.push(promotedRecord);
  } else {
    blocked.push(promotedRecord);
  }
}

const eligiblePayload = {
  version:
    "black_dragon_authenticated_contact_ready_targets_v1_batch_092",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  promotion_policy:
    "ONLY_FULLY_AUTHENTICATED_SOURCE_CONTACT_MANUAL_REVIEW_RECORDS_CAN_PROMOTE",

  totals: {
    eligible:
      eligible.length,

    blocked:
      blocked.length,

    processed:
      eligible.length + blocked.length
  },

  contact_ready_targets:
    eligible
};

const blockedPayload = {
  version:
    "black_dragon_blocked_promotion_candidates_v1_batch_092",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  totals: {
    eligible:
      eligible.length,

    blocked:
      blocked.length,

    processed:
      eligible.length + blocked.length
  },

  blocked_promotion_candidates:
    blocked
};

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/promotion/eligible/contact_ready_targets.v1.json"
  ),
  JSON.stringify(eligiblePayload, null, 2)
);

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/promotion/blocked/blocked_promotion_candidates.v1.json"
  ),
  JSON.stringify(blockedPayload, null, 2)
);

console.log(JSON.stringify({
  status:
    "AUTHENTICATED_TARGET_PROMOTION_ENGINE_COMPLETE",

  totals:
    eligiblePayload.totals
}, null, 2));
