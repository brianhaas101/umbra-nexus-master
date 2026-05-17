const fs = require("fs");
const path = require("path");

const BOOKS = path.resolve("public/data/clients/black_dragon/books");

const operationalPath = path.join(
  BOOKS,
  "operational/black_dragon_books_operational_targets.v1.json"
);

const expansionPath = path.join(
  BOOKS,
  "expansion/batch_045_expanded_target_candidates.v1.json"
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function normKey(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const existingRaw = readJson(operationalPath);
const existing = Array.isArray(existingRaw) ? existingRaw : existingRaw.targets || [];
const expansion = readJson(expansionPath);
const candidates = expansion.candidates || [];

const existingKeys = new Set(
  existing.map(t => normKey(t.organization_name || t.label || t.target_name))
);

const additions = [];

for (const c of candidates) {
  const key = normKey(c.organization_name);
  if (!key || existingKeys.has(key)) continue;

  additions.push({
    entity_id: `BD_BOOK_EXP_${String(additions.length + 1).padStart(5, "0")}`,
    client_id: "black_dragon",
    module: "book_sales_v2",
    organization_name: c.organization_name,
    target_name: c.organization_name,
    leader_role: "UNKNOWN_LEADER",
    organization_type: c.organization_type,
    region: c.region || "National",
    country: "USA",
    source_url: c.source_url || null,
    source_file: c.source_file,
    propagation_score: c.propagation_score,
    projected_revenue: 0,
    operational_status: "EXPANDED_REVIEW",
    expansion_batch: "BATCH_045",
    public_source_present: !!c.public_source_present,
    reconciliation_repaired: false,
    created_at: new Date().toISOString()
  });

  existingKeys.add(key);
}

const merged = existing.concat(additions);

writeJson(operationalPath, merged);

writeJson(path.join(BOOKS, "expansion/batch_045_merge_report.v1.json"), {
  version: "black_dragon_books_batch_045_merge_report_v1",
  generated_at: new Date().toISOString(),
  before: existing.length,
  additions: additions.length,
  after: merged.length
});

console.log(JSON.stringify({
  status: "BATCH_045_OPERATIONAL_TARGETS_EXPANDED",
  before: existing.length,
  additions: additions.length,
  after: merged.length
}, null, 2));
