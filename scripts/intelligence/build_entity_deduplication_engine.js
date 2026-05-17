const fs = require("fs");
const path = require("path");

const IN = "public/data/intelligence/outputs/unified_entity_fusion_output.json";
const OUT = "public/data/intelligence/outputs/entity_deduplication_output.json";

const input = JSON.parse(fs.readFileSync(IN, "utf8"));
const entities = input.entities || [];

const map = new Map();

for (const e of entities) {
  const key = `${e.state || "NA"}|${e.canonical_name || e.display_name || e.entity_id}`.toUpperCase();

  if (!map.has(key)) {
    map.set(key, {
      ...e,
      source_traces: [e.source_trace].filter(Boolean),
      duplicate_count: 1
    });
  } else {
    const existing = map.get(key);

    existing.duplicate_count++;

    if (e.source_trace && !existing.source_traces.includes(e.source_trace)) {
      existing.source_traces.push(e.source_trace);
    }

    existing.confidence_score = Math.max(
      existing.confidence_score || 0,
      e.confidence_score || 0
    );

    existing.updated_at = new Date().toISOString();
  }
}

const output = {
  version: "nexus_entity_deduplication_output_v1",
  generated_at: new Date().toISOString(),
  input_entities: entities.length,
  unique_entities: map.size,
  duplicate_entities_removed: entities.length - map.size,
  entities: [...map.values()]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[ENTITY DEDUPE] COMPLETE", output.unique_entities, "unique");
