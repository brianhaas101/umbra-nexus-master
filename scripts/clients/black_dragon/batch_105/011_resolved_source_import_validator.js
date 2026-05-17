const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const templatePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/resolved_source_import_template.json"
);

const template = JSON.parse(
  fs.readFileSync(templatePath, "utf8")
);

function validUrl(v) {
  try {
    const u = new URL(v);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

const validated = [];
const rejected = [];

for (const row of template.resolved_sources) {

  const missing = [];

  if (!row.resolution_id)
    missing.push("resolution_id");

  if (!row.execution_id)
    missing.push("execution_id");

  if (!row.resolved_source_url)
    missing.push("resolved_source_url");

  if (!row.resolved_source_title)
    missing.push("resolved_source_title");

  if (!row.resolved_organization_name)
    missing.push("resolved_organization_name");

  if (!row.evidence_note)
    missing.push("evidence_note");

  const urlValid =
    validUrl(row.resolved_source_url);

  const passed =
    missing.length === 0 &&
    urlValid;

  const output = {
    ...row,
    validation_timestamp:
      new Date().toISOString(),

    validation_passed:
      passed,

    missing_required_fields:
      missing,

    valid_url:
      urlValid,

    founder_review_required:
      true,

    outreach_allowed:
      false,

    promotion_allowed:
      false
  };

  if (passed) {
    validated.push(output);
  } else {
    rejected.push({
      ...output,
      rejection_reason:
        missing.length
          ? "MISSING_REQUIRED_FIELDS"
          : "INVALID_SOURCE_URL"
    });
  }
}

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/audit/011_resolved_source_import_validation.json"
);

fs.writeFileSync(out, JSON.stringify({
  version:
    "black_dragon_resolved_source_import_validator_v1",

  generated_at:
    new Date().toISOString(),

  total_imported:
    template.resolved_sources.length,

  validated:
    validated.length,

  rejected:
    rejected.length,

  validated_sources:
    validated,

  rejected_sources:
    rejected

}, null, 2));

console.log(JSON.stringify({
  status:
    "RESOLVED_SOURCE_IMPORT_VALIDATOR_COMPLETE",

  total_imported:
    template.resolved_sources.length,

  validated:
    validated.length,

  rejected:
    rejected.length,

  output:
    out

}, null, 2));
