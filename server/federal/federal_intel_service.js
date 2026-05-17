// server/federal_intel/federal_intel_service.js
// Umbra Nexus – API-first federal intel service.
// No fake / random data. Where a real public API exists, we call it.
// Where it doesn't (or requires paid access), we clearly say "not integrated yet."

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

let config = null;

function loadConfig() {
  if (config) return config;
  const configPath = path.join(__dirname, "federal_intel_config.json");
  const raw = fs.readFileSync(configPath, "utf8");
  config = JSON.parse(raw);
  return config;
}

/**
 * Helper: standard "not integrated" payload.
 */
function notIntegrated(sourceName, extra = {}) {
  return {
    integrated: false,
    source: sourceName,
    message: `${sourceName} is not yet wired to a usable public API in Umbra.`,
    ...extra
  };
}

/**
 * Helper: normalized error wrapper so errors don't leak internals to the UI.
 */
function wrapApiError(sourceName, err) {
  return {
    integrated: true,
    source: sourceName,
    error: true,
    errorMessage: err.message || String(err)
  };
}

/* -------------------------------------------------------------------------- */
/*  1) CFPB Consumer Complaint Database – REAL PUBLIC API                     */
/*      Docs: https://cfpb.github.io/api/ccdb/                                */
/* -------------------------------------------------------------------------- */

