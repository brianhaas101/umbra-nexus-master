const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const CLIENT_ROOT = path.join(ROOT, "public/data/clients/black_dragon");
const SCRIPT_ROOT = path.join(ROOT, "scripts/clients/black_dragon");
const INTEL_CLIENT_ROOT = path.join(ROOT, "public/globe/intel/clients");

const REQUIRED_FILES = [
  "public/data/clients/black_dragon/scored_targets.json",
  "public/data/clients/black_dragon/contact_candidates.json",
  "public/data/clients/black_dragon/contact_candidate_review_shortlist.json",
  "public/data/clients/black_dragon/manual_contact_overrides.json",
  "public/data/clients/black_dragon/contact_enriched_targets.json",
  "public/data/clients/black_dragon/ready_targets.json",
  "public/data/clients/black_dragon/outreach_shortlist.json",

  "scripts/clients/black_dragon/contact_candidate_collector.js",
  "scripts/clients/black_dragon/build_candidate_review_shortlist.js",
  "scripts/clients/black_dragon/promote_review_candidates.js",
  "scripts/clients/black_dragon/contact_enrichment_engine.js",
  "scripts/clients/black_dragon/build_outreach_shortlist.js",

  "public/globe/intel/clients/black_dragon.client_preset.bridge.js",
  "public/globe/intel/clients/black_dragon.data_loader.js",
  "public/globe/intel/clients/black_dragon.dossier.adapter.js",
  "public/globe/intel/clients/black_dragon.enrichment.adapter.js",
  "public/globe/intel/clients/black_dragon.intake.config.js",
  "public/globe/intel/clients/black_dragon.integrity.check.js",
  "public/globe/intel/clients/black_dragon.pipeline.adapter.js",
  "public/globe/intel/clients/black_dragon.scoring.adapter.js"
];

const RED_FLAG_PATTERNS = [
  { key: "generic_email_info", pattern: /\binfo@/i },
  { key: "generic_email_admin", pattern: /\badmin@/i },
  { key: "generic_email_contact", pattern: /\bcontact@/i },
  { key: "generic_email_support", pattern: /\bsupport@/i },
  { key: "generic_email_court", pattern: /\bcourt@/i },
  { key: "fake_phone_000", pattern: /000[-\s)]?\d{0,7}|0000000000/i },
  { key: "fake_phone_999", pattern: /999[-\s)]?\d{0,7}|9999999999/i },
  { key: "invalid_area_146", pattern: /\(146\)|\b146[-\s]?\d{3}[-\s]?\d{4}\b/ },
  { key: "invalid_area_488", pattern: /\(488\)|\b488[-\s]?\d{3}[-\s]?\d{4}\b/ },
  { key: "html_leak", pattern: /<\/?[a-z][\s\S]*?>/i }
];

function exists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readJson(relPath, fallback = null) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return fallback;
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

function countRecords(data) {
  if (!data) return 0;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.targets)) return data.targets.length;
  if (Array.isArray(data.contacts)) return data.contacts.length;
  if (Array.isArray(data.entities)) return data.entities.length;
  return 0;
}

function scanFile(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) return [];

  const text = fs.readFileSync(full, "utf8");
  const findings = [];

  for (const rule of RED_FLAG_PATTERNS) {
    if (rule.pattern.test(text)) {
      findings.push(rule.key);
    }
  }

  return findings;
}

function uniqueCount(items, getter) {
  const set = new Set();
  for (const item of items || []) {
    const value = getter(item);
    if (value) set.add(value);
  }
  return set.size;
}

function auditJsonFile(relPath) {
  const data = readJson(relPath, null);
  const redFlags = scanFile(relPath);

  return {
    file: relPath,
    exists: exists(relPath),
    records: countRecords(data),
    red_flags: redFlags
  };
}

