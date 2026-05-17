const fs = require("fs");
const path = require("path");

const queuePath =
  "public/data/clients/black_dragon/education/source_discovery/queues/education_source_discovery_queue_batch_068.v1.json";

const manifestPath =
  "public/data/clients/black_dragon/education/source_discovery/adapters/education_discovery_adapter_manifest.v1.json";

const outputPath =
  "public/data/clients/black_dragon/education/source_discovery/adapters/education_discovery_adapter_run_plan_batch_069.v1.json";

const queue =
  JSON.parse(fs.readFileSync(path.resolve(queuePath), "utf8"));

const manifest =
  JSON.parse(fs.readFileSync(path.resolve(manifestPath), "utf8"));

const tasks =
  queue.discovery_tasks || [];

const adapters =
  manifest.adapters || [];

const runPlan = {
  version:
    "black_dragon_education_discovery_adapter_run_plan_batch_069_v1",

  generated_at:
    new Date().toISOString(),

  batch:
    "BATCH_069",

  source_queue:
    queuePath,

  adapter_manifest:
    manifestPath,

  execution_policy: {
    live_web_execution:
      false,

    manual_or_tool_assisted_source_review:
      true,

    fake_contact_generation_forbidden:
      true,

    outreach_allowed:
      false,

    promotion_requires_source_result_import:
      true
  },

  run_steps: [
    {
      step: 1,
      adapter_id: "BD_EDU_ADAPTER_001_OFFICIAL_WEB_SEARCH",
      action: "Use task search queries to locate official public source URLs.",
      output: "candidate official source URLs"
    },
    {
      step: 2,
      adapter_id: "BD_EDU_ADAPTER_002_DOMAIN_CLASSIFIER",
      action: "Classify source domain authority and institutional fit.",
      output: "domain classification"
    },
    {
      step: 3,
      adapter_id: "BD_EDU_ADAPTER_003_SOURCE_VALIDATOR",
      action: "Validate that source matches the seed target organization/category/region.",
      output: "verified or rejected source result"
    },
    {
      step: 4,
      adapter_id: "BD_EDU_ADAPTER_004_CONTACT_ROUTE_REVIEW",
      action: "Review verified source for public institutional contact routes only.",
      output: "contact route candidates requiring later manual review"
    }
  ],

  task_count:
    tasks.length,

  adapter_count:
    adapters.length
};

fs.writeFileSync(
  path.resolve(outputPath),
  JSON.stringify(runPlan, null, 2)
);

console.log(JSON.stringify({
  status:
    "EDUCATION_DISCOVERY_ADAPTER_RUN_PLAN_CREATED",

  task_count:
    runPlan.task_count,

  adapter_count:
    runPlan.adapter_count,

  output:
    outputPath
}, null, 2));
