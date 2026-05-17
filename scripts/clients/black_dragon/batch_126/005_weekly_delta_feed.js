const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const dedupe = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/automation/simulation/dedupe/weekly_candidate_dedupe_results.json"),
  "utf8"
));

const revalidation = JSON.parse(fs.readFileSync(
  path.join(ROOT, "public/data/clients/black_dragon/automation/simulation/revalidation/long_beach_contact_route_revalidation_queue.json"),
  "utf8"
));

const newCandidates = dedupe.candidates
  .filter(c => c.duplicate_status === "NEW_CANDIDATE")
  .map(c => ({
    candidate_id: c.candidate_id,
    organization_name: c.organization_name,
    organization_type: c.organization_type,
    discovery_confidence: c.discovery_confidence,
    book_sale_relevance: c.book_sale_relevance,
    status: "NEW_CANDIDATE_PENDING_VALIDATION"
  }));

const feed = {
  version: "black_dragon_long_beach_weekly_delta_feed_v1",
  generated_at: new Date().toISOString(),
  city: "Long Beach",
  state: "CA",

  client_visible_summary: {
    new_candidate_targets: newCandidates.length,
    duplicate_candidates_for_review: dedupe.duplicate_review,
    contact_routes_due_for_revalidation: revalidation.total_revalidation_tasks,
    new_contact_ready_targets: 0,
    automated_outreach_actions: 0
  },

  new_candidate_targets: newCandidates,

  warnings: [
    "Candidates are not runtime-promoted until validation passes.",
    "No automated outreach is allowed.",
    "Contact-ready status requires verified public contact route."
  ]
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/simulation/delta_feed/long_beach_weekly_delta_feed.json"
);

fs.writeFileSync(out, JSON.stringify(feed, null, 2));

console.log(JSON.stringify({
  status: "LONG_BEACH_WEEKLY_DELTA_FEED_COMPLETE",
  summary: feed.client_visible_summary,
  output: out
}, null, 2));
