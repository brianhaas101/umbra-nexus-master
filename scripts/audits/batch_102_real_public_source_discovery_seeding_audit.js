const fs = require("fs");
const path = require("path");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.resolve(file), "utf8"));
}

const queue = readJson(
  "public/data/clients/black_dragon/real_contact_expansion/seed_queues/national/real_public_source_discovery_seed_queue.v1.json"
);

const tasks =
  queue.discoveryTasks || queue.discovery_tasks || [];

const discoveryCount =
  queue.totals.discoveryTasks ?? queue.totals.discovery_tasks ?? tasks.length;

const audit = {
  version:
    "umbra_batch_102_real_public_source_discovery_seeding_audit_v1",

  generated_at:
    new Date().toISOString(),

  queue_integrity: {
    cities:
      queue.totals.cities,

    seed_targets:
      queue.totals.seed_targets,

    discovery_tasks:
      discoveryCount,

    expected_total:
      queue.totals.cities * queue.totals.seed_targets,

    counts_match:
      discoveryCount ===
      (queue.totals.cities * queue.totals.seed_targets)
  },

  discovery_integrity: {
    all_pending:
      tasks.every(x =>
        x.discovery_status ===
        "PENDING_REAL_SOURCE_DISCOVERY"
      ),

    all_require_real_source:
      tasks.every(x =>
        x.requires_real_source === true
      ),

    all_require_real_contact:
      tasks.every(x =>
        x.requires_real_contact === true
      ),

    all_require_manual_review:
      tasks.every(x =>
        x.requires_manual_review === true
      )
  },

  safety_integrity: {
    contact_ready_zero:
      queue.totals.contact_ready === 0,

    outreach_allowed_zero:
      queue.totals.outreach_allowed === 0,

    no_auto_promotion:
      true
  }
};

audit.pass =
  audit.queue_integrity.counts_match &&
  audit.discovery_integrity.all_pending &&
  audit.discovery_integrity.all_require_real_source &&
  audit.discovery_integrity.all_require_real_contact &&
  audit.discovery_integrity.all_require_manual_review &&
  audit.safety_integrity.contact_ready_zero &&
  audit.safety_integrity.outreach_allowed_zero &&
  audit.safety_integrity.no_auto_promotion;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/real_contact_expansion/seed_queues/audit/batch_102_real_public_source_discovery_seeding_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));

if (!audit.pass) process.exit(1);
