const contextContent = {
  GLOBAL: ["Scope: Global", "Wave: WAVE-001", "Replay: PASS", "Export Lock: ENABLED"],
  CITY: ["Active City: None", "Spatial Confidence: —", "Geocode Failures: 0", "Map Accuracy: Pending"],
  REVIEW: ["Pending Review: 0", "Source Gaps: 0", "Manual Checks: 0", "Promotion Gate: LOCKED"],
  CONFLICTS: ["Open Conflicts: 0", "Duplicate Candidates: 0", "Coordinate Disputes: 0", "Merge Gate: LOCKED"],
  AUDIT: ["Replay Integrity: PASS", "Last Checkpoint: Current", "Rollback State: Ready", "Runtime Drift: None"],
  LAYERS: ["Layers Complete: 0 / 12", "Scoring Model: Pending", "Coverage: Pending", "Promotion: LOCKED"],
};

window.renderFounderContext = function renderFounderContext(mode) {
  const target = document.getElementById("founderContextBody");
  if (!target) return;

  const rows = contextContent[mode] || contextContent.GLOBAL;

  target.innerHTML = rows
    .map((row) => `<div style="margin-bottom:8px;">${row}</div>`)
    .join("");
};