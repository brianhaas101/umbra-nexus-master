const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const queuePath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/source_resolution_input_queue.json"
);

const queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));

function clean(v) {
  return String(v || "").trim();
}

const manifest = queue.queue.map(row => {
  const org = clean(row.organization_seed);
  const type = clean(row.source_type);

  const queries = [
    `${org} official website`,
    `${org} training division contact`,
    `${org} law enforcement training contact`,
    `${org} public safety training contact`
  ].filter(q => q && q !== "official website");

  return {
    resolution_id: row.resolution_id,
    execution_id: row.execution_id,
    import_row_id: row.import_row_id,
    organization_seed: org,
    source_type: type,
    search_queries: queries,
    manual_resolution_required: true,
    automated_web_search_executed: false,
    founder_review_required: true,
    outreach_allowed: false,
    promotion_allowed: false
  };
});

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/candidates/search_query_resolution_manifest.json"
);

fs.writeFileSync(out, JSON.stringify({
  version: "black_dragon_search_query_resolution_manifest_v1",
  generated_at: new Date().toISOString(),
  total: manifest.length,
  manifest
}, null, 2));

console.log(JSON.stringify({
  status: "SEARCH_QUERY_RESOLUTION_MANIFEST_COMPLETE",
  total: manifest.length,
  output: out
}, null, 2));
