const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const feed = read(
  "public/data/clients/black_dragon/automation/client_feed/client_updates_feed.json"
);

const runtime = read(
  "public/data/clients/black_dragon/city_runtime/long_beach_final/long_beach_final_runtime_summary.json"
);

const ui = {
  version: "black_dragon_client_ui_automation_surface_v1",
  generated_at: new Date().toISOString(),

  client_id: feed.client_id,
  client_account: feed.client_account,
  city: "Long Beach",
  state: "CA",

  ui_surface_status: "READY_FOR_CLIENT_RUNTIME",

  panels: [
    {
      panel_id: "AUTOMATION_OVERVIEW",
      title: "Weekly Intelligence Refresh",
      visible_to_client: true,
      cards: feed.summary_cards
    },
    {
      panel_id: "NEW_CANDIDATES",
      title: "New Candidate Targets",
      visible_to_client: true,
      rows: feed.new_candidate_targets
    },
    {
      panel_id: "CITY_RUNTIME_STATUS",
      title: "Long Beach Runtime Status",
      visible_to_client: true,
      totals: runtime.totals
    },
    {
      panel_id: "SAFETY_LOCKS",
      title: "Automation Safety Locks",
      visible_to_client: true,
      locks: {
        automated_outreach_allowed: false,
        automated_promotion_allowed: false,
        candidates_require_validation: true,
        contact_ready_requires_verified_route: true
      }
    }
  ],

  client_actions: {
    can_open_candidate: true,
    can_mark_for_review: true,
    can_request_validation: true,
    can_manually_contact_verified_routes: true,
    can_trigger_automated_contact: false
  }
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/ui_feed/client_automation_ui_surface.json"
);

fs.writeFileSync(out, JSON.stringify(ui, null, 2), "utf8");

console.log(JSON.stringify({
  status: "CLIENT_AUTOMATION_UI_SURFACE_COMPLETE",
  panels: ui.panels.length,
  output: out
}, null, 2));
