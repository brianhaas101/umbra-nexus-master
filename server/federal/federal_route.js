// /server/federal/federal_route.js
const express = require("express");
const router = express.Router();

async function httpGetJson(url, headers = {}) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": "UmbraNexus/1.0 (contact: you@example.com)",
      "Accept-Encoding": "gzip, deflate, br",
      ...headers,
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return await r.json();
}

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    module: "federal",
    version: "1.0.0",
    serverTime: new Date().toISOString(),
    endpoints: ["/sec/search?q=..."],
  });
});

// ✅ SEC: search by ticker -> returns best match (CIK + title)
router.get("/sec/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toUpperCase();
    if (!q) {
      return res.status(400).json({
        ok: false,
        error: "BAD_REQUEST",
        message: "Missing required query param: q",
      });
    }

    // SEC ticker to CIK list (public JSON)
    const tickersUrl = "https://www.sec.gov/files/company_tickers.json";
    const tickers = await httpGetJson(tickersUrl);

    // tickers is an object keyed by number: { "0": {cik_str, ticker, title}, ... }
    let best = null;
    for (const k of Object.keys(tickers)) {
      const row = tickers[k];
      if (!row) continue;
      if (String(row.ticker || "").toUpperCase() === q) {
        best = row;
        break;
      }
    }

    if (!best) {
      return res.json({
        ok: true,
        module: "federal",
        method: "sec_ticker_lookup",
        query: { q },
        found: false,
        match: null,
        sourceUrl: tickersUrl,
        retrievedAt: new Date().toISOString(),
      });
    }

    // Normalize cik to 10 digits as SEC expects in some endpoints
    const cik10 = String(best.cik_str).padStart(10, "0");

    res.json({
      ok: true,
      module: "federal",
      method: "sec_ticker_lookup",
      query: { q },
      found: true,
      match: {
        ticker: best.ticker,
        title: best.title,
        cik_str: best.cik_str,
        cik10,
      },
      sourceUrl: tickersUrl,
      retrievedAt: new Date().toISOString(),
      next: {
        companyFacts: `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik10}.json`,
        submissions: `https://data.sec.gov/submissions/CIK${cik10}.json`,
      },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: "FEDERAL_SEC_SEARCH_ERROR",
      message: err && err.message ? err.message : String(err),
    });
  }
});

module.exports = router;