const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const classification = readJson(
  "public/data/clients/black_dragon/authentication/classification/authentication_gap_classification.v1.json"
);

const records = classification.classified_entities || [];

const sum =
  classification.totals.verified_public_source_found +
  classification.totals.contact_route_required +
  classification.totals.authentication_pending +
  classification.totals.synthetic_expansion_placeholders +
  classification.totals.reject_requires_real_entity;

const audit = {
  version:
    "umbra_batch_087_authentication_gap_classifier_audit_v1",

  generated_at:
    new Date().toISOString(),

  count_integrity: {
    total_entities:
      classification.totals.total_entities,

    bucket_sum:
      sum,

    counts_match:
      sum === classification.totals.total_entities
  },

  classification_integrity: {
    all_have_classification:
      records.every(x => !!x.authentication_gap_classification),

    all_have_actions:
      records.every(x => !!x.authentication_gap_action),

    no_contact_ready:
      records.every(x => x.contact_ready === false),

    no_outreach_allowed:
      records.every(x => x.outreach_allowed === false),

    all_have_strict_policy:
      records.every(x =>
        x.strict_authentication_policy &&
        x.strict_authentication_policy.requires_official_public_source === true &&
        x.strict_authentication_policy.requires_verified_contact_route === true &&
        x.strict_authentication_policy.requires_manual_review === true &&
        x.strict_authentication_policy.generated_contacts_forbidden === true
      )
  },

  safety_integrity: {
    synthetic_placeholders_identified:
      classification.totals.synthetic_expansion_placeholders > 0,

    authentication_pending_identified:
      classification.totals.authentication_pending > 0,

    contact_ready_zero:
      classification.totals.contact_ready === 0,

    outreach_allowed_zero:
      classification.totals.outreach_allowed === 0
  }
};

audit.pass =
  audit.count_integrity.total_entities >= 1000 &&
  audit.count_integrity.counts_match &&
  audit.classification_integrity.all_have_classification &&
  audit.classification_integrity.all_have_actions &&
  audit.classification_integrity.no_contact_ready &&
  audit.classification_integrity.no_outreach_allowed &&
  audit.classification_integrity.all_have_strict_policy &&
  audit.safety_integrity.synthetic_placeholders_identified &&
  audit.safety_integrity.authentication_pending_identified &&
  audit.safety_integrity.contact_ready_zero &&
  audit.safety_integrity.outreach_allowed_zero;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/classification/audit/batch_087_authentication_gap_classifier_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
