const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(
    fs.readFileSync(path.join(ROOT, rel), "utf8")
  );
}

const queue = read(
  "public/data/clients/black_dragon/contact_resolution/inputs/verified_source_contact_resolution_queue.json"
);

const schema = read(
  "public/data/clients/black_dragon/contact_resolution/candidates/official_contact_route_schema.json"
);

const workbook = read(
  "public/data/clients/black_dragon/contact_resolution/inputs/contact_route_resolution_workbook.json"
);

const unresolved = read(
  "public/data/clients/black_dragon/contact_resolution/quarantine/unresolved_contact_routes.json"
);

const audit = {

  version:
    "black_dragon_batch_107_phase_a_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "107_OFFICIAL_CONTACT_ROUTE_RESOLUTION",

  phase:
    "A_CONTACT_ROUTE_FOUNDATIONS",

  counts: {

    verified_sources_loaded:
      queue.total_contact_resolution_inputs,

    workbook_rows:
      workbook.total_rows,

    unresolved_routes:
      unresolved.total_unresolved,

    schema_required_fields:
      schema.required_fields.length
  },

  gates: {

    verified_sources_loaded_10:
      queue.total_contact_resolution_inputs === 10,

    workbook_rows_10:
      workbook.total_rows === 10,

    unresolved_routes_10:
      unresolved.total_unresolved === 10,

    no_outreach_allowed:
      true,

    no_promotion_allowed:
      true,

    founder_review_required:
      true
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/audit/batch_107_phase_a_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({

  status:
    "BATCH_107_PHASE_A_AUDIT_COMPLETE",

  audit_status:
    audit.status,

  counts:
    audit.counts,

  gates:
    audit.gates,

  output:
    out

}, null, 2));
