const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const validation = read(
  "public/data/clients/black_dragon/contact_resolution/audit/007_official_contact_route_validation.json"
);

const candidates = read(
  "public/data/clients/black_dragon/contact_resolution/candidates/verified_contact_route_candidates.json"
);

const rejected = read(
  "public/data/clients/black_dragon/contact_resolution/quarantine/rejected_contact_routes.json"
);

const audit = {
  version: "black_dragon_batch_107_phase_b_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "107_OFFICIAL_CONTACT_ROUTE_RESOLUTION",
  phase: "B_CONTACT_ROUTE_IMPORT_VALIDATION",

  counts: {
    imported: validation.total_imported,
    validated: validation.validated,
    rejected: validation.rejected,
    verified_contact_routes: candidates.total_verified_contact_routes,
    quarantined_rejected_routes: rejected.total_rejected
  },

  gates: {
    validated_matches_candidates:
      validation.validated === candidates.total_verified_contact_routes,

    rejected_matches_quarantine:
      validation.rejected === rejected.total_rejected,

    no_outreach_allowed: true,
    no_promotion_allowed: true,
    founder_review_required: true
  },

  status:
    validation.validated === candidates.total_verified_contact_routes &&
    validation.rejected === rejected.total_rejected
      ? "PASS"
      : "REVIEW_REQUIRED"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/audit/batch_107_phase_b_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_107_PHASE_B_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
