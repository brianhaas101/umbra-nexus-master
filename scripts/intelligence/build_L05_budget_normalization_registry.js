const fs = require("fs");
const path = require("path");

const OUT = "public/data/intelligence/evidence/L05_budget_normalization.registry.json";

const registry = {
  version: "nexus_L05_budget_normalization_registry_v1",
  generated_at: new Date().toISOString(),
  layer_id: "L05_BUDGET_AND_FUNDING",
  normalization_rules: {
    currency_standard: "USD",
    annualization_required: true,
    fiscal_year_tracking_required: true,
    inflation_adjustment_supported: true,
    source_trace_required: true
  },
  normalized_fields: [
    "budget_total",
    "public_safety_budget",
    "training_budget",
    "procurement_budget",
    "grant_amount",
    "capital_project_amount",
    "fiscal_year",
    "budget_status",
    "funding_source",
    "spending_priority"
  ],
  blocked_conditions: [
    "missing_fiscal_year",
    "invalid_currency",
    "missing_source_trace",
    "unknown_funding_origin"
  ]
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(registry, null, 2));

console.log("[L05 NORMALIZATION REGISTRY] COMPLETE", registry.normalized_fields.length);
