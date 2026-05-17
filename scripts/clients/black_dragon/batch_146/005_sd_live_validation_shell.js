const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const shells = [
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/san_diego/manifests/live_validation_targets.json",
    data: {
      version: "black_dragon_san_diego_live_validation_targets_v1",
      generated_at: new Date().toISOString(),
      city: "San Diego",
      state: "CA",
      validation_targets: [],
      status: "PENDING_ENTITY_IMPORT"
    }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/san_diego/results/live_http_validation_results.json",
    data: {
      version: "black_dragon_san_diego_live_http_validation_results_v1",
      generated_at: new Date().toISOString(),
      validation_count: 0,
      validation_results: []
    }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/san_diego/freshness/live_freshness_registry.json",
    data: {
      version: "black_dragon_san_diego_live_freshness_registry_v1",
      generated_at: new Date().toISOString(),
      freshness_records: []
    }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/san_diego/dead_routes/dead_route_review_queue.json",
    data: {
      version: "black_dragon_san_diego_dead_route_review_queue_v1",
      generated_at: new Date().toISOString(),
      dead_route_items: [],
      review_item_count: 0
    }
  },
  {
    rel: "public/data/clients/black_dragon/automation/live_validation/san_diego/contact_review/contact_route_review.json",
    data: {
      version: "black_dragon_san_diego_contact_route_review_v1",
      generated_at: new Date().toISOString(),
      city: "San Diego",
      state: "CA",
      review_count: 0,
      contact_ready_candidates: 0,
      contact_review: []
    }
  }
];

for (const item of shells) {
  const full = path.join(ROOT, item.rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(item.data, null, 2), "utf8");
}

console.log(JSON.stringify({
  status: "SAN_DIEGO_LIVE_VALIDATION_SHELL_COMPLETE",
  shell_files: shells.length
}, null, 2));
