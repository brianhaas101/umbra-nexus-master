const fs = require("fs");
const path = require("path");

const messagesPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_outreach_messages.v1.json"
);

const outputPath = path.resolve(
  "public/data/clients/black_dragon/books/outreach/generated/book_hot_outreach_shortlist.v1.json"
);

const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));

const shortlist = messages
  .filter(m => m.lead_temperature === "HOT")
  .sort((a, b) => (b.propagation_score || 0) - (a.propagation_score || 0))
  .slice(0, 25);

fs.writeFileSync(outputPath, JSON.stringify({
  version: "black_dragon_books_hot_outreach_shortlist_v1",
  generated_at: new Date().toISOString(),
  total_hot_messages: shortlist.length,
  messages: shortlist
}, null, 2));

console.log(JSON.stringify({
  status: "BOOK_HOT_OUTREACH_SHORTLIST_COMPLETE",
  total_hot_messages: shortlist.length,
  output: outputPath
}, null, 2));
