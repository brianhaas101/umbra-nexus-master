const fs = require("fs");
const path = require("path");

const CONNECTORS = "public/data/intelligence/runtime/live_connector_implementation.registry.json";
const OUT = "public/data/intelligence/runtime/connector_health_monitor.json";

const connectors = JSON.parse(fs.readFileSync(CONNECTORS, "utf8"));

const health = {
  version: "nexus_connector_health_monitor_v1",
  generated_at: new Date().toISOString(),
  total_connectors: connectors.connectors.length,
  healthy: connectors.connectors.filter(c => c.implementation_status === "CONNECTOR_STUB_READY").length,
  live_enabled: connectors.connectors.filter(c => c.live_pull_enabled === true).length,
  connectors: connectors.connectors.map(c => ({
    layer_id: c.layer_id,
    implementation_status: c.implementation_status,
    live_pull_enabled: c.live_pull_enabled,
    health_status: c.implementation_status === "CONNECTOR_STUB_READY" ? "STUB_HEALTHY" : "REVIEW_REQUIRED"
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(health, null, 2));

console.log("[CONNECTOR HEALTH] COMPLETE", health.healthy, "healthy");
