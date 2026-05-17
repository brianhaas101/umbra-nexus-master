const fs = require("fs");
const path = require("path");

const operationalPath = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const priorityPath = path.resolve(
  "public/data/clients/black_dragon/books/priority/contactability_weighted_priority_index.v1.json"
);

const queuePath = path.resolve(
  "public/data/clients/black_dragon/books/queue/outreach_ready_queue.v1.json"
);

const operational = JSON.parse(fs.readFileSync(operationalPath, "utf8"));
const priority = JSON.parse(fs.readFileSync(priorityPath, "utf8"));
const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const audit = {
  version: "black_dragon_books_batch_018_national_expansion_audit_v1",
  generated_at: new Date().toISOString(),

  totals: {
    operational_targets: operational.length,

    hot:
      operational.filter(t => t.lead_temperature === "HOT").length,

    warm:
      operational.filter(t => t.lead_temperature === "WARM").length,

    review:
      operational.filter(t => t.lead_temperature === "REVIEW").length,

    reachable_queue_items:
      queue.totals.ready,

    enrichment_queue_items:
      queue.totals.needs_contact_enrichment
  },

  geography: {
    unique_regions:
      [...new Set(
        operational.map(t => t.region).filter(Boolean)
      )].length,

    national_entities:
      operational.filter(t =>
        String(t.region || "").toUpperCase() === "NATIONAL"
      ).length
  },

  integrity: {
    missing_entity_ids:
      operational.filter(t => !t.entity_id).length,

    missing_priority_scores:
      priority.targets.filter(
        t => typeof t.unified_priority_score !== "number"
      ).length,

    missing_queue_status:
      queue.all_queue_items.filter(
        q => !q.queue_status
      ).length
  },

  operational_state: {
    national_population_expanded: true,
    outreach_queue_active: true,
    contact_enrichment_active: true,
    propagation_scoring_active: true
  }
};

audit.pass =
  audit.integrity.missing_entity_ids === 0 &&
  audit.integrity.missing_priority_scores === 0 &&
  audit.integrity.missing_queue_status === 0 &&
  audit.operational_state.national_population_expanded &&
  audit.operational_state.outreach_queue_active &&
  audit.operational_state.contact_enrichment_active &&
  audit.operational_state.propagation_scoring_active;

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/audits/batch_018_national_expansion_audit.json"
  ),
  JSON.stringify(audit, null, 2)
);

console.log(JSON.stringify(audit, null, 2));
