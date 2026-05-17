const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const scripts = [
  "/globe/security/dataset_access_guard.js",
  "/globe/security/export_security_guard.js"
];

const report = [];

for (const file of htmlCandidates) {

  const abs = path.resolve(file);

  if (!fs.existsSync(abs)) continue;

  let html = fs.readFileSync(abs, "utf8");
  let changed = false;

  for (const script of scripts) {

    if (!html.includes(script)) {

      const tag =
        `<script src="${script}"></script>`;

      html = html.includes("</body>")
        ? html.replace("</body>", `  ${tag}\n</body>`)
        : `${html}\n${tag}\n`;

      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(abs, html);
  }

  report.push({
    file,
    changed,
    has_dataset_guard:
      html.includes(scripts[0]),
    has_export_guard:
      html.includes(scripts[1])
  });
}

fs.writeFileSync(
  path.resolve(
    "public/data/security/datasets/dataset_export_injection_report.v1.json"
  ),
  JSON.stringify({
    version: "dataset_export_injection_report_v1",
    generated_at: new Date().toISOString(),
    report
  }, null, 2)
);

console.log(JSON.stringify({
  status: "DATASET_EXPORT_GUARDS_INJECTED",
  report
}, null, 2));
