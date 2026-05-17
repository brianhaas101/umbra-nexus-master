const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queuePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/source_resolution_input_queue.json"
);

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

function validUrl(v) {
  try {
    const u = new URL(v);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

const results = queue.queue.map(row => ({
  resolution_id: row.resolution_id,
  execution_id: row.execution_id,
  import_row_id: row.import_row_id,
  existing_source_url: row.existing_source_url,
  existing_source_url_valid: validUrl(row.existing_source_url),
  domain_resolution_status: validUrl(row.existing_source_url)
    ? "EXISTING_URL_PARSEABLE"
    : "NO_VALID_SOURCE_URL_PRESENT",
  quarantine_required: !validUrl(row.existing_source_url),
  reason: validUrl(row.existing_source_url)
    ? "EXISTING_SOURCE_URL_PARSEABLE"
    : "REAL_PUBLIC_SOURCE_URL_REQUIRED"
}));

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/audit/003_domain_resolution_placeholder_blocker.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_domain_resolution_placeholder_blocker_v1",
  generated_at: new Date().toISOString(),
  total: results.length,
  valid_existing_urls: results.filter(r => r.existing_source_url_valid).length,
  unresolved_urls: results.filter(r => !r.existing_source_url_valid).length,
  results
}, null, 2));

console.log(JSON.stringify({
  status: "DOMAIN_RESOLUTION_PLACEHOLDER_BLOCKER_COMPLETE",
  total: results.length,
  valid_existing_urls: results.filter(r => r.existing_source_url_valid).length,
  unresolved_urls: results.filter(r => !r.existing_source_url_valid).length,
  output: out
}, null, 2));
