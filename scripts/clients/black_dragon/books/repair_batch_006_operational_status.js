const fs = require("fs");
const path = require("path");

const file = path.resolve(
  "public/data/clients/black_dragon/books/operational/black_dragon_books_operational_targets.v1.json"
);

const targets = JSON.parse(fs.readFileSync(file, "utf8"));

targets.forEach(t => {

  if (!t.operational_status) {
    t.operational_status = "ACTIVE";
  }

  if (!t.created_at) {
    t.created_at = new Date().toISOString();
  }
});

fs.writeFileSync(file, JSON.stringify(targets, null, 2));

console.log(JSON.stringify({
  status: "OPERATIONAL_STATUS_REPAIR_COMPLETE",
  repaired_targets: targets.length,
  output: file
}, null, 2));
