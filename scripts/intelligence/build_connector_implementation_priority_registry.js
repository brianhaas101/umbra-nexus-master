const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/connector_implementation_priority.registry.json";

const registry = {
  version: "nexus_connector_implementation_priority_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Live connectors must be activated in order of highest intelligence leverage and lowest implementation risk.",
  priority_connectors: [
    {
      priority: 1,
      layer_id: "L10_COMMUNICATION_INTELLIGENCE",
      connector_id: "MANUAL_VERIFIED_CONTACT_ADAPTER",
      reason: "Already proven through Black Dragon verified contact workflow.",
      implementation_status: "READY_FOR_LIVE_ACTIVATION"
    },
    {
      priority: 2,
      layer_id: "L03_LOCAL_AGENCY_INTELLIGENCE",
      connector_id: "LOCAL_DIRECTORY_ADAPTER",
      reason: "Directly supports agency identity, routing, and dossiers.",
      implementation_status: "READY_FOR_LIVE_ACTIVATION"
    },
    {
      priority: 3,
      layer_id: "L04_TRAINING_INFRASTRUCTURE",
      connector_id: "ACADEMY_DIRECTORY_ADAPTER",
      reason: "Directly supports Black Dragon and training-market intelligence.",
      implementation_status: "READY_FOR_LIVE_ACTIVATION"
    },
    {
      priority: 4,
      layer_id: "L07_GEOGRAPHIC_TERRITORY",
      connector_id: "CITY_GIS_ADAPTER",
      reason: "Improves globe node accuracy and territory intelligence.",
      implementation_status: "READY_FOR_LIVE_ACTIVATION"
    },
    {
      priority: 5,
      layer_id: "L12_ENGAGEMENT_RESPONSE",
      connector_id: "OUTREACH_EXECUTION_LOG_ADAPTER",
      reason: "Creates closed-loop sales and response intelligence.",
      implementation_status: "READY_FOR_LIVE_ACTIVATION"
    }
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[CONNECTOR PRIORITY] COMPLETE", registry.priority_connectors.length);
