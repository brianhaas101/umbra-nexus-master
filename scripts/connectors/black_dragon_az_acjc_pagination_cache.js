const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const DIR = path.resolve(
  ROOT,
  "public/data/clients/black_dragon/source_cache/state_directories"
);

const SOURCE_ID = "az_acjc_statewide_agency_directory";
const INPUT = path.join(DIR, SOURCE_ID + ".html");
const OUTPUT = path.join(DIR, SOURCE_ID + ".merged.html");

function extractPageOneCards(html) {
  const re = /<div class=["']mycolumn["'][^>]*>[\s\S]*?<\/div>/gi;
  return html.match(re) || [];
}

function main() {
  if (!fs.existsSync(INPUT)) {
    console.error("[AZ CACHE] Missing source HTML: " + INPUT);
    process.exit(1);
  }

  const html = fs.readFileSync(INPUT, "utf8");
  const cards = extractPageOneCards(html);

  if (!cards.length) {
    console.error("[AZ CACHE] No mycolumn cards found in page 1.");
    process.exit(1);
  }

  const merged = [
    "<!DOCTYPE html>",
    "<html><body>",
    "<h1>" + SOURCE_ID + " merged cache</h1>",
    "<p>Generated: " + new Date().toISOString() + "</p>",
    "<p>NOTE: This currently includes page 1 cards only. Pages 2-13 require live ASP.NET postback capture.</p>",
    ...cards,
    "</body></html>"
  ].join("\n");

  fs.writeFileSync(OUTPUT, merged, "utf8");

  console.log("[AZ CACHE] Page 1 cards found: " + cards.length);
  console.log("[AZ CACHE] Output: " + OUTPUT);
}

main();
