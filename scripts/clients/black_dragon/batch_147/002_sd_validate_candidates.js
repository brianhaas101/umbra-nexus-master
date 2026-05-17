const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imports = read(
  "public/data/clients/black_dragon/candidate_queue/san_diego/imports/san_diego_discovery_import.json"
);

const validated = imports.imported_candidates.map(candidate => ({
  ...candidate,

  validation_status:
    candidate.source_lineage.length >= 2
      ? "VALIDATED"
      : "REVIEW_REQUIRED",

  source_lineage_verified:
    candidate.source_lineage.length >= 2,

  quarantine_status:
    "QUARANTINED_PENDING_DEDUPE",

  runtime_visible:
    false,

  contact_ready:
    false,

  automated_outreach_allowed:
    false,

  runtime_mutation_allowed:
    false
}));

const payload = {
  version: "black_dragon_san_diego_validated_candidates_v1",
  generated_at: new Date().toISOString(),

  city: "San Diego",
  state: "CA",

  validated_candidate_count: validated.length,

  validated_candidates: validated
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/candidate_queue/san_diego/validated/san_diego_validated_candidates.json"
);

fs.writeFileSync(out, JSON.stringify(payload, null, 2), "utf8");

console.log(JSON.stringify({
  status: "SAN_DIEGO_VALIDATED_CANDIDATES_COMPLETE",
  validated_candidates: payload.validated_candidate_count,
  output: out
}, null, 2));
