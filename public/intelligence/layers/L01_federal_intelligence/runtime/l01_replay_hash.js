import crypto from "node:crypto";

export function stableSort(value) {
  if (Array.isArray(value)) {
    return value.map(stableSort);
  }

  if (value && typeof value === "object") {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = stableSort(value[key]);
    }
    return sorted;
  }

  return value;
}

export function replayHash(value) {
  const canonical = JSON.stringify(stableSort(value));
  return crypto.createHash("sha256").update(canonical, "utf8").digest("hex");
}
