const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queue = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/target_expansion/source_resolution/queues/clean_city_expansion_work_queue.json"),
  "utf8"
));

const priorityPlan = queue.queue
  .map(task => ({
    expansion_work_id: task.expansion_work_id,
    city: task.city,
    state: task.state,
    current_clean_seed_count: task.current_clean_seed_count,
    expansion_gap: task.expansion_gap,

    priority:
      task.expansion_gap >= 15
        ? "HIGH"
        : task.expansion_gap >= 10
          ? "MEDIUM"
          : "LOW",

    recommended_first_pass_target_count:
      Math.min(10, task.expansion_gap),

    expansion_instruction:
      "Resolve official public organizations first; do not add runtime visibility until source validation passes."
  }))
  .sort((a,b) => {
    if (b.expansion_gap !== a.expansion_gap) return b.expansion_gap - a.expansion_gap;
    if (a.state !== b.state) return a.state.localeCompare(b.state);
    return a.city.localeCompare(b.city);
  });

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/target_expansion/source_resolution/queues/target_expansion_priority_plan.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_target_expansion_priority_plan_v1",
  generated_at: new Date().toISOString(),
  total_priority_items: priorityPlan.length,
  priority_plan: priorityPlan
}, null, 2));

console.log(JSON.stringify({
  status: "TARGET_EXPANSION_PRIORITY_PLAN_COMPLETE",
  total_priority_items: priorityPlan.length,
  output: out
}, null, 2));
