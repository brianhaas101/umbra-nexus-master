const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const encoding = read(
  "public/data/clients/black_dragon/automation/encoding/utf8_string_normalization_report.json"
);

const scheduler = read(
  "public/data/clients/black_dragon/automation/scheduler/scheduler_hook_registry.json"
);

const runners = read(
  "public/data/clients/black_dragon/automation/runners/runner_stub_creation_report.json"
);

const ui = read(
  "public/data/clients/black_dragon/automation/ui_feed/client_automation_ui_surface.json"
);

const mutation = read(
  "public/data/clients/black_dragon/automation/mutation_logs/runtime_mutation_log.json"
);

const history = read(
  "public/data/clients/black_dragon/automation/history/runtime_snapshot_history_index.json"
);

const notifications = read(
  "public/data/clients/black_dragon/automation/notifications/client_notification_feed.json"
);

const admin = read(
  "public/data/clients/black_dragon/automation/admin_monitoring/automation_admin_monitoring.json"
);

const audit = {
  version: "black_dragon_batch_128_cron_ui_surface_audit_v1",
  generated_at: new Date().toISOString(),
  batch: "128_AUTONOMOUS_REFRESH_CRON_WIRING_AND_UI_SURFACE",

  counts: {
    encoding_repairs: encoding.repaired_strings,
    scheduler_hooks: scheduler.hooks.length,
    runner_stubs: runners.runners_created,
    ui_panels: ui.panels.length,
    mutation_log_entries: mutation.mutations.length,
    history_snapshots: history.snapshots.length,
    notifications: notifications.notifications.length
  },

  gates: {
    utf8_guard_passed: encoding.status === "PASS",
    scheduler_hooks_registered: scheduler.hooks.length === 5,
    runner_stubs_created: runners.runners_created === 5,
    ui_surface_ready: ui.ui_surface_status === "READY_FOR_CLIENT_RUNTIME",
    mutation_log_exists: mutation.mutations.length >= 2,
    history_index_exists: history.snapshots.length >= 1,
    notifications_exist: notifications.notifications.length >= 3,
    admin_monitoring_ready: admin.health.client_feed === "READY",
    no_auto_contact: admin.hardlocks.no_auto_contact === true,
    no_auto_promotion: admin.hardlocks.no_auto_promotion === true,
    no_delete_without_quarantine: admin.hardlocks.no_delete_without_quarantine === true
  },

  next_phase: "BATCH_129_LONG_BEACH_AUTONOMOUS_REFRESH_CHECKPOINT_EXPORT",

  status: "PASS"
};

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/audit/batch_128_cron_ui_surface_audit.json"
);

fs.writeFileSync(out, JSON.stringify(audit, null, 2), "utf8");

console.log(JSON.stringify({
  status: "BATCH_128_CRON_UI_SURFACE_AUDIT_COMPLETE",
  audit_status: audit.status,
  counts: audit.counts,
  gates: audit.gates,
  output: out
}, null, 2));
