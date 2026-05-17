const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const script =
  "/globe/security/access_control_runtime.js";

const report = [];

for (const file of htmlCandidates) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) continue;

  let html = fs.readFileSync(abs, "utf8");
  let changed = false;

  if (!html.includes(script)) {
    const tag = `<script src="${script}"></script>`;

    html = html.includes("</body>")
      ? html.replace("</body>", `  ${tag}\n</body>`)
      : `${html}\n${tag}\n`;

    fs.writeFileSync(abs, html);
    changed = true;
  }

  report.push({
    file,
    changed,
    has_access_control_runtime: html.includes(script)
  });
}

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/access/audit/batch_085_access_runtime_injection_report.json"),
  JSON.stringify({
    version: "batch_085_access_runtime_injection_report_v1",
    generated_at: new Date().toISOString(),
    report
  }, null, 2)
);

console.log(JSON.stringify({
  status: "ACCESS_CONTROL_RUNTIME_INJECTED",
  report
}, null, 2));