async function getCfpbComplaintSummary(companyName) {
  loadConfig();

  const name = (companyName || "").trim();
  if (!name) {
    throw new Error("Company name is required for CFPB complaints lookup");
  }

  const baseUrl =
    "https://www.consumerfinance.gov/data-research/consumer-complaints/search/api/v1/";

  const url = new URL(baseUrl);
  url.searchParams.set("company", name);
  url.searchParams.set("format", "json");
  url.searchParams.set("size", "10"); // small sample

  try {
    const res = await fetch(url.href);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `CFPB API error: ${res.status} ${res.statusText} – ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();
    return {
      integrated: true,
      source: "cfpb_complaints",
      companyName: name,
      raw: data
    };
  } catch (err) {
    return wrapApiError("cfpb_complaints", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  2) USAspending – federal contracts summary                               */
/*      Docs: https://api.usaspending.gov/docs/                              */
/* -------------------------------------------------------------------------- */

async function getFederalContractSummary(recipientName) {
  loadConfig();

  const name = (recipientName || "").trim();
  if (!name) {
    throw new Error("Recipient name is required for USAspending lookup");
  }

  // We use the "spending_by_award" search endpoint with a simple recipient filter.
  // This is a very lightweight summary, not a full deep dive.
  const endpoint = "https://api.usaspending.gov/api/v2/search/spending_by_award/";
  const body = {
    filters: {
      recipient_search_text: [name],
      // Time period: last 5 years (rough example, adjust as needed)
      time_period: [
        {
          start_date: "2020-01-01",
          end_date: new Date().toISOString().slice(0, 10)
        }
      ]
    },
    fields: ["Award ID", "Recipient Name", "Award Amount"],
    page: 1,
    limit: 25,
    sort: "Award Amount",
    order: "desc"
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `USAspending API error: ${res.status} ${res.statusText} – ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();

    // We don't invent aggregate numbers here – we just pass through the raw payload.
    return {
      integrated: true,
      source: "usa_spending",
      recipientName: name,
      raw: data
    };
  } catch (err) {
    return wrapApiError("usa_spending", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  3) EPA ECHO – enforcement / compliance summary                           */
/*      Docs hub: https://echo.epa.gov/tools/web-services                    */
/* -------------------------------------------------------------------------- */

async function getEpaComplianceSummary({ facilityName, city, state, zip }) {
  loadConfig();

  // ECHO web services allow searching by name + location. We'll do a very simple
  // facility-name + optional state filter to keep this generic.
  const baseUrl = "https://echo.epa.gov/echo/ws_facility";
  const url = new URL(baseUrl);

  if (facilityName) url.searchParams.set("fac_name", facilityName);
  if (state) url.searchParams.set("state", state);
  if (city) url.searchParams.set("city", city);
  if (zip) url.searchParams.set("zip", zip);
  url.searchParams.set("output", "JSON");

  try {
    const res = await fetch(url.href);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `EPA ECHO API error: ${res.status} ${res.statusText} – ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();

    // No computed scores – just return whatever ECHO gives back.
    return {
      integrated: true,
      source: "epa_echo",
      query: { facilityName, city, state, zip },
      raw: data
    };
  } catch (err) {
    return wrapApiError("epa_echo", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  4) BLS – labor / unemployment (macro context, not company-specific)      */
/*      Docs: https://www.bls.gov/developers/home.htm                        */
/* -------------------------------------------------------------------------- */

// BLS can give you county/state unemployment, wage indexes, etc.
// Here we just expose a generic "getSeries" wrapper. You decide which series IDs
// to use (they depend on what you care about).
async function getBlsSeries(seriesIds, startYear, endYear) {
  loadConfig();

  const ids = Array.isArray(seriesIds) ? seriesIds : [seriesIds];
  const body = {
    seriesid: ids,
    startyear: String(startYear),
    endyear: String(endYear)
  };

  const apiKey = process.env.BLS_API_KEY || null;
  if (apiKey) {
    body.registrationkey = apiKey;
  }

  const endpoint = "https://api.bls.gov/publicAPI/v2/timeseries/data/";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `BLS API error: ${res.status} ${res.statusText} – ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();
    return {
      integrated: true,
      source: "bls_public",
      raw: data
    };
  } catch (err) {
    return wrapApiError("bls_public", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  5) BEA – economic context (GDP, income)                                  */
/*      Docs: https://apps.bea.gov/api/signup/                               */
/* -------------------------------------------------------------------------- */

async function getBeaData(params) {
  loadConfig();

  const apiKey = process.env.BEA_API_KEY;
  if (!apiKey) {
    return notIntegrated("bea", {
      reason: "BEA_API_KEY not set in environment."
    });
  }

  // params should include: datasetname, TableName, Frequency, Year, etc.
  const url = new URL("https://apps.bea.gov/api/data");
  url.searchParams.set("UserID", apiKey);
  url.searchParams.set("ResultFormat", "JSON");
  for (const [k, v] of Object.entries(params || {})) {
    url.searchParams.set(k, v);
  }

  try {
    const res = await fetch(url.href);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `BEA API error: ${res.status} ${res.statusText} – ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();
    return {
      integrated: true,
      source: "bea",
      raw: data
    };
  } catch (err) {
    return wrapApiError("bea", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  6) USPTO – patents / trademarks summary                                  */
/*      Docs hub: https://data.uspto.gov/                                    */
/* -------------------------------------------------------------------------- */

async function getUsptoPatentSearch(query) {
  loadConfig();

  const apiKey = process.env.USPTO_API_KEY || "";
  // Open Data Portal search – exact endpoint/config may need tuning per dataset.
  const baseUrl = "https://developer.uspto.gov/ibd-api/v1/application/publications";

  const url = new URL(baseUrl);
  if (query && query.text) {
    url.searchParams.set("searchText", query.text);
  }
  url.searchParams.set("rows", query && query.rows ? String(query.rows) : "25");

  const headers = {};
  if (apiKey) headers["X-Api-Key"] = apiKey;

  try {
    const res = await fetch(url.href, { headers });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `USPTO API error: ${res.status} ${res.statusText} – ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();
    return {
      integrated: true,
      source: "uspto_patents",
      raw: data
    };
  } catch (err) {
    return wrapApiError("uspto_patents", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  7) SEC EDGAR – filings (requires CIK / ticker mapping)                   */
/*      Docs: https://www.sec.gov/search-filings/edgar-application-programming-interfaces */
/* -------------------------------------------------------------------------- */

async function getSecFilingsByCik(cik) {
  loadConfig();

  const cleanCik = (cik || "").replace(/[^\d]/g, "").padStart(10, "0");
  if (!cleanCik) {
    return notIntegrated("sec_edgar", {
      reason: "CIK required. Mapping from company name → CIK not implemented."
    });
  }

  const url = new URL(
    `https://data.sec.gov/submissions/CIK${cleanCik}.json`
  );

  // SEC requires a User-Agent identifying your app.
  const headers = {
    "User-Agent": "UmbraNexus/1.0 (your-email@example.com)"
  };

  try {
    const res = await fetch(url.href, { headers });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `SEC EDGAR API error: ${res.status} ${res.statusText} – ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();
    return {
      integrated: true,
      source: "sec_edgar",
      cik: cleanCik,
      raw: data
    };
  } catch (err) {
    return wrapApiError("sec_edgar", err);
  }
}

/* -------------------------------------------------------------------------- */
/*  8) Things that *don’t* have a clean, free API for your use-case          */
/*      (or require contracts / state-specific work)                         */
/* -------------------------------------------------------------------------- */

// IRS nonprofits: data is usually as bulk files / CSV, not a simple JSON API.
async function getIrsNonprofitSummary(einOrName) {
  return notIntegrated("irs_nonprofits", {
    identifier: einOrName || null,
    reason:
      "IRS nonprofit data is provided via bulk files/CSV; no simple JSON API used here yet."
  });
}

// SAM.gov, SBA, state-specific registries, DOT FMCSA, NHTSA, etc.
// Many of these require API keys, contracts, or paid vendors.
async function getSamGovEntitySummary(uniqueEntityId) {
  return notIntegrated("sam_gov", {
    uniqueEntityId: uniqueEntityId || null,
    reason:
      "SAM.gov entity API requires registration/keys; not wired in Umbra yet."
  });
}

async function getSbaLoanSummary(businessName) {
  return notIntegrated("sba", {
    businessName: businessName || null,
    reason:
      "SBA loan/exposure data not integrated yet; may require custom datasets or vendors."
  });
}

async function getOshaSafetySummary(companyName) {
  return notIntegrated("osha", {
    companyName: companyName || null,
    reason:
      "OSHA inspection data is exposed via tools and bulk data; no generic JSON search API wired yet."
  });
}

async function getDotFmcsaCarrierSummary(dotNumberOrName) {
  return notIntegrated("dot_fmcsa", {
    identifier: dotNumberOrName || null,
    reason:
      "FMCSA safety data typically requires dedicated API access; not wired yet."
  });
}

async function getNhtsaRecallSummary(vinOrModel) {
  return notIntegrated("nhtsa", {
    identifier: vinOrModel || null,
    reason:
      "NHTSA has a recalls API, but mapping from your leads → VIN/model not implemented yet."
  });
}

module.exports = {
  // real APIs
  getCfpbComplaintSummary,
  getFederalContractSummary,
  getEpaComplianceSummary,
  getBlsSeries,
  getBeaData,
  getUsptoPatentSearch,
  getSecFilingsByCik,

  // explicitly not integrated yet (no fake data)
  getIrsNonprofitSummary,
  getSamGovEntitySummary,
  getSbaLoanSummary,
  getOshaSafetySummary,
  getDotFmcsaCarrierSummary,
  getNhtsaRecallSummary
};