const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const script =
  "/globe/clients/black_dragon/books/book_layer_controls.js";

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
    has_layer_controls: html.includes(script)
  });
}

fs.writeFileSync(
  path.resolve(
    "public/data/clients/black_dragon/books/map/controls/book_layer_controls_injection_report.v1.json"
  ),
  JSON.stringify({
    version: "book_layer_controls_injection_report_v1",
    generated_at: new Date().toISOString(),
    report
  }, null, 2)
);

console.log(JSON.stringify({
  status: "BOOK_LAYER_CONTROLS_INJECTED",
  report
}, null, 2));
