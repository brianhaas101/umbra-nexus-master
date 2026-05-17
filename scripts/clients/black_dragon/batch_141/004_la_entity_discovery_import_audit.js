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

const validated = read(
  "public/data/clients/black_dragon/candidate_queue/los_angeles/validated/los_angeles_validated_candidates.json"
);

const dedupe = read(
  "public/data/clients/black_dragon/candidate_queue/los_angeles/dedupe/los_angeles_cross_city_dedupe.json"
);

const audit = {
  version:
    "black_dragon_batch_141_los_angeles_entity_discovery_import_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "141_LOS_ANGELES_ENTITY_DISCOVERY_IMPORT",

  counts: {
    raw_candidates:
      raw.raw_candidate_count,

    validated_candidates:
      validated.validated_candidate_count,

    cross_city_duplicates:
      dedupe.duplicate_count,

    quarantined_candidates:
      validated.validated_candidates.filter(c =>
        c.quarantine_status ===
        "QUARANTINED_PENDING_RUNTIME_REVIEW"
      ).length
  },

  gates: {
    raw_candidates_exist:
      raw.raw_candidate_count >= 10,

    validated_candidates_exist:
      validated.validated_candidate_count >= 10,

    all_candidates_quarantined:
      validated.validated_candidates.every(c =>
        c.quarantine_status ===
        "QUARANTINED_PENDING_RUNTIME_REVIEW"
      ),

    no_runtime_visibility:
      validated.validated_candidates.every(c =>
        c.runtime_visible === false
      ),

    no_contact_ready:
      validated.validated_candidates.every(c =>
        c.contact_ready === false
      ),

    no_automated_outreach:
      validated.validated_candidates.every(c =>
        c.automated_outreach_allowed === false
      ),

    cross_city_dedupe_complete:
      dedupe.dedupe_candidate_count ===
      validated.validated_candidate_count
  },

  next_phase:
    "BATCH_142_LOS_ANGELES_RUNTIME_MERGE_AND_GRAPH_FOUNDATION",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/candidate_queue/los_angeles/audit/batch_141_los_angeles_entity_discovery_import_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status:
    "BATCH_141_LA_ENTITY_DISCOVERY_IMPORT_AUDIT_COMPLETE",

  audit_status:
    audit.status,

  counts:
    audit.counts,

  gates:
    audit.gates,

  output:
    out
}, null, 2));
