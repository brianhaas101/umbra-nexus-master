const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const script =
  "/globe/clients/black_dragon/books/dossier_sync_runtime.js";

const report = [];

for (const file of htmlCandidates) {
  const abs = path.resolve(file);

  if (!fs.existsSync(abs)) continue;

  let html = fs.readFileSync(abs, "utf8");
  let changed = false;

  if (!html.includes(script)) {
    const tag = `<script src="${script}"></script>`;

    const selectionScript =
      "/globe/clients/black_dragon/books/book_selection_bus.js";

    if (html.includes(selectionScript)) {
      html = html.replace(
        `<script src="${selectionScript}"></script>`,
        `<script src="${selectionScript}"></script>\n  ${tag}`
      );
    } else {
      html = html.includes("</body>")
        ? html.replace("</body>", `  ${tag}\n</body>`)
        : `${html}\n${tag}\n`;
    }

    fs.writeFileSync(abs, html);
    changed = true;
  }

  report.push({
    file,
    changed,
    has_dossier_sync_runtime:
      html.includes(script)
  });
}

fs.writeFileSync(
  path.resolve(
    "public/data/audits/hub/batch_062_dossier_sync_injection_report.json"
  ),
  JSON.stringify({
    version: "batch_062_dossier_sync_injection_report_v1",
    generated_at: new Date().toISOString(),
    report
  }, null, 2)
);

console.log(JSON.stringify({
  status: "DOSSIER_SYNC_RUNTIME_INJECTED",
  report
}, null, 2));
