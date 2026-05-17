import fs from "node:fs";
import path from "node:path";

const root = "C:/Dev/Nexus_MASTER";
const scanRoots = [
  "public/intelligence/layers/L01_federal_intelligence",
  "public/intelligence/source_registry",
  "logs/intelligence_layers"
];

const forbiddenPatterns = [
  /API_DATA_GOV_KEY\s*=\s*[A-Za-z0-9_-]{20,}/,
  /SAM_GOV_API_KEY\s*=\s*[A-Za-z0-9_-]{10,}/,
  /FBI_CDE_API_KEY\s*=\s*[A-Za-z0-9_-]{10,}/
];

const hits = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else {
      const text = fs.readFileSync(full, "utf8");
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(text)) {
          hits.push(full.replace(root + path.sep, ""));
        }
      }
    }
  }
}

for (const rel of scanRoots) walk(path.join(root, rel));

if (hits.length > 0) {
  console.error(JSON.stringify({ secret_hits: hits }, null, 2));
  throw new Error("Secret leakage scanner failed.");
}

console.log("L01_SECRET_LEAKAGE_SCAN_PASS");
