const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const scripts = [
  "/globe/security/frontend_runtime_guard.js",
  "/globe/security/ui_panel_security_hook.js"
];

let patched = [];

for (const file of htmlCandidates) {
  const abs = path.resolve(file);

  if (!fs.existsSync(abs)) continue;

  let html = fs.readFileSync(abs, "utf8");
  let changed = false;

  for (const script of scripts) {
    if (!html.includes(script)) {
      const tag = `<script src="${script}"></script>`;
      html = html.includes("</body>")
        ? html.replace("</body>", `  ${tag}\n</body>`)
        : `${html}\n${tag}\n`;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(abs, html);
  }

  patched.push({
    file,
    exists: true,
    changed,
    has_frontend_guard: html.includes(scripts[0]),
    has_ui_hook: html.includes(scripts[1])
  });
}

const report = {
  version: "umbra_ui_security_script_injection_report_v1",
  generated_at: new Date().toISOString(),
  patched
};

fs.writeFileSync(
  path.resolve("public/data/security/ui/ui_security_script_injection_report.v1.json"),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
