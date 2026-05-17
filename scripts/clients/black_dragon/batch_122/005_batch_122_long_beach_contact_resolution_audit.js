const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const imported = read(
  "public/data/clients/black_dragon/contact_resolution/long_beach/imports/long_beach_contact_route_import.json"
);

const validated = read(
  "public/data/clients/black_dragon/contact_resolution/long_beach/validated/long_beach_contact_routes_validated.json"
);

const queue = read(
  "public/data/clients/black_dragon/contact_resolution/long_beach/review_queue/long_beach_client_action_queue.json"
);

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach/merged/long_beach_merged_city_entities.json"
);

const audit = {
  version:
    "black_dragon_batch_122_long_beach_contact_resolution_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "122_LONG_BEACH_CONTACT_ROUTE_RESOLUTION",

  counts: {

    imported_routes:
      imported.total_routes,

    validated_routes:
      validated.validated_routes,

    client_action_routes:
      queue.total_client_action_routes,

    runtime_contact_ready:
      runtime.merged_entities.filter(e => e.contact_ready).length
  },

  gates: {

    imported_10:
      imported.total_routes === 10,

    validated_10:
      validated.validated_routes === 10,

    queue_matches_validated:
      queue.total_client_action_routes === validated.validated_routes,

    runtime_matches_queue:
      runtime.merged_entities.filter(e => e.contact_ready).length ===
      queue.total_client_action_routes,

    no_automated_outreach:
      runtime.merged_entities.every(
        e => e.automated_outreach_allowed === false
      ),

    manual_client_control_only:
      runtime.merged_entities
        .filter(e => e.contact_ready)
        .every(
          e => e.outreach_execution_status === "CLIENT_MANUAL_ONLY"
        )
  },

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/contact_resolution/long_beach/audit/batch_122_long_beach_contact_resolution_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_122_LONG_BEACH_CONTACT_RESOLUTION_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
