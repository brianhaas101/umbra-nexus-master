const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const schema =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/education_source_discovery_schema.v1.json"
  );

const verification =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/verification/education_verification_schema.v1.json"
  );

const promotion =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/education_promotion_rules.v1.json"
  );

const operational =
  readJson(
    "public/data/clients/black_dragon/education/source_discovery/source_discovery_operational_index.v1.json"
  );

const targets =
  operational.operational_targets || [];

const audit = {
  version:
    "umbra_batch_067_source_discovery_scaffold_audit_v1",

  generated_at:
    new Date().toISOString(),

  schema_integrity: {
    statuses:
      schema.discovery_statuses.length >= 8,

    requires_real_sources:
      schema.verification_requirements.requires_real_public_source === true,

    forbids_fake_contacts:
      schema.verification_requirements.forbids_generated_contacts === true,

    requires_manual_review:
      schema.verification_requirements.requires_manual_review_before_outreach === true,

    required_public_sources:
      schema.required_public_sources.length >= 5
  },

  verification_integrity: {
    required_fields:
      verification.required_verification_fields.length >= 7,

    optional_fields:
      verification.optional_verification_fields.length >= 8,

    must_have_source_url:
      verification.verification_gates.must_have_source_url === true,

    blocks_unverified_outreach:
      verification.verification_gates.must_not_allow_outreach_without_verification === true
  },

  promotion_integrity: {
    promotion_states:
      Object.keys(
        promotion.promotion_rules || {}
      ).length >= 4,

    blocking_rules:
      Object.keys(
        promotion.blocking_rules || {}
      ).length >= 5
  },

  operational_integrity: {
    targets:
      targets.length,

    all_pending_discovery:
      targets.every(x =>
        x.source_discovery_status === "SOURCE_DISCOVERY_PENDING"
      ),

    all_outreach_blocked:
      targets.every(x =>
        x.outreach_status === "OUTREACH_BLOCKED"
      ),

    no_fake_contacts:
      targets.every(x =>
        !x.verified_contact_email &&
        !x.verified_contact_phone
      ),

    all_manual_review:
      targets.every(x =>
        x.requires_manual_review === true
      ),

    all_have_forbidden_actions:
      targets.every(x =>
        Array.isArray(x.forbidden_actions) &&
        x.forbidden_actions.length >= 4
      )
  }
};

audit.pass =
  audit.schema_integrity.statuses &&
  audit.schema_integrity.requires_real_sources &&
  audit.schema_integrity.forbids_fake_contacts &&
  audit.schema_integrity.requires_manual_review &&
  audit.schema_integrity.required_public_sources &&
  audit.verification_integrity.required_fields &&
  audit.verification_integrity.optional_fields &&
  audit.verification_integrity.must_have_source_url &&
  audit.verification_integrity.blocks_unverified_outreach &&
  audit.promotion_integrity.promotion_states &&
  audit.promotion_integrity.blocking_rules &&
  audit.operational_integrity.targets === 600 &&
  audit.operational_integrity.all_pending_discovery &&
  audit.operational_integrity.all_outreach_blocked &&
  audit.operational_integrity.no_fake_contacts &&
  audit.operational_integrity.all_manual_review &&
  audit.operational_integrity.all_have_forbidden_actions;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/education/source_discovery/audit/batch_067_source_discovery_scaffold_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
