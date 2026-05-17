const fs = require("fs");
const path = require("path");

const ROOT = "C:/Dev/Nexus_MASTER";
const SOURCE_ID = "fl_fdle_criminal_justice_agency_websites";

const htmlPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.html`
);

const outPath = path.resolve(
  ROOT,
  `public/data/clients/black_dragon/source_cache/state_directories/${SOURCE_ID}.candidates.json`
);

function clean(t) {
  return String(t || "").replace(/\s+/g, " ").trim();
}

function extractCandidates(html) {
  const links = [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi)];

  return links
    .map((m, i) => {
      const name = clean(m[2]);
      const url = m[1];

      if (!/POLICE|SHERIFF/i.test(name)) return null;

      return {
        candidate_id: `FL-FDLE-${String(i).padStart(5, "0")}`,
        agency_name: name,
        website: url,
        state: "FL",
        source: SOURCE_ID,
        review_status: "fl_fdle_review_required"
      };
    })
    .filter(Boolean);
}

function main() {
  console.log("[FL PARSER] Starting...");

  const html = fs.readFileSync(htmlPath, "utf8");
  const candidates = extractCandidates(html);

  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        source_id: SOURCE_ID,
        generated_at: new Date().toISOString(),
        candidate_count: candidates.length,
        candidates
      },
      null,
      2
    )
  );

  console.log("[FL PARSER] Candidates:", candidates.length);
}

main();