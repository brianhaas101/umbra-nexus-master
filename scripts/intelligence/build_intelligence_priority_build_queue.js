const fs = require("fs");
const path = require("path");

const GAP = "public/data/intelligence/sources/source_gap_analysis.json";
const OUT = "public/data/intelligence/runtime/intelligence_priority_build_queue.json";

const gap = JSON.parse(fs.readFileSync(GAP, "utf8"));

const queue = gap.gaps
  .map(g => ({
    layer_id: g.layer_id,
    priority:
      g.severity === "HIGH" ? 1 :
      g.severity === "MEDIUM" ? 2 : 3,
    build_type: g.gap_type,
    status: "QUEUED",
    required_next_step:
      g.severity === "HIGH"
        ? "BUILD_FULL_SOURCE_CATALOG_AND_ADAPTER"
        : "EXPAND_AND_VALIDATE_SOURCE_CATALOG"
  }))
  .sort((a, b) => a.priority - b.priority || a.layer_id.localeCompare(b.layer_id));

const output = {
  version: "nexus_intelligence_priority_build_queue_v1",
  generated_at: new Date().toISOString(),
  rule: "High-severity layers must be built before broad source expansion.",
  total_queue: queue.length,
  queue
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[PRIORITY BUILD QUEUE] COMPLETE", output.total_queue);
