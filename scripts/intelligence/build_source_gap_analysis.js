const fs = require("fs");
const path = require("path");

const MATRIX = "public/data/intelligence/sources/national_source_coverage_matrix.json";
const OUT = "public/data/intelligence/sources/source_gap_analysis.json";

const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));

const gaps = matrix.layers.map(layer => {
  let severity = "LOW";

  if (layer.national_coverage === "WEAK") severity = "HIGH";
  if (layer.national_coverage === "PARTIAL") severity = "MEDIUM";

  return {
    layer_id: layer.layer_id,
    current_coverage: layer.national_coverage,
    severity,
    state_dependency: layer.state_dependency,
    gap_type:
      layer.national_coverage === "WEAK"
        ? "SOURCE_CATALOG_AND_ADAPTER_BUILD_REQUIRED"
        : "SOURCE_EXPANSION_REQUIRED"
  };
});

const output = {
  version: "nexus_source_gap_analysis_v1",
  generated_at: new Date().toISOString(),
  rule: "Gap analysis determines build priority for Nexus intelligence expansion.",
  total_gaps: gaps.length,
  high_severity: gaps.filter(g => g.severity === "HIGH").length,
  medium_severity: gaps.filter(g => g.severity === "MEDIUM").length,
  gaps
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log("[SOURCE GAP ANALYSIS] COMPLETE");
console.log("[SOURCE GAP ANALYSIS] High:", output.high_severity);
console.log("[SOURCE GAP ANALYSIS] Medium:", output.medium_severity);
