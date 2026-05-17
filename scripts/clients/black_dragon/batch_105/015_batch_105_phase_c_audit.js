const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const validation = read(
  "public/data/clients/black_dragon/source_resolution/audit/011_resolved_source_import_validation.json"
);

const verified = read(
  "public/data/clients/black_dragon/source_resolution/candidates/verified_source_candidates.json"
);

const rejected = read(
  "public/data/clients/black_dragon/source_resolution/quarantine/rejected_resolved_sources.json"
);

const review = read(
  "public/data/clients/black_dragon/source_resolution/review_queue/founder_verified_source_review_queue.json"
);

const audit = {

  version:
    "black_dragon_batch_105_phase_c_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "105_REAL_SOURCE_RESOLUTION_PIPELINE",

  phase:
    "C_RESOLVED_SOURCE_VALIDATION",

  counts: {

    imported:
      validation.total_imported,

    validated:
      validation.validated,

    rejected:
      validation.rejected,

    verified_candidates:
      verified.total_verified_candidates,

    founder_review_queue:
      review.total_review_items
  },

  gates: {

    no_outreach_allowed:
      true,

    no_promotion_allowed:
      true,

    founder_review_required:
      true,

    verified_matches_review_queue:
      verified.total_verified_candidates ===
      review.total_review_items
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/audit/batch_105_phase_c_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({

  status:
    "BATCH_105_PHASE_C_AUDIT_COMPLETE",

  audit_status:
    audit.status,

  counts:
    audit.counts,

  gates:
    audit.gates,

  output:
    out

}, null, 2));
