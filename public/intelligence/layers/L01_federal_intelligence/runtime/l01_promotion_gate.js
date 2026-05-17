import fs from "node:fs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function requirePass(resultText, expectedPassToken) {
  const normalized = String(resultText || "").trim();

  assert(
    normalized.includes(expectedPassToken),
    `PASS TOKEN NOT FOUND :: expected=${expectedPassToken}`
  );

  return true;
}

export function safePromoteSource({
  sourceFile,
  aggregateFile,
  sourceId,
  expectedPassToken,
  actualResult,
  successStatus,
  auditFile,
  auditLines
}) {

  requirePass(actualResult, expectedPassToken);

  const source = JSON.parse(
    fs.readFileSync(sourceFile, "utf8").replace(/^\uFEFF/, "")
  );

  source.connector_active = true;
  source.normalizer_active = true;
  source.status = successStatus;
  source.last_refresh = new Date().toISOString();

  fs.writeFileSync(
    sourceFile,
    JSON.stringify(source, null, 2)
  );

  const aggregate = JSON.parse(
    fs.readFileSync(aggregateFile, "utf8").replace(/^\uFEFF/, "")
  );

  for (const item of aggregate.sources) {
    if (item.source_id === sourceId) {
      item.connector_active = true;
      item.normalizer_active = true;
      item.status = successStatus;
      item.last_refresh = source.last_refresh;
    }
  }

  fs.writeFileSync(
    aggregateFile,
    JSON.stringify(aggregate, null, 2)
  );

  fs.writeFileSync(
    auditFile,
    auditLines.join("\n")
  );

  return Object.freeze({
    promoted: true,
    source_id: sourceId,
    status: successStatus
  });
}
