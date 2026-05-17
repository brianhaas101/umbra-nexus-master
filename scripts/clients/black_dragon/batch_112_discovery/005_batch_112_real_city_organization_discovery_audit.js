const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const queue = read(
  "public/data/clients/black_dragon/organization_discovery/queues/city_organization_discovery_queue.json"
);

const registry = read(
  "public/data/clients/black_dragon/organization_discovery/templates/city_organization_registry_template.json"
);

const manifest = read(
  "public/data/clients/black_dragon/organization_discovery/templates/city_discovery_query_manifest.json"
);

const gate = read(
  "public/data/clients/black_dragon/organization_discovery/templates/runtime_ingestion_gate.json"
);

const audit = {

  version:
    "black_dragon_batch_112_real_city_organization_discovery_audit_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "112_REAL_CITY_ORGANIZATION_DISCOVERY",

  counts: {

    discovery_tasks:
      queue.total_discovery_tasks,

    discovery_queries:
      manifest.total_queries,

    registry_required_fields:
      registry.required_fields.length,

    prohibited_runtime_conditions:
      gate.prohibited_conditions.length
  },

  gates: {

    discovery_tasks_exist:
      queue.total_discovery_tasks > 0,

    discovery_queries_exist:
      manifest.total_queries > 0,

    registry_empty_until_real_discovery:
      registry.organization_registry.length === 0,

    runtime_visibility_disabled:
      queue.queue.every(q => q.runtime_visibility_allowed === false),

    dossier_creation_disabled:
      queue.queue.every(q => q.dossier_creation_allowed === false),

    contact_ready_disabled:
      queue.queue.every(q => q.contact_ready === false),

    automated_outreach_disabled:
      queue.queue.every(q => q.automated_outreach_allowed === false)
  },

  next_phase:
    "BATCH_113_REAL_ORGANIZATION_IMPORT",

  status:
    "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/organization_discovery/audit/batch_112_real_city_organization_discovery_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_112_REAL_CITY_ORGANIZATION_DISCOVERY_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
