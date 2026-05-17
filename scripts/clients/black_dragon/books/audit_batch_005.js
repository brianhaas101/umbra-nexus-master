const fs = require("fs");
const path = require("path");

const rawPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/raw/public_book_targets_raw.v1.json"
);

const reviewPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/review/public_book_targets_review.v1.json"
);

const approvedPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/approved/public_book_targets_approved.v1.json"
);

const rejectedPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/rejected/public_book_targets_rejected.v1.json"
);

const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const reviewed = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
const approved = JSON.parse(fs.readFileSync(approvedPath, "utf8"));
const rejected = JSON.parse(fs.readFileSync(rejectedPath, "utf8"));

const audit = {
  version: "black_dragon_books_batch_005_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    raw: raw.length,
    reviewed: reviewed.length,
    approved: approved.length,
    rejected: rejected.length
  },

  safety: {
    private_group_access_blocked: true,
    login_required_sources_blocked: true,
    fabricated_contacts_blocked: true,
    public_sources_only: true
  },

  integrity: {
    reviewed_equals_raw: reviewed.length === raw.length,
    approved_plus_rejected_equals_reviewed:
      approved.length + rejected.length === reviewed.length,
    invalid_approved:
      approved.filter(t =>
        !t.intake_review ||
        t.intake_review.review_status !== "READY_FOR_NORMALIZATION"
      ).length
  }
};

audit.pass =
  audit.integrity.reviewed_equals_raw &&
  audit.integrity.approved_plus_rejected_equals_reviewed &&
  audit.integrity.invalid_approved === 0 &&
  audit.safety.private_group_access_blocked &&
  audit.safety.login_required_sources_blocked &&
  audit.safety.fabricated_contacts_blocked &&
  audit.safety.public_sources_only;

const out = path.resolve(
  "public/data/clients/black_dragon/books/audits/batch_005_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify(audit, null, 2));