function main() {
  const report = {
    version: "black_dragon_final_account_audit_v1",
    generated_at: new Date().toISOString(),
    root: ROOT,
    status: "REVIEW_REQUIRED",
    required_files: [],
    json_counts: [],
    contact_integrity: {},
    pipeline_consistency: {},
    recommendations: []
  };

  for (const file of REQUIRED_FILES) {
    const full = path.join(ROOT, file);
    report.required_files.push({
      file,
      status: fs.existsSync(full) ? "EXISTS" : "MISSING",
      bytes: fs.existsSync(full) ? fs.statSync(full).size : 0
    });
  }

  const jsonFiles = [
    "public/data/clients/black_dragon/scored_targets.json",
    "public/data/clients/black_dragon/contact_candidates.json",
    "public/data/clients/black_dragon/contact_candidate_review_shortlist.json",
    "public/data/clients/black_dragon/manual_contact_overrides.json",
    "public/data/clients/black_dragon/contact_enriched_targets.json",
    "public/data/clients/black_dragon/ready_targets.json",
    "public/data/clients/black_dragon/outreach_shortlist.json"
  ];

  for (const file of jsonFiles) {
    report.json_counts.push(auditJsonFile(file));
  }

  const overrides = readJson("public/data/clients/black_dragon/manual_contact_overrides.json", { contacts: [] });
  const ready = readJson("public/data/clients/black_dragon/ready_targets.json", []);
  const outreach = readJson("public/data/clients/black_dragon/outreach_shortlist.json", { targets: [] });

  const contacts = overrides.contacts || [];
  const readyTargets = Array.isArray(ready) ? ready : ready.targets || [];
  const outreachTargets = outreach.targets || [];

  const strictReadyOverrides = contacts.filter(c =>
    c?.validation?.email_valid === true &&
    c?.validation?.phone_valid === true &&
    c?.validation?.role_valid === true &&
    c?.validation?.meets_strict_contact_rules === true
  );

  const publicSafetyTargets = outreachTargets.filter(t =>
    /POLICE|SHERIFF|PUBLIC SAFETY|TRIBAL POLICE|CAMPUS POLICE/i.test(t.agency_name || "")
  );

  report.contact_integrity = {
    overrides_total: contacts.length,
    overrides_strict_ready: strictReadyOverrides.length,
    ready_targets_total: readyTargets.length,
    outreach_targets_total: outreachTargets.length,
    outreach_public_safety_targets: publicSafetyTargets.length,
    override_unique_master_ids: uniqueCount(contacts, c => c.master_id),
    override_unique_authority_ids: uniqueCount(contacts, c => c.authority_target_id),
    outreach_unique_agencies: uniqueCount(outreachTargets, t => `${t.agency_name}|${t.state}`)
  };

  report.pipeline_consistency = {
    promote_to_override_status:
      contacts.length > 0 ? "EXISTS" : "EMPTY",
    ready_to_outreach_status:
      outreachTargets.length <= readyTargets.length ? "CONSISTENT_OR_STRICTER" : "OUTREACH_EXCEEDS_READY",
    client_safe_outreach_status:
      outreachTargets.length === publicSafetyTargets.length ? "PASS" : "REVIEW_REQUIRED"
  };

  const missing = report.required_files.filter(f => f.status === "MISSING");
  const redFlagFiles = report.json_counts.filter(f => f.red_flags.length > 0);

  if (missing.length) {
    report.recommendations.push("Fix missing required files before continuing.");
  }

  if (redFlagFiles.length) {
    report.recommendations.push("Sanitize files with contact red flags before calling account launch-ready.");
  }

  if (report.contact_integrity.outreach_targets_total < 10) {
    report.recommendations.push("Build at least 10 verified real-world outreach/contact paths before client handoff.");
  }

  if (report.contact_integrity.ready_targets_total !== report.contact_integrity.outreach_targets_total) {
    report.recommendations.push("Reconcile ready_targets.json and outreach_shortlist.json under final strict rules.");
  }

  if (
    missing.length === 0 &&
    redFlagFiles.length === 0 &&
    report.contact_integrity.outreach_targets_total >= 10
  ) {
    report.status = "PASS";
  }

  const outputPath = path.join(CLIENT_ROOT, "black_dragon_final_account_audit.json");
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log("[FINAL AUDIT] COMPLETE");
  console.log("[FINAL AUDIT] Status:", report.status);
  console.log("[FINAL AUDIT] Required missing:", missing.length);
  console.log("[FINAL AUDIT] Files with red flags:", redFlagFiles.length);
  console.log("[FINAL AUDIT] Overrides:", report.contact_integrity.overrides_total);
  console.log("[FINAL AUDIT] Strict ready overrides:", report.contact_integrity.overrides_strict_ready);
  console.log("[FINAL AUDIT] Ready targets:", report.contact_integrity.ready_targets_total);
  console.log("[FINAL AUDIT] Outreach targets:", report.contact_integrity.outreach_targets_total);
  console.log("[FINAL AUDIT] Output:", outputPath);
}

main();
