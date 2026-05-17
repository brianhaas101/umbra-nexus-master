window.FOUNDER_RUNTIME = {
  activeMode: "GLOBAL",

  telemetry: {
    ingest: "IDLE",
    geocodeFailures: 0,
    conflicts: 0,
    exportLock: "ENABLED",
  },

  city: {
    activeCity: null,
    spatialConfidence: "A",
    verifiedNodes: 0,
  },

  audit: {
    replayIntegrity: "PASS",
    rollbackReady: true,
  },
};

window.setFounderMode = function setFounderMode(mode) {
  window.FOUNDER_RUNTIME.activeMode = mode;

  const modeLabel = document.getElementById("founderModeLabel");

  if (modeLabel) {
    modeLabel.textContent = mode;
  }

  if (window.renderFounderWorkspace) {
    window.renderFounderWorkspace(mode);
  }

  if (window.renderFounderContext) {
    window.renderFounderContext(mode);
  }

  console.log("[FounderRuntime] Active mode:", mode);
};