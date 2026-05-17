const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const tracePath =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "logs",
    "acquisition_trace_log.json"
  );

const trace =
  JSON.parse(fs.readFileSync(tracePath, "utf8"));

const session = {
  version:
    "black_dragon_import_session_state_manager_v1",

  generated_at:
    new Date().toISOString(),

  checkpoint:
    "BLACK_DRAGON_REAL_CONTACT_EXPANSION_POST_BATCH_103",

  operational_state: {
    outreach_enabled: false,
    founder_review_required: true,
    auto_promotion_allowed: false,
    quarantine_required_on_failure: true
  },

  active_import_sessions:
    trace.traces.map(item => ({
      execution_id:
        item.execution_id,

      session_state:
        "QUEUED_FOR_VALIDATION",

      quarantine_status:
        "NOT_TRIGGERED",

      founder_review_status:
        "PENDING",

      outreach_status:
        "DISABLED"
    }))
};

const out =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "sessions",
    "import_session_state.json"
  );

fs.writeFileSync(out, JSON.stringify(session, null, 2));

console.log(JSON.stringify({
  status:
    "IMPORT_SESSION_STATE_MANAGER_COMPLETE",

  sessions:
    session.active_import_sessions.length,

  output: out
}, null, 2));
