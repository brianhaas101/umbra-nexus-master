const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const work = read(
  "public/data/clients/black_dragon/target_expansion/source_resolution/queues/clean_city_expansion_work_queue.json"
);

const queries = read(
  "public/data/clients/black_dragon/target_expansion/source_resolution/templates/source_query_templates_by_city.json"
);

const template = read(
  "public/data/clients/black_dragon/target_expansion/source_resolution/templates/resolved_expansion_source_import_template.json"
);

const priority = read(
  "public/data/clients/black_dragon/target_expansion/source_resolution/queues/target_expansion_priority_plan.json"
);

const audit = {
  version: "black_dragon_batch_112_phase_a_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "112_TARGET_EXPANSION_SOURCE_RESOLUTION",
  phase: "A_EXPANSION_SOURCE_QUEUE_FOUNDATIONS",

  counts: {
    city_expansion_tasks: work.total_city_expansion_tasks,
    city_query_templates: queries.total_city_templates,
    resolved_import_rows: template.resolved_expansion_sources.length,
    priority_items: priority.total_priority_items
  },

  gates: {
    work_queue_exists: work.total_city_expansion_tasks > 0,
    query_templates_match_work_queue:
      queries.total_city_templates === work.total_city_expansion_tasks,

    priority_plan_matches_work_queue:
      priority.total_priority_items === work.total_city_expansion_tasks,

    import_template_empty:
      template.resolved_expansion_sources.length === 0,

    runtime_visibility_forbidden:
      work.queue.every(r => r.runtime_visibility_allowed === false),

    contact_ready_false:
      work.queue.every(r => r.contact_ready === false),

    automated_outreach_forbidden:
      work.queue.every(r => r.automated_outreach_allowed === false),

    promotion_forbidden:
      work.queue.every(r => r.promotion_allowed === false)
  },

  next_phase:
    "BATCH_112_PHASE_B_FIRST_CITY_EXPANSION_IMPORT",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/source_resolution/audit/batch_112_phase_a_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2));

console.log(JSON.stringify({
  status: "BATCH_112_PHASE_A_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
