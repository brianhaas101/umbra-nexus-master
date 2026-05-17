const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const lineagePath =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "registries",
    "source_lineage_manifest.json"
  );

const lineage =
  JSON.parse(fs.readFileSync(lineagePath, "utf8"));

const routes = {
  version:
    "black_dragon_parser_execution_router_v1",

  generated_at:
    new Date().toISOString(),

  routing_rules: {
    html: "HTML_PUBLIC_PARSER",
    gov: "GOV_DIRECTORY_PARSER",
    pdf: "PDF_CONTACT_EXTRACTOR",
    csv: "CSV_CONTACT_IMPORTER"
  },

  routes:
    lineage.lineage_entries.map(entry => {

      let parser = "GENERIC_PUBLIC_SOURCE_PARSER";

      if (
        entry.source_url &&
        entry.source_url.includes(".gov")
      ) {
        parser = "GOV_DIRECTORY_PARSER";
      }

      return {
        execution_id:
          entry.execution_id,

        parser_assigned:
          parser,

        routing_locked:
          true
      };
    })
};

const out =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "registries",
    "parser_execution_router.json"
  );

fs.writeFileSync(out, JSON.stringify(routes, null, 2));

console.log(JSON.stringify({
  status:
    "PARSER_EXECUTION_ROUTER_COMPLETE",

  routes:
    routes.routes.length,

  output: out
}, null, 2));
