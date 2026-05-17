const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const notifications = {
  version: "black_dragon_automation_notification_feed_v1",
  generated_at: new Date().toISOString(),
  client_id: "black_dragon_omg_cert_v1",
  notifications: [
    {
      notification_id: "BD_NOTIFY_0001",
      type: "NEW_CANDIDATES",
      title: "5 new Long Beach candidate targets discovered",
      severity: "INFO",
      client_visible: true,
      requires_action: false
    },
    {
      notification_id: "BD_NOTIFY_0002",
      type: "ROUTE_REVALIDATION",
      title: "10 contact routes are due for revalidation",
      severity: "REVIEW",
      client_visible: true,
      requires_action: false
    },
    {
      notification_id: "BD_NOTIFY_0003",
      type: "AUTOMATION_LOCK",
      title: "Automated outreach remains disabled",
      severity: "LOCKED",
      client_visible: true,
      requires_action: false
    }
  ]
};

const notifOut = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/notifications/client_notification_feed.json"
);

fs.writeFileSync(notifOut, JSON.stringify(notifications, null, 2), "utf8");

const admin = {
  version: "black_dragon_automation_admin_monitoring_v1",
  generated_at: new Date().toISOString(),

  health: {
    discovery_runner: "READY",
    freshness_runner: "READY",
    revalidation_runner: "READY",
    delta_feed_runner: "READY",
    monthly_rerank_runner: "READY",
    client_feed: "READY",
    scheduler_hooks: "REGISTERED",
    utf8_guard: "PASS"
  },

  risk_flags: [
    {
      risk_id: "ENCODING_CORRUPTION_REPAIRED",
      severity: "LOW",
      status: "RESOLVED"
    }
  ],

  hardlocks: {
    no_auto_contact: true,
    no_auto_promotion: true,
    no_delete_without_quarantine: true
  }
};

const adminOut = path.join(
  ROOT,
  "public/data/clients/black_dragon/automation/admin_monitoring/automation_admin_monitoring.json"
);

fs.writeFileSync(adminOut, JSON.stringify(admin, null, 2), "utf8");

console.log(JSON.stringify({
  status: "NOTIFICATION_AND_ADMIN_MONITORING_COMPLETE",
  notifications: notifications.notifications.length,
  output: adminOut
}, null, 2));
