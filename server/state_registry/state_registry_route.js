// server/state_registry/state_registry_route.js
// CommonJS + Express Router
//
// Routes:
//   GET /api/state_registry/health
//   GET /api/state_registry/lookup?state=OR&name=Nike
//   GET /api/state_registry/lookup?state=OR&registryNumber=1234567
//
// This file expects:
//   - ./state_registry_service.js exports { lookupBusiness }
//   - ./state_registry_config.json exists

const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");

// IMPORTANT: service exports lookupBusiness (not lookupStateRegistry)
const { lookupBusiness } = require("./state_registry_service");

function loadConfig() {
  const configPath = path.join(__dirname, "state_registry_config.json");
  const raw = fs.readFileSync(configPath, "utf8");
  const cfg = JSON.parse(raw);

  // Minimal sanity checks (fail early with clear errors)
  if (!cfg || typeof cfg !== "object") throw new Error("state_registry_config.json is not an object");
  if (!cfg.states || typeof cfg.states !== "object") throw new Error("Config missing 'states' object");

  return cfg;
}

function safePublicConfig(cfg) {
  // Keep anything sensitive out of responses.
  // (If you add keys/tokens later, DO NOT return them here.)
  return {
    module: cfg.module || "state_registry",
    version: cfg.version || "1.0.0",
    defaultState: cfg.defaultState || "OR",
    statesCount: Object.keys(cfg.states || {}).length,
    timeoutMs: cfg.timeoutMs ?? null,
    cacheTtlSeconds: cfg.cacheTtlSeconds ?? null,
    retryMax: cfg.retryMax ?? null,
    notes: cfg.notes || "",
  };
}

router.get("/health", (req, res) => {
  try {
    const cfg = loadConfig();
    res.json({
      ok: true,
      ...safePublicConfig(cfg),
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "STATE_REGISTRY_HEALTH_ERROR",
      message: err.message,
    });
  }
});

router.get("/lookup", async (req, res) => {
  const started = Date.now();

  try {
    const cfg = loadConfig();

    const state = (req.query.state || cfg.defaultState || "OR").toString().trim().toUpperCase();
    const name = req.query.name ? String(req.query.name) : null;
    const registryNumber = req.query.registryNumber ? String(req.query.registryNumber) : null;

    // Call the service (correct function name)
    const result = await lookupBusiness({
      state,
      name,
      registryNumber,
      cfg,
    });

    // Add response timing for quick debugging
    result.debug = result.debug || {};
    result.debug.routeDurationMs = Date.now() - started;

    res.json(result);
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "STATE_REGISTRY_LOOKUP_ERROR",
      message: err.message,
    });
  }
});

module.exports = router;