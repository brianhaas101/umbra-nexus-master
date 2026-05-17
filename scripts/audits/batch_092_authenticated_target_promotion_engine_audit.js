const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const manualTemplate = readJson(
  "public/data/clients/black_dragon/authentication/promotion/manual_review_import_template.v1.json"
);

const eligible = readJson(
  "public/data/clients/black_dragon/authentication/promotion/eligible/contact_ready_targets.v1.json"
);

const blocked = readJson(
  "public/data/clients/black_dragon/authentication/promotion/blocked/blocked_promotion_candidates.v1.json"
);

const contactReady =
  eligible.contact_ready_targets || [];

const blockedRecords =
  blocked.blocked_promotion_candidates || [];

const audit = {
  version:
    "umbra_batch_092_authenticated_target_promotion_engine_audit_v1",

  generated_at:
    new Date().toISOString(),

  template_integrity: {
    manual_review_template_exists:
      !!manualTemplate,

    manual_reviews_array_exists:
      Array.isArray(manualTemplate.manual_reviews),

    manual_reviews_empty_initially:
      manualTemplate.manual_reviews.length === 0
  },

  promotion_integrity: {
    processed:
      eligible.totals.processed,

    eligible:
      eligible.totals.eligible,

    blocked:
      eligible.totals.blocked,

    counts_match:
      eligible.totals.processed ===
      eligible.totals.eligible + eligible.totals.blocked,

    all_contact_ready_targets_valid:
      contactReady.every(x =>
        x.contact_ready === true &&
        x.outreach_allowed === true &&
        x.promotion_status === "PROMOTED_CONTACT_READY"
      ),

    all_blocked_targets_blocked:
      blockedRecords.every(x =>
        x.contact_ready === false &&
        x.outreach_allowed === false &&
        x.promotion_status === "BLOCKED_PENDING_AUTHENTICATION"
      )
  },

  safety_integrity: {
    no_auto_promotion_initially:
      eligible.totals.eligible === 0,

    all_candidates_blocked_initially:
      blocked.totals.blocked === blocked.totals.processed,

    no_contact_ready_without_manual_review:
      contactReady.every(x =>
        x.manual_review &&
        x.manual_review.reviewer_decision === "APPROVED"
      ),

    no_outreach_without_promotion:
      blockedRecords.every(x => x.outreach_allowed === false)
  }
};

audit.pass =
  audit.template_integrity.manual_review_template_exists &&
  audit.template_integrity.manual_reviews_array_exists &&
  audit.template_integrity.manual_reviews_empty_initially &&
  audit.promotion_integrity.processed === 637 &&
  audit.promotion_integrity.eligible === 0 &&
  audit.promotion_integrity.blocked === 637 &&
  audit.promotion_integrity.counts_match &&
  audit.promotion_integrity.all_contact_ready_targets_valid &&
  audit.promotion_integrity.all_blocked_targets_blocked &&
  audit.safety_integrity.no_auto_promotion_initially &&
  audit.safety_integrity.all_candidates_blocked_initially &&
  audit.safety_integrity.no_contact_ready_without_manual_review &&
  audit.safety_integrity.no_outreach_without_promotion;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/authentication/promotion/audit/batch_092_authenticated_target_promotion_engine_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
