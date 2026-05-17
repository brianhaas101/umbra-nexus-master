const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const registryPath =
  path.join(
    ROOT,
    "public",
    "data",
    "clients",
    "black_dragon",
    "pipeline",
    "registries",
    "import_execution_registry.json"
  );

const registry =
  JSON.parse(fs.readFileSync(registryPath, "utf8"));

const lineage = {
  version:
    "black_dragon_source_lineage_manifest_v1",

  generated_at:
    new Date().toISOString(),

  lineage_requirements: [
    "source_url",
    "retrieval_timestamp",
    "parser_id",
    "discovery_task_id",
    "execution_id",
    "acquisition_method"
  ],

  lineage_entries:
    registry.execution_targets.map(target => ({
      execution_id:
        target.execution_id,

      source_row_id:
        target.source_row_id,

      source_url:
        target.source_url,

      retrieval_timestamp:
        new Date().toISOString(),

      parser_id:
        "B104_REAL_IMPORT_PIPELINE",

      acquisition_method:
        "PUBLIC_SOURCE_DISCOVERY",

      lineage_locked:
        true
    }))
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
    "source_lineage_manifest.json"
  );

fs.writeFileSync(out, JSON.stringify(lineage, null, 2));

console.log(JSON.stringify({
  status:
    "SOURCE_LINEAGE_MANIFEST_COMPLETE",

  lineage_entries:
    lineage.lineage_entries.length,

  output: out
}, null, 2));
