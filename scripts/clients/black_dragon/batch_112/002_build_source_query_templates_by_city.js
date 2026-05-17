const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queuePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/source_resolution/queues/clean_city_expansion_work_queue.json"
);

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

const templates = queue.queue.map(task => ({
  expansion_work_id: task.expansion_work_id,
  city: task.city,
  state: task.state,
  required_new_verified_targets: task.required_new_verified_targets,

  search_queries: [
    `${task.city} ${task.state} police department training division`,
    `${task.city} ${task.state} sheriff office training division`,
    `${task.city} ${task.state} gang unit police department`,
    `${task.city} ${task.state} narcotics organized crime unit`,
    `${task.city} ${task.state} public safety training`,
    `${task.city} ${task.state} criminal justice academy`,
    `${task.city} ${task.state} law enforcement training center`,
    `${task.city} ${task.state} district attorney gang unit`,
    `${task.city} ${task.state} regional task force law enforcement`,
    `${task.city} ${task.state} community college police department`
  ],

  source_rules: {
    official_public_sources_only: true,
    source_url_required: true,
    organization_name_required: true,
    city_state_required: true,
    synthetic_contacts_forbidden: true,
    guessed_emails_forbidden: true,
    automated_outreach_forbidden: true
  }
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/source_resolution/templates/source_query_templates_by_city.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_source_query_templates_by_city_v1",
  generated_at: new Date().toISOString(),
  total_city_templates: templates.length,
  templates
}, null, 2));

console.log(JSON.stringify({
  status: "SOURCE_QUERY_TEMPLATES_BY_CITY_COMPLETE",
  total_city_templates: templates.length,
  output: out
}, null, 2));
