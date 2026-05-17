const fs = require("fs");
const path = require("path");

const MATRIX = "public/data/intelligence/sources/national_source_coverage_matrix.json";
const OUT = "public/data/intelligence/sources/source_gap_analysis.json";

const matrix = JSON.parse(fs.readFileSync(MATRIX, "utf8"));

const gaps = matrix.layers.map(layer => {
  const prod = layer.national_coverage === "PRODUCTION_STRUCTURED";
  return {
    layer_id: layer.layer_id,
    current_coverage: layer.national_coverage,
    severity: prod ? "LOW" : "MEDIUM",
    state_dependency: layer.state_dependency,
    gap_type: prod ? "READY_FOR_ADAPTER_IMPLEMENTATION" : "SOURCE_EXPANSION_REQUIRED"
  };
});

const output = {
  version: "nexus_source_gap_analysis_v2",
  generated_at: new Date().toISOString(),
  total_gaps: gaps.length,
  high_severity: gaps.filter(g => g.severity === "HIGH").length,
  medium_severity: gaps.filter(g => g.severity === "MEDIUM").length,
  low_severity: gaps.filter(g => g.severity === "LOW").length,
  gaps
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
console.log("[GAP ANALYSIS V2] COMPLETE high:", output.high_severity, "medium:", output.medium_severity, "low:", output.low_severity);
