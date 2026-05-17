const fs = require("fs");
const path = require("path");

const inputPath =
  "public/data/clients/black_dragon/education/source_discovery/source_discovery_operational_index.v1.json";

const queuePath =
  "public/data/clients/black_dragon/education/source_discovery/queues/education_source_discovery_queue_batch_068.v1.json";

const reportPath =
  "public/data/clients/black_dragon/education/source_discovery/reports/education_source_discovery_first_pass_report.v1.json";

const payload =
  JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));

const targets =
  payload.operational_targets || [];

const priorityCategories = [
  "STATE_POST_ACADEMY",
  "REGIONAL_POLICE_ACADEMY",
  "SHERIFF_TRAINING_CENTER",
  "PUBLIC_SAFETY_INSTITUTE",
  "CRIMINAL_JUSTICE_COLLEGE",
  "INTELLIGENCE_ANALYSIS_PROGRAM",
  "GANG_STUDIES_PROGRAM"
];

function priorityScore(target) {
  let score = 0;

  if (priorityCategories.includes(target.source_category)) score += 50;
  if (target.entity_class === "TRAINING_NODE") score += 18;
  if (target.entity_class === "LAW_ENFORCEMENT_NODE") score += 16;
  if (target.entity_class === "EDUCATION_NODE") score += 14;
  if (["Texas", "California", "Florida", "Georgia", "Arizona", "Ohio", "North Carolina"].includes(target.region)) score += 10;
  if (target.region === "Texas") score += 8;

  return score;
}

function buildSearchQueries(target) {
  const base = target.region;
  const cat = target.source_category;

  const queries = [];

  if (cat === "STATE_POST_ACADEMY") {
    queries.push(`${base} POST academy law enforcement training official`);
    queries.push(`${base} peace officer standards training academy official`);
  }

  if (cat === "REGIONAL_POLICE_ACADEMY") {
    queries.push(`${base} regional police academy official`);
    queries.push(`${base} law enforcement academy criminal justice training`);
  }

  if (cat === "SHERIFF_TRAINING_CENTER") {
    queries.push(`${base} sheriff training center official`);
    queries.push(`${base} sheriff law enforcement training academy`);
  }

  if (cat === "PUBLIC_SAFETY_INSTITUTE") {
    queries.push(`${base} public safety institute law enforcement training`);
    queries.push(`${base} public safety training center official`);
  }

  if (cat === "CRIMINAL_JUSTICE_COLLEGE") {
    queries.push(`${base} university criminal justice department official`);
    queries.push(`${base} community college criminal justice program`);
  }

  if (cat === "INTELLIGENCE_ANALYSIS_PROGRAM") {
    queries.push(`${base} intelligence analysis program criminal justice official`);
    queries.push(`${base} law enforcement intelligence analysis training program`);
  }

  if (cat === "GANG_STUDIES_PROGRAM") {
    queries.push(`${base} gang studies criminal justice program official`);
    queries.push(`${base} gang intelligence training criminal justice`);
  }

  if (!queries.length) {
    queries.push(`${base} ${cat.replace(/_/g, " ").toLowerCase()} official`);
  }

  return queries;
}

const selected = targets
  .filter(t =>
    t.source_discovery_status === "SOURCE_DISCOVERY_PENDING" &&
    t.outreach_status === "OUTREACH_BLOCKED"
  )
  .map(t => ({
    ...t,
    discovery_priority_score: priorityScore(t)
  }))
  .sort((a, b) => b.discovery_priority_score - a.discovery_priority_score)
  .slice(0, 75);

const discoveryTasks = selected.map((target, index) => ({
  task_id:
    `BD_EDU_DISCOVERY_TASK_${String(index + 1).padStart(5, "0")}`,

  entity_id:
    target.entity_id,

  organization_name:
    target.organization_name,

  region:
    target.region,

  source_category:
    target.source_category,

  entity_class:
    target.entity_class,

  discovery_priority_score:
    target.discovery_priority_score,

  discovery_status:
    "QUEUED_FOR_PUBLIC_SOURCE_DISCOVERY",

  outreach_status:
    "OUTREACH_BLOCKED",

  contact_status:
    "NO_CONTACT_ATTACHED",

  search_queries:
    buildSearchQueries(target),

  required_result:
    "official_public_source_url",

  forbidden_result_types: [
    "generated_email",
    "generated_phone",
    "unverified_contact",
    "social_only_without_official_source",
    "private_personal_data"
  ],

  promotion_gate:
    "SOURCE_URL_REQUIRED_BEFORE_CONTACT_DISCOVERY",

  next_action:
    "RUN_PUBLIC_SOURCE_SEARCH",

  created_at:
    new Date().toISOString()
}));

const queue = {
  version:
    "black_dragon_education_source_discovery_queue_batch_068_v1",

  generated_at:
    new Date().toISOString(),

  client_id:
    "black_dragon",

  module:
    "education_expansion_v1",

  batch:
    "BATCH_068",

  totals: {
    queued_tasks:
      discoveryTasks.length,

    outreach_blocked:
      discoveryTasks.filter(t =>
        t.outreach_status === "OUTREACH_BLOCKED"
      ).length,

    no_contacts_attached:
      discoveryTasks.filter(t =>
        t.contact_status === "NO_CONTACT_ATTACHED"
      ).length
  },

  discovery_tasks:
    discoveryTasks
};

const report = {
  version:
    "black_dragon_education_source_discovery_first_pass_report_v1",

  generated_at:
    new Date().toISOString(),

  input_targets:
    targets.length,

  selected_targets:
    selected.length,

  selection_policy: {
    max_batch_size:
      75,

    priority_categories:
      priorityCategories,

    required_status:
      "SOURCE_DISCOVERY_PENDING",

    required_outreach_status:
      "OUTREACH_BLOCKED"
  },

  category_counts:
    discoveryTasks.reduce((acc, t) => {
      acc[t.source_category] = (acc[t.source_category] || 0) + 1;
      return acc;
    }, {})
};

fs.writeFileSync(
  path.resolve(queuePath),
  JSON.stringify(queue, null, 2)
);

fs.writeFileSync(
  path.resolve(reportPath),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify({
  status:
    "EDUCATION_SOURCE_DISCOVERY_FIRST_PASS_QUEUE_CREATED",

  totals:
    queue.totals,

  output:
    queuePath
}, null, 2));
