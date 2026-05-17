const fs = require("fs");
const path = require("path");

const reviewPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/review/public_book_targets_review.v1.json"
);

const approvedPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/approved/public_book_targets_approved.v1.json"
);

const rejectedPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/rejected/public_book_targets_rejected.v1.json"
);

const reviewed = JSON.parse(fs.readFileSync(reviewPath, "utf8"));

const approved = reviewed.filter(t =>
  t.intake_review &&
  t.intake_review.review_status === "READY_FOR_NORMALIZATION"
);

const rejected = reviewed.filter(t =>
  !t.intake_review ||
  t.intake_review.review_status !== "READY_FOR_NORMALIZATION"
);

fs.writeFileSync(approvedPath, JSON.stringify(approved, null, 2));
fs.writeFileSync(rejectedPath, JSON.stringify(rejected, null, 2));

console.log(JSON.stringify({
  status: "PUBLIC_BOOK_TARGET_APPROVAL_BUILD_COMPLETE",
  reviewed: reviewed.length,
  approved: approved.length,
  rejected: rejected.length,
  approved_output: approvedPath,
  rejected_output: rejectedPath
}, null, 2));
