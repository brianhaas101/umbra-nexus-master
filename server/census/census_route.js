// /server/census/census_route.js
const express = require("express");
const router = express.Router();

// Node 18+ has fetch built-in.
// If your Node ever complains, install: npm i node-fetch and import it.
async function httpGetJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": "UmbraNexus/1.0" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.json();
}

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    module: "census",
    version: "1.0.0",
    serverTime: new Date().toISOString(),
    endpoints: ["/geocode?address=..."],
  });
});

// ✅ Working endpoint: Census Geocoder
// Example: /api/census/geocode?address=1200%20Willamette%20St%20Eugene%20OR
router.get("/geocode", async (req, res) => {
  try {
    const address = String(req.query.address || "").trim();
    if (!address) {
      return res.status(400).json({
        ok: false,
        error: "BAD_REQUEST",
        message: "Missing required query param: address",
      });
    }

    const url =
      "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress" +
      `?address=${encodeURIComponent(address)}` +
      "&benchmark=Public_AR_Current&format=json";

    const data = await httpGetJson(url);

    // normalize result
    const matches = data?.result?.addressMatches || [];
    const best = matches[0] || null;

    res.json({
      ok: true,
      module: "census",
      method: "census_geocoder",
      query: { address },
      matchCount: matches.length,
      best:
        best
          ? {
              matchedAddress: best.matchedAddress || null,
              coordinates: best.coordinates || null,
              tigerLine: best.tigerLine || null,
              geographies: best.geographies || null,
            }
          : null,
      sourceUrl: url,
      retrievedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "CENSUS_GEOCODE_ERROR",
      message: err && err.message ? err.message : String(err),
    });
  }
});

module.exports = router;