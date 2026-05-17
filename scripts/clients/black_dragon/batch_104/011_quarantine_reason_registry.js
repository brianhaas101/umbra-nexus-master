const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const auditDir = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/audit"
);

const files = {
  organization: "006_organization_authenticity_validation.json",
  domain: "007_domain_legitimacy_validation.json",
  contact: "008_public_contact_validation.json",
  duplicate: "009_duplicate_contact_detection.json",
  malformed: "010_malformed_record_filter.json"
};

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(auditDir, name), "utf8"));
}

const audits = {
  organization: read(files.organization),
  domain: read(files.domain),
  contact: read(files.contact),
  duplicate: read(files.duplicate),
  malformed: read(files.malformed)
};

const byId = new Map();

function ensure(id) {
  if (!byId.has(id)) {
    byId.set(id, {
      execution_id: id,
      quarantine_required: false,
      quarantine_reasons: []
    });
  }
  return byId.get(id);
}

for (const [auditName, audit] of Object.entries(audits)) {
  for (const row of audit.results) {
    const item = ensure(row.execution_id);
    if (row.quarantine_required) {
      item.quarantine_required = true;
      item.quarantine_reasons.push({
        validator: auditName,
        reason: row.reason || "UNSPECIFIED_VALIDATION_FAILURE"
      });
    }
  }
}

const rows = Array.from(byId.values());

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/pipeline/quarantine/quarantine_reason_registry.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_quarantine_reason_registry_v1",
  generated_at: new Date().toISOString(),
  total: rows.length,
  quarantine_required: rows.filter(r => r.quarantine_required).length,
  clean: rows.filter(r => !r.quarantine_required).length,
  rows
}, null, 2));

console.log(JSON.stringify({
  status: "QUARANTINE_REASON_REGISTRY_COMPLETE",
  total: rows.length,
  quarantine_required: rows.filter(r => r.quarantine_required).length,
  clean: rows.filter(r => !r.quarantine_required).length,
  output: out
}, null, 2));
