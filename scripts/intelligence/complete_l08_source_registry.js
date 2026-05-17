const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L08_FINANCIAL_BUDGET_FUNDING_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L08_SRC_004_CAPITAL_IMPROVEMENT_PLANS", "Capital Improvement Plans", 0.95, "capital_improvement_plan", "capital_improvement_connector", "capital_improvement_parser", "FINANCIAL_CAPITAL_SIGNAL", "capital_improvement_profile", "retain_with_capital_improvement_trace"],
  ["L08_SRC_005_ANNUAL_FINANCIAL_REPORTS", "Annual Financial Reports", 0.94, "annual_financial_report", "annual_financial_report_connector", "annual_financial_report_parser", "FINANCIAL_CAPACITY_SIGNAL", "annual_financial_report_profile", "retain_with_annual_financial_report_trace"],
  ["L08_SRC_006_DEBT_BOND_FILINGS", "Debt and Bond Filings", 0.93, "debt_bond_filing", "debt_bond_connector", "debt_bond_parser", "FINANCIAL_CAPACITY_SIGNAL", "debt_bond_profile", "retain_with_debt_bond_trace"],
  ["L08_SRC_007_TAX_REVENUE_RECORDS", "Tax Revenue Records", 0.92, "tax_revenue_record", "tax_revenue_connector", "tax_revenue_parser", "FINANCIAL_REVENUE_SIGNAL", "tax_revenue_profile", "retain_with_tax_revenue_trace"],
  ["L08_SRC_008_VENDOR_PAYMENT_RECORDS", "Vendor Payment Records", 0.91, "vendor_payment_record", "vendor_payment_connector", "vendor_payment_parser", "FINANCIAL_VENDOR_SIGNAL", "vendor_payment_profile", "retain_with_vendor_payment_trace"],
  ["L08_SRC_009_BUDGET_HEARING_RECORDS", "Budget Hearing Records", 0.90, "budget_hearing_record", "budget_hearing_connector", "budget_hearing_parser", "FINANCIAL_BUDGET_SIGNAL", "budget_hearing_profile", "retain_with_budget_hearing_trace"],
  ["L08_SRC_010_APPROPRIATION_RECORDS", "Appropriation Records", 0.89, "appropriation_record", "appropriation_connector", "appropriation_parser", "FINANCIAL_ALLOCATION_SIGNAL", "appropriation_profile", "retain_with_appropriation_trace"],
  ["L08_SRC_011_SPENDING_DASHBOARDS", "Spending Dashboards", 0.88, "spending_dashboard", "spending_dashboard_connector", "spending_dashboard_parser", "FINANCIAL_SPEND_SIGNAL", "spending_dashboard_profile", "retain_with_spending_dashboard_trace"],
  ["L08_SRC_012_FINANCIAL_PRESSURE_INDICATORS", "Financial Pressure Indicators", 0.87, "financial_pressure_indicator", "financial_pressure_connector", "financial_pressure_parser", "FINANCIAL_PRESSURE_SIGNAL", "financial_pressure_profile", "retain_with_financial_pressure_trace"],
  ["L08_SRC_013_FUNDING_OPPORTUNITY_NOTICES", "Funding Opportunity Notices", 0.86, "funding_opportunity_notice", "funding_opportunity_connector", "funding_opportunity_parser", "FINANCIAL_GRANT_SIGNAL", "funding_opportunity_profile", "retain_with_funding_opportunity_trace"],
  ["L08_SRC_014_CONTRACT_AWARD_RECORDS", "Contract Award Records", 0.85, "contract_award_record", "contract_award_connector", "contract_award_parser", "FINANCIAL_PROCUREMENT_SIGNAL", "contract_award_profile", "retain_with_contract_award_trace"],
  ["L08_SRC_015_FINANCIAL_FORECASTS", "Financial Forecasts", 0.84, "financial_forecast", "financial_forecast_connector", "financial_forecast_parser", "FINANCIAL_FORECAST_SIGNAL", "financial_forecast_profile", "retain_with_financial_forecast_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L08",
      name,
      authority_score,
      authority: "FINANCIAL",
      type,
      coverage: "US_FINANCIAL",
      acquisition_type: "public_financial_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "financial_budget_normalizer",
      lineage_tracking_enabled: true,
      evidence_retention_policy,
      signal_generation_type,
      dossier_contribution_type
    });
  }
}

registry.sources.sort((a, b) => a.source_id.localeCompare(b.source_id));
registry.generated_at = new Date().toISOString();

fs.writeFileSync(abs, JSON.stringify(registry, null, 2), "utf8");

console.log(JSON.stringify({
  status: "L08_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
