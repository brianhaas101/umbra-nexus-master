const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

function write(rel, data) {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

const delta = read(
  "public/data/clients/black_dragon/automation/simulation/delta_feed/long_beach_weekly_delta_feed.json"
);

const runtimeSummary = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/long_beach_final_runtime_summary.json"
);

const feed = {
  version: "black_dragon_client_update_feed_v1",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon_omg_cert_v1",
  client_account: "BLACK_DRAGON",
  city: "Long Beach",
  state: "CA",

  feed_status: "CLIENT_VISIBLE_READY",

  headline: "Long Beach weekly intelligence refresh",

  summary_cards: [
    {
      card_id: "NEW_CANDIDATES",
      label: "New candidate targets",
      count: delta.client_visible_summary.new_candidate_targets,
      severity: "INFO"
    },
    {
      card_id: "ROUTES_REVALIDATION",
      label: "Contact routes due for revalidation",
      count: delta.client_visible_summary.contact_routes_due_for_revalidation,
      severity: "REVIEW"
    },
    {
      card_id: "CONTACT_READY",
      label: "New contact-ready targets",
      count: delta.client_visible_summary.new_contact_ready_targets,
      severity: "ACTION"
    },
    {
      card_id: "AUTOMATION_ACTIONS",
      label: "Automated outreach actions",
      count: delta.client_visible_summary.automated_outreach_actions,
      severity: "LOCKED"
    }
  ],

  new_candidate_targets:
    delta.new_candidate_targets,

  current_runtime_summary:
    runtimeSummary.totals,

  client_permissions: {
    can_view_feed: true,
    can_open_candidate_dossiers: true,
    can_mark_candidate_for_review: true,
    can_manually_contact_contact_ready_targets: true,
    can_trigger_automated_outreach: false
  },

  safety_notices:
    delta.warnings
};

write(
  "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json",
  feed
);

console.log(JSON.stringify({
  status: "CLIENT_UPDATE_FEED_WIRING_COMPLETE",
  summary_cards: feed.summary_cards.length,
  new_candidate_targets: feed.new_candidate_targets.length,
  output: "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json"
}, null, 2));
