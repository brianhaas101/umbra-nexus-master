import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const manifestPath = path.join(root, "public/intelligence/layers/L01_federal_intelligence/freeze/L01_final_freeze_manifest.json");

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex").toUpperCase();
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8").replace(/^\uFEFF/, ""));
const mismatches = [];

for (const row of manifest.files) {
  const file = path.join(root, row.path);
  if (!fs.existsSync(file)) {
    mismatches.push({ path: row.path, reason: "missing" });
    continue;
  }

  const actual = sha256(file);
  if (actual !== String(row.sha256).toUpperCase()) {
    mismatches.push({ path: row.path, reason: "hash_mismatch" });
  }
}

if (mismatches.length > 0) {
  console.error(JSON.stringify({ pass: false, mismatches }, null, 2));
  throw new Error("L01 freeze verification failed.");
}

console.log("L01_FREEZE_VERIFIER_PASS");
