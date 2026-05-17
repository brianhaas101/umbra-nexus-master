const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(
    fs.readFileSync(path.resolve(file), "utf8")
  );
}

const seeds =
  readJson(
    "public/data/clients/black_dragon/education/seed_targets/education_seed_targets.v1.json"
  );

const operational =
  readJson(
    "public/data/clients/black_dragon/education/operational/education_operational_seed_index.v1.json"
  );

const seedTargets =
  seeds.seed_targets || [];

const operationalTargets =
  operational.operational_seed_targets || [];

const audit = {
  version:
    "umbra_batch_066_education_seed_target_audit_v1",

  generated_at:
    new Date().toISOString(),

  seed_integrity: {
    states:
      seeds.totals.states,

    source_categories:
      seeds.totals.source_categories,

    seed_targets:
      seedTargets.length,

    expected_seed_count:
      seeds.totals.states * seeds.totals.source_categories,

    no_outreach_allowed:
      seedTargets.every(x =>
        x.outreach_allowed === false
      ),

    all_seed_unverified:
      seedTargets.every(x =>
        x.source_status === "SEED_UNVERIFIED" &&
        x.verification_status === "NEEDS_SOURCE_DISCOVERY"
      ),

    no_fake_contacts:
      seedTargets.every(x =>
        !x.contact_email &&
        !x.contact_phone &&
        x.contact_status === "NO_CONTACT_ATTACHED"
      ),

    all_client_scoped:
      seedTargets.every(x =>
        x.client_id === "black_dragon"
      )
  },

  operational_integrity: {
    operational_targets:
      operationalTargets.length,

    all_have_entity_id:
      operationalTargets.every(x =>
        !!x.entity_id
      ),

    all_review_required:
      operationalTargets.every(x =>
        x.operational_status === "SEED_REVIEW_REQUIRED"
      ),

    all_blocked_from_outreach:
      operationalTargets.every(x =>
        x.outreach_allowed === false
      ),

    all_have_next_action:
      operationalTargets.every(x =>
        x.next_action === "DISCOVER_PUBLIC_SOURCE"
      ),

    all_have_required_before_outreach:
      operationalTargets.every(x =>
        Array.isArray(x.required_before_outreach) &&
        x.required_before_outreach.length >= 4
      )
  }
};

audit.pass =
  audit.seed_integrity.states === 50 &&
  audit.seed_integrity.source_categories >= 12 &&
  audit.seed_integrity.seed_targets === audit.seed_integrity.expected_seed_count &&
  audit.seed_integrity.no_outreach_allowed &&
  audit.seed_integrity.all_seed_unverified &&
  audit.seed_integrity.no_fake_contacts &&
  audit.seed_integrity.all_client_scoped &&
  audit.operational_integrity.operational_targets === audit.seed_integrity.seed_targets &&
  audit.operational_integrity.all_have_entity_id &&
  audit.operational_integrity.all_review_required &&
  audit.operational_integrity.all_blocked_from_outreach &&
  audit.operational_integrity.all_have_next_action &&
  audit.operational_integrity.all_have_required_before_outreach;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/education/audit/batch_066_education_seed_target_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
