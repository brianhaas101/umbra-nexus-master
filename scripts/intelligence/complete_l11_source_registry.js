const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const file = "public/data/intelligence/sources/L11_RISK_COMPLIANCE_LEGAL_INTELLIGENCE.sources.json";
const abs = path.join(ROOT, file);

function readJsonNoBom(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
}

const registry = readJsonNoBom(abs);
registry.sources = Array.isArray(registry.sources) ? registry.sources : [];

const additions = [
  ["L11_SRC_004_AUDIT_FINDING_RECORDS", "Audit Finding Records", 0.95, "audit_finding_record", "audit_finding_connector", "audit_finding_parser", "LEGAL_AUDIT_SIGNAL", "audit_finding_profile", "retain_with_audit_finding_trace"],
  ["L11_SRC_005_SANCTION_WATCHLIST_RECORDS", "Sanction and Watchlist Records", 0.94, "sanction_watchlist_record", "sanction_watchlist_connector", "sanction_watchlist_parser", "LEGAL_SANCTION_SIGNAL", "sanction_watchlist_profile", "retain_with_sanction_watchlist_trace"],
  ["L11_SRC_006_LICENSE_DISCIPLINARY_ACTIONS", "License Disciplinary Actions", 0.93, "license_disciplinary_action", "license_disciplinary_connector", "license_disciplinary_parser", "LEGAL_DISCIPLINARY_SIGNAL", "license_disciplinary_profile", "retain_with_license_disciplinary_trace"],
  ["L11_SRC_007_CONSENT_DECREES_SETTLEMENTS", "Consent Decrees and Settlements", 0.92, "consent_decree_settlement", "consent_decree_connector", "consent_decree_parser", "LEGAL_SETTLEMENT_SIGNAL", "consent_decree_profile", "retain_with_consent_decree_trace"],
  ["L11_SRC_008_INSURANCE_LIABILITY_INDICATORS", "Insurance and Liability Indicators", 0.91, "insurance_liability_indicator", "insurance_liability_connector", "insurance_liability_parser", "LEGAL_LIABILITY_SIGNAL", "insurance_liability_profile", "retain_with_insurance_liability_trace"],
  ["L11_SRC_009_PUBLIC_RISK_DISCLOSURES", "Public Risk Disclosures", 0.90, "public_risk_disclosure", "public_risk_connector", "public_risk_parser", "LEGAL_RISK_SIGNAL", "public_risk_profile", "retain_with_public_risk_trace"],
  ["L11_SRC_010_COMPLAINT_INVESTIGATION_RECORDS", "Complaint Investigation Records", 0.89, "complaint_investigation_record", "complaint_investigation_connector", "complaint_investigation_parser", "LEGAL_INVESTIGATION_SIGNAL", "complaint_investigation_profile", "retain_with_complaint_investigation_trace"],
  ["L11_SRC_011_INSPECTOR_GENERAL_REPORTS", "Inspector General Reports", 0.88, "inspector_general_report", "inspector_general_connector", "inspector_general_parser", "LEGAL_AUDIT_SIGNAL", "inspector_general_profile", "retain_with_inspector_general_trace"],
  ["L11_SRC_012_ETHICS_COMMISSION_RECORDS", "Ethics Commission Records", 0.87, "ethics_commission_record", "ethics_commission_connector", "ethics_commission_parser", "LEGAL_ETHICS_SIGNAL", "ethics_commission_profile", "retain_with_ethics_commission_trace"],
  ["L11_SRC_013_POLICY_COMPLIANCE_NOTICES", "Policy Compliance Notices", 0.86, "policy_compliance_notice", "policy_compliance_connector", "policy_compliance_parser", "LEGAL_COMPLIANCE_SIGNAL", "policy_compliance_profile", "retain_with_policy_compliance_trace"],
  ["L11_SRC_014_COURT_DOCKET_REFERENCES", "Court Docket References", 0.85, "court_docket_reference", "court_docket_connector", "court_docket_parser", "LEGAL_LITIGATION_SIGNAL", "court_docket_profile", "retain_with_court_docket_trace"],
  ["L11_SRC_015_LEGAL_RISK_NEWS_FEEDS", "Legal Risk News Feeds", 0.84, "legal_risk_news_feed", "legal_risk_news_connector", "legal_risk_news_parser", "LEGAL_RISK_SIGNAL", "legal_risk_news_profile", "retain_with_legal_risk_news_trace"]
];

const existing = new Set(registry.sources.map(s => s.source_id));

for (const [source_id, name, authority_score, type, connector_type, parser_strategy, signal_generation_type, dossier_contribution_type, evidence_retention_policy] of additions) {
  if (!existing.has(source_id)) {
    registry.sources.push({
      source_id,
      layer_id: "L11",
      name,
      authority_score,
      authority: "LEGAL",
      type,
      coverage: "US_LEGAL",
      acquisition_type: "public_legal_source",
      cadence: "daily",
      operational_status: "OPERATIONAL",
      connector_type,
      parser_strategy,
      normalizer_strategy: "risk_compliance_normalizer",
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
  status: "L11_SOURCE_REGISTRY_COMPLETED",
  sources: registry.sources.length,
  file
}, null, 2));
