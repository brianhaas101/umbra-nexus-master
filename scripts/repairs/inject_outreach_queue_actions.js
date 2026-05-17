const fs = require("fs");
const path = require("path");

const htmlCandidates = [
  "index.html",
  "public/index.html",
  "public/globe/index.html"
];

const script =
  "/globe/clients/black_dragon/books/outreach_queue_actions.js";

const report = [];

for (const file of htmlCandidates) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) continue;

  let html = fs.readFileSync(abs, "utf8");
  let changed = false;

  if (!html.includes(script)) {
    const tag = `<script src="${script}"></script>`;

    const queueScript =
      "/globe/clients/black_dragon/books/outreach_queue_ui.js";

    if (html.includes(queueScript)) {
      html = html.replace(
        `<script src="${queueScript}"></script>`,
        `<script src="${queueScript}"></script>\n  ${tag}`
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
    has_outreach_queue_actions: html.includes(script)
  });
}

fs.writeFileSync(
  path.resolve("public/data/audits/hub/batch_059_queue_actions_injection_report.json"),
  JSON.stringify({
    version: "batch_059_queue_actions_injection_report_v1",
    generated_at: new Date().toISOString(),
    report
  }, null, 2)
);

console.log(JSON.stringify({
  status: "OUTREACH_QUEUE_ACTIONS_INJECTED",
  report
}, null, 2));
