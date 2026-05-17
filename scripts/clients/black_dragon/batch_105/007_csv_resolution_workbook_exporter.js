const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const workbookPath = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/manual_resolution_workbook.json"
);

const workbook = JSON.parse(fs.readFileSync(workbookPath, "utf8"));

const headers = [
  "workbook_row_id",
  "resolution_id",
  "execution_id",
  "import_row_id",
  "organization_seed",
  "source_type",
  "search_query_1",
  "search_query_2",
  "search_query_3",
  "search_query_4",
  "resolved_source_url",
  "resolved_source_title",
  "resolved_organization_name",
  "resolved_contact_page_url",
  "resolved_contact_route",
  "resolved_contact_route_type",
  "resolved_contact_person_or_role",
  "evidence_note",
  "founder_review_notes",
  "resolution_status"
];

function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const lines = [
  headers.join(","),
  ...workbook.workbook.map(row => {
    const q = row.search_queries || [];
    return headers.map(h => {
      if (h.startsWith("search_query_")) {
        const idx = Number(h.replace("search_query_", "")) - 1;
        return csvEscape(q[idx] || "");
      }
      return csvEscape(row[h]);
    }).join(",");
  })
];

const out = path.join(
  ROOT,
  "public/data/clients/black_dragon/source_resolution/inputs/manual_resolution_workbook.csv"
);

fs.writeFileSync(out, lines.join("\n"));

console.log(JSON.stringify({
  status: "CSV_RESOLUTION_WORKBOOK_EXPORTER_COMPLETE",
  rows_exported: workbook.workbook.length,
  output: out
}, null, 2));
