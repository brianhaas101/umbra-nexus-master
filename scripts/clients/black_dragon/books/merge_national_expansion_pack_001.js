const fs = require("fs");
const path = require("path");

const basePath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/raw/public_book_targets_raw.v1.json"
);

const packPath = path.resolve(
  "public/data/clients/black_dragon/books/public_intake/raw/public_book_targets_raw_pack_001.v1.json"
);

const outputPath = basePath;

const base = JSON.parse(fs.readFileSync(basePath, "utf8"));
const pack = JSON.parse(fs.readFileSync(packPath, "utf8"));

const seen = new Set(
  base.map(t =>
    String(t.organization_name || "").trim().toUpperCase()
  )
);

let added = 0;

for (const target of pack) {

  const key =
    String(target.organization_name || "")
      .trim()
      .toUpperCase();

  if (!seen.has(key)) {
    base.push(target);
    seen.add(key);
    added++;
  }
}

fs.writeFileSync(outputPath, JSON.stringify(base, null, 2));

console.log(JSON.stringify({
  status: "NATIONAL_EXPANSION_MERGE_COMPLETE",
  original_count: base.length - added,
  added,
  final_count: base.length,
  output: outputPath
}, null, 2));
