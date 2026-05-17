const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const DIR = path.resolve(ROOT, "public/data/clients/black_dragon/source_cache/state_directories");
const PAGES_DIR = path.join(DIR, "az_pages");

const SOURCE_ID = "az_acjc_statewide_agency_directory";
const OUTPUT = path.join(DIR, SOURCE_ID + ".merged.html");

function extractCards(html) {
  const re = /<div class=["']mycolumn["'][^>]*>[\s\S]*?<\/div>/gi;
  return html.match(re) || [];
}

function main() {
  const files = fs.readdirSync(PAGES_DIR)
    .filter(f => /^az_page_\d+\.html$/i.test(f))
    .sort();

  const allCards = [];

  for (const file of files) {
    const fullPath = path.join(PAGES_DIR, file);
    const html = fs.readFileSync(fullPath, "utf8");
    const cards = extractCards(html);

    console.log("[AZ MERGE] " + file + ": " + cards.length + " cards");
    allCards.push(...cards);
  }

  const merged = [
    "<!DOCTYPE html>",
    "<html><body>",
    "<h1>" + SOURCE_ID + " merged full cache</h1>",
    "<p>Generated: " + new Date().toISOString() + "</p>",
    ...allCards,
    "</body></html>"
  ].join("\n");

  fs.writeFileSync(OUTPUT, merged, "utf8");

  console.log("[AZ MERGE] Total cards: " + allCards.length);
  console.log("[AZ MERGE] Output: " + OUTPUT);
}

main();
