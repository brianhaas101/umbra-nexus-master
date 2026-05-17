const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const raw = read(
  "public/data/clients/black_dragon/candidate_queue/los_angeles/raw/los_angeles_raw_candidates.json"
);

const validated = raw.candidates.map(candidate => ({
  ...candidate,

  quarantine_status:
    "QUARANTINED_PENDING_RUNTIME_REVIEW",

  runtime_visible:
    false,

  contact_ready:
    false,

  automated_outreach_allowed:
    false,

  runtime_promotion_allowed:
    false,

  validation_checks: {
    organization_name_present:
      !!candidate.organization_name,

    source_lineage_present:
      Array.isArray(candidate.source_lineage) &&
      candidate.source_lineage.length > 0,

    city_present:
      !!candidate.city,

    state_present:
      !!candidate.state
  }
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/candidate_queue/los_angeles/validated/los_angeles_validated_candidates.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_los_angeles_validated_candidates_v1",

  generated_at:
    new Date().toISOString(),

  validated_candidate_count:
    validated.length,

  validated_candidates:
    validated
}, null, 2), "utf8");

console.log(JSON.stringify({
  status:
    "LOS_ANGELES_VALIDATED_CANDIDATES_COMPLETE",

  validated_candidate_count:
    validated.length,

  output:
    out
}, null, 2));
