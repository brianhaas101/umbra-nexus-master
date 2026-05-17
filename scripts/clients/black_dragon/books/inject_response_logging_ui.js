const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const script = "/globe/clients/black_dragon/books/response_logging_ui.js";

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
    has_response_logging_ui: html.includes(script)
  });
}

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/dashboard/response_logging_ui_injection_report.v1.json"),
  JSON.stringify({
    version: "response_logging_ui_injection_report_v1",
    generated_at: new Date().toISOString(),
    report
  }, null, 2)
);

console.log(JSON.stringify({
  status: "RESPONSE_LOGGING_UI_INJECTION_COMPLETE",
  report
}, null, 2));
