const fs = require("fs");
const path = require("path");

const ROOT = path.resolve("public/data/clients/black_dragon");
const BOOKS = path.resolve("public/data/clients/black_dragon/books");

const operationalPath = path.join(
  BOOKS,
  "operational/black_dragon_books_operational_targets.v1.json"
);

const expansionPath = path.join(
  BOOKS,
  "expansion/batch_045_expanded_target_candidates.v1.json"
);

const scanReportPath = path.join(
  BOOKS,
  "expansion/batch_045_source_scan_report.v1.json"
);

function exists(file) {
  return fs.existsSync(file);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;

  for (const item of fs.readdirSync(dir)) {
    const abs = path.join(dir, item);
    const stat = fs.statSync(abs);

    if (stat.isDirectory()) {
      if (
        abs.includes(`${path.sep}audits`) ||
        abs.includes(`${path.sep}backups`) ||
        abs.includes(`${path.sep}dashboard`) ||
        abs.includes(`${path.sep}map`) ||
        abs.includes(`${path.sep}security`)
      ) {
        continue;
      }

      walk(abs, out);
    } else if (item.endsWith(".json")) {
      out.push(abs);
    }
  }

  return out;
}

function flattenRecords(value, out = []) {
  if (!value) return out;

  if (Array.isArray(value)) {
    for (const item of value) flattenRecords(item, out);
    return out;
  }

  if (typeof value === "object") {
    const arrayKeys = [
      "targets",
      "entities",
      "records",
      "results",
      "items",
      "agencies",
      "organizations",
      "all_queue_items",
      "nodes",
      "features"
    ];

    let pushed = false;

    for (const key of arrayKeys) {
      if (Array.isArray(value[key])) {
        flattenRecords(value[key], out);
        pushed = true;
      }
    }

    if (!pushed) {
      out.push(value);
    }
  }

  return out;
}

function getName(r) {
  const p = r.properties || r;

  return (
    p.organization_name ||
    p.name ||
    p.agency_name ||
    p.club_name ||
    p.title ||
    p.label ||
    p.target_name ||
    null
  );
}

function getSourceUrl(r) {
  const p = r.properties || r;

  return (
    p.source_url ||
    p.url ||
    p.website ||
    p.public_url ||
    p.profile_url ||
    p.contact_url ||
    p.source ||
    null
  );
}

function getRegion(r) {
  const p = r.properties || r;

  return (
    p.region ||
    p.state ||
    p.state_name ||
    p.city ||
    p.market ||
    "National"
  );
}

function getOrgType(r) {
  const p = r.properties || r;

  const raw =
    p.organization_type ||
    p.type ||
    p.category ||
    p.org_type ||
    p.classification ||
    "";

  const s = String(raw).toUpperCase();

  if (s.includes("COLLEGE") || s.includes("UNIVERSITY")) return "PUBLIC_COLLEGE";
  if (s.includes("MINISTRY")) return "MOTORCYCLE_MINISTRY";
  if (s.includes("COUNCIL") || s.includes("CONFEDERATION")) return "COUNCIL";
  if (s.includes("VETERAN")) return "VETERANS_MOTORCYCLE_CLUB";
  if (s.includes("RIGHTS")) return "MOTORCYCLE_RIGHTS_ORGANIZATION";
  if (s.includes("CLUB")) return "MOTORCYCLE_CLUB";
  if (s.includes("AGENCY")) return "PUBLIC_AGENCY";

  return "MOTORCYCLE_ORGANIZATION";
}

function scoreCandidate(r) {
  const p = r.properties || r;

  let score = 45;

  const name = String(getName(r) || "").toLowerCase();
  const type = getOrgType(r);
  const sourceUrl = getSourceUrl(r);

  if (sourceUrl) score += 12;
  if (p.phone || p.email || p.contact_email || p.contact_phone) score += 10;
  if (p.website || p.url || p.public_url) score += 6;
  if (name.includes("motorcycle")) score += 10;
  if (name.includes("club")) score += 8;
  if (name.includes("council")) score += 9;
  if (name.includes("ministry")) score += 7;
  if (type === "PUBLIC_COLLEGE") score += 5;
  if (type === "COUNCIL") score += 10;
  if (type === "MOTORCYCLE_CLUB") score += 8;

  return Math.max(1, Math.min(100, Math.round(score)));
}

function normKey(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const existing = exists(operationalPath) ? readJson(operationalPath) : [];
const existingArray = Array.isArray(existing) ? existing : existing.targets || [];

const existingKeys = new Set(
  existingArray.map(t =>
    normKey(t.organization_name || t.label || t.target_name)
  )
);

const files = walk(ROOT);
const scan = [];
const candidates = [];

for (const file of files) {
  try {
    const data = readJson(file);
    const records = flattenRecords(data);

    let accepted = 0;

    for (const r of records) {
      const name = getName(r);
      if (!name) continue;

      const key = normKey(name);
      if (!key || existingKeys.has(key)) continue;

      const sourceUrl = getSourceUrl(r);
      const type = getOrgType(r);
      const nameText = String(name).toLowerCase();

      const relevant =
        nameText.includes("motorcycle") ||
        nameText.includes("biker") ||
        nameText.includes("club") ||
        nameText.includes("ministry") ||
        nameText.includes("council") ||
        nameText.includes("college") ||
        nameText.includes("university") ||
        type.includes("MOTORCYCLE") ||
        type.includes("COLLEGE") ||
        type.includes("COUNCIL");

      if (!relevant) continue;

      candidates.push({
        source_file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
        source_url: sourceUrl,
        raw_name: name,
        normalized_key: key,
        organization_name: name,
        organization_type: type,
        region: getRegion(r),
        country: "USA",
        propagation_score: scoreCandidate(r),
        public_source_present: !!sourceUrl,
        raw_record: r
      });

      existingKeys.add(key);
      accepted++;
    }

    scan.push({
      file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
      records_seen: records.length,
      accepted
    });
  } catch (err) {
    scan.push({
      file: path.relative(process.cwd(), file).replace(/\\/g, "/"),
      error: String(err.message || err)
    });
  }
}

candidates.sort((a,b) => b.propagation_score - a.propagation_score);

writeJson(expansionPath, {
  version: "black_dragon_books_batch_045_expanded_target_candidates_v1",
  generated_at: new Date().toISOString(),
  totals: {
    files_scanned: files.length,
    candidates: candidates.length
  },
  candidates
});

writeJson(scanReportPath, {
  version: "black_dragon_books_batch_045_source_scan_report_v1",
  generated_at: new Date().toISOString(),
  files_scanned: files.length,
  accepted_candidates: candidates.length,
  scan
});

console.log(JSON.stringify({
  status: "BATCH_045_TARGET_SCAN_COMPLETE",
  files_scanned: files.length,
  candidates: candidates.length,
  output: path.relative(process.cwd(), expansionPath)
}, null, 2));
