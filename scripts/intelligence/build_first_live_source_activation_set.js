const fs = require("fs");
const path = require("path");

const PRIORITY = "public/data/intelligence/runtime/connector_implementation_priority.registry.json";
const OUT = "public/data/intelligence/runtime/first_live_source_activation_set.json";

const priority = JSON.parse(fs.readFileSync(PRIORITY, "utf8"));

const activation = {
  version: "nexus_first_live_source_activation_set_v1",
  generated_at: new Date().toISOString(),
  rule: "Activation set enables controlled live ingestion using proven/manual-verified or low-risk structured sources first.",
  activation_count: priority.priority_connectors.length,
  connectors: priority.priority_connectors.map(c => ({
    ...c,
    live_pull_enabled: false,
    activation_mode: "CONTROLLED_LOCAL_FILE_OR_VERIFIED_SOURCE",
    status: "QUEUED_FOR_IMPLEMENTATION"
  }))
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(activation, null, 2));

console.log("[FIRST LIVE ACTIVATION SET] COMPLETE", activation.activation_count);
