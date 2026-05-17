const fs = require("fs");
const path = require("path");

const required = [
  "public/data/clients/black_dragon/books/black_dragon_books_profile.json",
  "public/data/clients/black_dragon/books/schemas/book_target_schema.v1.json",
  "public/data/clients/black_dragon/books/signals/influence_signal_catalog.v1.json",
  "public/data/clients/black_dragon/books/schemas/propagation_score_model.v1.json",
  "public/data/clients/black_dragon/books/templates/book_outreach_templates.v1.json",
  "public/data/clients/black_dragon/books/schemas/book_target_status_model.v1.json"
];

const results = required.map(f => ({
  file: f,
  exists: fs.existsSync(path.resolve(f))
}));

const pass = results.every(r => r.exists);

const report = {
  version: "black_dragon_books_batch_001_audit_v1",
  generated_at: new Date().toISOString(),
  pass,
  results
};

fs.writeFileSync(
  path.resolve("public/data/clients/black_dragon/books/audits/batch_001_audit.json"),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
