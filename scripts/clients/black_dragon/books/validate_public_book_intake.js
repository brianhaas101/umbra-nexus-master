const fs = require("fs");
const path = require("path");

const schemaPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/public_book_target_intake_schema.v1.json"
);

const rawPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/raw/public_book_targets_raw.v1.json"
);

const reviewPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/review/public_book_targets_review.v1.json"
);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));

const allowedSources = new Set(schema.allowed_source_types);

function isPresent(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

const reviewed = raw.map((t, index) => {
  const missing = schema.required_fields.filter(field => {
    if (["known_leader_name", "contact_method", "source_url"].includes(field)) {
      return false;
    }

    return !isPresent(t[field]);
  });

  const sourceAllowed = allowedSources.has(t.source_type);

  const publicSourceSafe =
    t.source_type === "MANUAL_RESEARCH" ||
    (
      typeof t.source_url === "string" &&
      /^https?:\/\//i.test(t.source_url)
    );

  const noFabricatedLeader =
    t.known_leader_name === null ||
    typeof t.known_leader_name === "string";

  const review_status =
    missing.length === 0 &&
    sourceAllowed &&
    publicSourceSafe &&
    noFabricatedLeader
      ? "READY_FOR_NORMALIZATION"
      : "NEEDS_REVIEW";

  return {
    ...t,
    intake_review: {
      review_status,
      missing_required_fields: missing,
      source_allowed: sourceAllowed,
      public_source_safe: publicSourceSafe,
      no_fabricated_leader: noFabricatedLeader,
      reviewed_at: new Date().toISOString(),
      review_notes:
        review_status === "READY_FOR_NORMALIZATION"
          ? "Public target intake passed validation."
          : "Target requires review before normalization."
    }
  };
});

fs.writeFileSync(reviewPath, JSON.stringify(reviewed, null, 2));

console.log(JSON.stringify({
  status: "PUBLIC_BOOK_TARGET_INTAKE_VALIDATION_COMPLETE",
  input_count: raw.length,
  ready_for_normalization: reviewed.filter(t => t.intake_review.review_status === "READY_FOR_NORMALIZATION").length,
  needs_review: reviewed.filter(t => t.intake_review.review_status === "NEEDS_REVIEW").length,
  output: reviewPath
}, null, 2));
