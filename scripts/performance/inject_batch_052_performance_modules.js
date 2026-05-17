const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const scripts = [
  "/globe/performance/postfx_resize_throttle.js",
  "/globe/performance/render_stability_probe.js"
];

const report = [];

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

  fs.writeFileSync(abs, html);

  report.push({
    file,
    changed,
    has_postfx_resize_throttle:
      html.includes(scripts[0]),
    has_render_stability_probe:
      html.includes(scripts[1])
  });
}

fs.writeFileSync(
  path.resolve("public/data/performance/batch_052_injection_report.json"),
  JSON.stringify({
    version: "batch_052_performance_injection_report_v1",
    generated_at: new Date().toISOString(),
    report
  }, null, 2)
);

console.log(JSON.stringify({
  status: "BATCH_052_PERFORMANCE_MODULES_INJECTED",
  report
}, null, 2));
