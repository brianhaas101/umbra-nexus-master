const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/live_ingestion_execution_queue.json";

const layers = [
  "L01_FEDERAL_INTELLIGENCE",
  "L02_STATE_INTELLIGENCE",
  "L03_LOCAL_AGENCY_INTELLIGENCE",
  "L04_TRAINING_INFRASTRUCTURE",
  "L05_BUDGET_AND_FUNDING",
  "L06_BEHAVIORAL_ACTIVITY",
  "L07_GEOGRAPHIC_TERRITORY",
  "L08_COMMAND_STRUCTURE",
  "L09_PROCUREMENT_INTELLIGENCE",
  "L10_COMMUNICATION_INTELLIGENCE",
  "L11_INCIDENT_AND_RISK",
  "L12_ENGAGEMENT_RESPONSE"
];

const queue = {
  version: "nexus_live_ingestion_execution_queue_v1",
  generated_at: new Date().toISOString(),
  rule: "Queue defines execution order only. It does not imply all live connectors are implemented.",
  total_jobs: layers.length,
  jobs: layers.map((layer_id, i) => ({
    job_id: `INGEST-${String(i + 1).padStart(2, "0")}`,
    layer_id,
    status: "READY_FOR_CONNECTOR_IMPLEMENTATION",
    execution_order: i + 1
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(queue, null, 2));
console.log("[LIVE INGESTION QUEUE] COMPLETE", queue.total_jobs);
