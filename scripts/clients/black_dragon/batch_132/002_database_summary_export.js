const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function read(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

const report = read(
  "public/data/clients/black_dragon/capability_audit/long_beach/exports/long_beach_full_capability_report.json"
);

const rows = [];

for (const category of report.sources_by_category) {
  for (const source of category.sources) {
    rows.push({
      category: category.category,
      source_id: source.source_id,
      source_name: source.source_name,
      source_type: source.source_type,
      discovery_priority: source.discovery_priority
    });
  }
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/capability_audit/long_beach/exports/long_beach_database_source_summary.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_long_beach_database_source_summary_v1",
  generated_at: new Date().toISOString(),
  total_sources: rows.length,
  sources: rows
}, null, 2), "utf8");

console.log(JSON.stringify({
  status: "LONG_BEACH_DATABASE_SOURCE_SUMMARY_COMPLETE",
  total_sources: rows.length,
  output: out
}, null, 2));
