import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJsonSafe, makeRawEnvelope, validateRawEnvelope } from "./l01_connector_sandbox.js";

const root = process.cwd();
const registryPath = path.join(root, "public", "intelligence", "layers", "L01_federal_intelligence", "source_registry.json");

export function runFixtureIngestion() {
  const registry = readJsonSafe(registryPath);

  const outputs = registry.sources.map(source => {
    const raw = Object.freeze({
      fixture: true,
      source_id: source.source_id,
      source_name: source.source_name,
      note: "fixture_only_no_live_fetch"
    });

    const envelope = makeRawEnvelope(source, raw, "fixture_federal_source_record");
    const validation = validateRawEnvelope(envelope);

    return Object.freeze({
      source_id: source.source_id,
      envelope,
      validation
    });
  });

  return Object.freeze({
    layer_id: "L01",
    mode: "fixture_only",
    live_fetch: false,
    count: outputs.length,
    outputs
  });
}

const currentFile = path.resolve(fileURLToPath(import.meta.url));
const invokedFile = path.resolve(process.argv[1] || "");

if (currentFile === invokedFile) {
  const result = runFixtureIngestion();

  if (result.count !== 15) {
    throw new Error(`Expected 15 fixture envelopes. Found ${result.count}`);
  }

  for (const item of result.outputs) {
    if (!item.validation.valid) {
      throw new Error(`Invalid fixture envelope for ${item.source_id}: ${item.validation.errors.join(",")}`);
    }
  }

  console.log("L01_FIXTURE_INGESTION_PASS");
}
