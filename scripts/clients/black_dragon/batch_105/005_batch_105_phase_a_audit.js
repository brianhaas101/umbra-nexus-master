const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const queue = read("public/data/clients/black_dragon/source_resolution/inputs/source_resolution_input_queue.json");
const manifest = read("public/data/clients/black_dragon/source_resolution/candidates/search_query_resolution_manifest.json");
const domain = read("public/data/clients/black_dragon/source_resolution/audit/003_domain_resolution_placeholder_blocker.json");
const schema = read("public/data/clients/black_dragon/source_resolution/candidates/contact_page_candidate_schema.json");

const audit = {
  version: "black_dragon_batch_105_phase_a_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "105_REAL_SOURCE_RESOLUTION_PIPELINE",
  phase: "A_RESOLUTION_FOUNDATIONS",
  counts: {
    resolution_inputs: queue.total_resolution_inputs,
    query_manifest_rows: manifest.total,
    valid_existing_urls: domain.valid_existing_urls,
    unresolved_urls: domain.unresolved_urls,
    candidate_schema_fields: schema.required_fields.length
  },
  gates: {
    resolution_inputs_180: queue.total_resolution_inputs === 180,
    query_manifest_180: manifest.total === 180,
    no_outreach_allowed: manifest.manifest.every(r => r.outreach_allowed === false),
    no_promotion_allowed: manifest.manifest.every(r => r.promotion_allowed === false),
    founder_review_required: manifest.manifest.every(r => r.founder_review_required === true),
    candidate_schema_empty: schema.contact_page_candidates.length === 0
  },
  status: (
    queue.total_resolution_inputs === 180 &&
    manifest.total === 180 &&
    manifest.manifest.every(r => r.outreach_allowed === false) &&
    manifest.manifest.every(r => r.promotion_allowed === false) &&
    manifest.manifest.every(r => r.founder_review_required === true)
  ) ? "PASS" : "REVIEW_REQUIRED"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/audit/batch_105_phase_a_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_105_PHASE_A_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
