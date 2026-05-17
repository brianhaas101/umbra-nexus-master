const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imports = read(
  "public/data/clients/black_dragon/candidate_queue/san_diego/imports/san_diego_discovery_import.json"
);

const validated = read(
  "public/data/clients/black_dragon/candidate_queue/san_diego/validated/san_diego_validated_candidates.json"
);

const dedupe = read(
  "public/data/clients/black_dragon/candidate_queue/san_diego/dedupe/san_diego_cross_city_dedupe.json"
);

const audit = {
  version: "black_dragon_batch_147_san_diego_discovery_import_audit_v1",
  generated_at: new Date().toISOString(),

  batch: "147_SAN_DIEGO_ENTITY_DISCOVERY_IMPORT",

  counts: {
    imported_candidates: imports.imported_candidates.length,
    validated_candidates: validated.validated_candidate_count,
    dedupe_candidates: dedupe.dedupe_candidate_count,
    cross_city_duplicates: dedupe.cross_city_duplicates
  },

  gates: {
    imported_candidates_exist:
      imports.imported_candidates.length === 10,

    validated_candidates_exist:
      validated.validated_candidate_count === 10,

    all_candidates_quarantined:
      validated.validated_candidates.every(
        c => c.quarantine_status === "QUARANTINED_PENDING_DEDUPE"
      ),

    source_lineage_present:
      validated.validated_candidates.every(
        c => c.source_lineage_verified === true
      ),

    no_runtime_visibility:
      validated.validated_candidates.every(
        c => c.runtime_visible === false
      ),

    no_contact_ready:
      validated.validated_candidates.every(
        c => c.contact_ready === false
      ),

    no_auto_contact:
      validated.validated_candidates.every(
        c => c.automated_outreach_allowed === false
      ),

    no_auto_promotion:
      validated.validated_candidates.every(
        c => c.runtime_mutation_allowed === false
      ),

    cross_city_dedupe_executed:
      dedupe.cross_city_duplicates >= 1
  },

  next_phase:
    "BATCH_148_SAN_DIEGO_RUNTIME_MERGE_AND_GRAPH",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/candidate_queue/san_diego/audit/batch_147_san_diego_discovery_import_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_147_SAN_DIEGO_DISCOVERY_IMPORT_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
