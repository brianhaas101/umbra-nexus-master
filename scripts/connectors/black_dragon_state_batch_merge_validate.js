const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";

const cacheDir = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const INPUT = path.join(
  cacheDir,
  "state_batch_az_il_oh_nc.authority_targets.json"
);

const OUTPUT = path.join(
  ROOT,
  "public/data/clients/black_dragon/targets_master.json"
);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function clean(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function dedupeKey(t) {
  return (
    clean(t.agency_name).toUpperCase() +
    "|" +
    clean(t.city).toUpperCase() +
    "|" +
    t.state
  );
}

function main() {
  console.log("[BD MERGE] Starting...");

  if (!fs.existsSync(INPUT)) {
    console.error("[BD MERGE] Missing input file: " + INPUT);
    process.exit(1);
  }

  const input = readJson(INPUT);
  const targets = Array.isArray(input.targets) ? input.targets : [];

  let existing = [];
  if (fs.existsSync(OUTPUT)) {
    existing = readJson(OUTPUT).targets || [];
  }

  const seen = new Set(existing.map(dedupeKey));
  const merged = [...existing];

  let added = 0;

  for (const t of targets) {
    const key = dedupeKey(t);
    if (seen.has(key)) continue;

    merged.push({
      ...t,
      master_id: "BD-TGT-" + String(merged.length + 1).padStart(5, "0"),
      created_at: new Date().toISOString()
    });

    seen.add(key);
    added++;
  }

  const output = {
    source: "black_dragon_state_batch",
    generated_at: new Date().toISOString(),
    total_targets: merged.length,
    targets: merged
  };

  writeJson(OUTPUT, output);

  console.log("[BD MERGE] Added:", added);
  console.log("[BD MERGE] Total:", merged.length);
  console.log("[BD MERGE] Output:", OUTPUT);
}

main();
