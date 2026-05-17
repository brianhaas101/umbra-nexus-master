const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/runtime/temporal_signal.registry.json";

const registry = {
  version: "nexus_temporal_signal_registry_v1",
  generated_at: new Date().toISOString(),
  rule: "Temporal intelligence must distinguish structural facts from time-sensitive operational signals.",
  temporal_classes: [
    {
      class_id: "STRUCTURAL",
      examples: ["agency identity", "jurisdiction", "geography"],
      decay_behavior: "SLOW"
    },
    {
      class_id: "CYCLICAL",
      examples: ["budget cycle", "training cycle", "procurement window"],
      decay_behavior: "CYCLE_BASED"
    },
    {
      class_id: "EVENT_DRIVEN",
      examples: ["incident", "grant release", "leadership change"],
      decay_behavior: "FAST"
    },
    {
      class_id: "ENGAGEMENT",
      examples: ["call outcome", "email reply", "follow-up"],
      decay_behavior: "PIPELINE_STATE"
    }
  ],
  temporal_outputs: [
    "urgency_score",
    "purchase_timing_score",
    "risk_escalation_window",
    "follow_up_priority"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));
console.log("[TEMPORAL SIGNAL REGISTRY] COMPLETE", registry.temporal_classes.length);
