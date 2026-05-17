// /server/index.js
// Umbra Nexus — Server Entrypoint (Express)

const path = require("path");
const express = require("express");

const app = express();
app.use(express.json({ limit: "2mb" }));

// Serve /public as the UI root
const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

// ---- Helpers ----
function safeMount(routeBase, requirePath, label) {
  try {
    const mod = require(requirePath);
    app.use(routeBase, mod);
    console.log(`✅ Mounted: ${routeBase} -> ${requirePath} (${label})`);
    return true;
  } catch (err) {
    console.log(`⚠️ Skipped mount: ${routeBase} (${label})`);
    console.log(`   Reason: ${err && err.message ? err.message : String(err)}`);
    return false;
  }
}

const mounted = {
  state_registry: safeMount("/api/state_registry", "./state_registry/state_registry_route", "state_registry_route.js"),
  census: safeMount("/api/census", "./census/census_route", "census_route.js"),
  federal: safeMount("/api/federal", "./federal/federal_route", "federal_route.js"),
};

// ✅ FIX: /api should not be NOT_FOUND anymore
app.get("/api", (req, res) => {
  res.json({
    ok: true,
    module: "umbra_api_root",
    mounted,
    endpoints: {
      state_registry: ["/api/state_registry/health", "/api/state_registry/lookup?state=OR&name=Nike"],
      census: ["/api/census/health", "/api/census/geocode?address=1200%20Willamette%20St%20Eugene%20OR"],
      federal: ["/api/federal/health", "/api/federal/sec/search?q=AAPL"],
    },
    serverTime: new Date().toISOString(),
  });
});

// Fallback JSON 404 (so you get consistent “false” responses)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "NOT_FOUND",
    message: "Route not found",
    path: req.originalUrl,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟣 Umbra Nexus Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static: ${publicDir}`);
});