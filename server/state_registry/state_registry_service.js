// /server/state_registry/state_registry_service.js
// CommonJS
//
// "Best potential yet" operational version:
// - Adapter interface (method -> adapter function)
// - Config-driven timeout + retries
// - In-memory caching with TTL + max size
// - Oregon adapter implemented via Oregon Open Data (Socrata)
// - Other states remain placeholders (future adapters drop-in)

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_CACHE_TTL_SECONDS = 300;
const DEFAULT_CACHE_MAX_ITEMS = 500;
const DEFAULT_RETRY_MAX = 2;

// -----------------------------
// Small utilities
// -----------------------------
function nowIso() {
  return new Date().toISOString();
}

function normState(s) {
  return String(s || "").trim().toUpperCase();
}

function normName(s) {
  return String(s || "").trim();
}

function safeJsonParse(x, fallback) {
  try {
    return JSON.parse(x);
  } catch {
    return fallback;
  }
}

function isLikelyRegistryNumber(x) {
  if (x === null || x === undefined) return false;
  const s = String(x).trim();
  return /^[0-9]{3,20}$/.test(s);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function asInt(n, fallback) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.floor(v) : fallback;
}

function pick(obj, keys) {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return null;
}

function escSocrataLiteral(s) {
  // escape single quotes for $where
  return String(s).replace(/'/g, "''");
}

// -----------------------------
// Simple in-memory cache (TTL + max size)
// -----------------------------
const CACHE = new Map(); // key -> { expiresAt:number, value:any, createdAt:number }
let CACHE_HITS = 0;
let CACHE_MISSES = 0;

function cacheKey({ state, name, registryNumber }) {
  return [
    normState(state),
    registryNumber ? `rn:${String(registryNumber).trim()}` : "",
    name ? `name:${normName(name).toLowerCase()}` : "",
  ].filter(Boolean).join("|");
}

function cacheGet(key) {
  const entry = CACHE.get(key);
  if (!entry) {
    CACHE_MISSES++;
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    CACHE.delete(key);
    CACHE_MISSES++;
    return null;
  }
  CACHE_HITS++;
  return entry.value;
}

function cacheSet(key, value, ttlSeconds, maxItems) {
  const ttlMs = Math.max(1, asInt(ttlSeconds, DEFAULT_CACHE_TTL_SECONDS)) * 1000;
  const expiresAt = Date.now() + ttlMs;

  // simple eviction: if too big, delete oldest entries
  if (CACHE.size >= maxItems) {
    const entries = Array.from(CACHE.entries())
      .sort((a, b) => (a[1]?.createdAt || 0) - (b[1]?.createdAt || 0));
    const toRemove = Math.max(1, Math.ceil(maxItems * 0.1));
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      CACHE.delete(entries[i][0]);
    }
  }

  CACHE.set(key, { expiresAt, value, createdAt: Date.now() });
}

// -----------------------------
// HTTP fetch with timeout + retries
// -----------------------------
async function fetchWithRetry(url, { headers = {}, timeoutMs, retryMax }) {
  const t = asInt(timeoutMs, DEFAULT_TIMEOUT_MS);
  const rmax = asInt(retryMax, DEFAULT_RETRY_MAX);

  let lastErr = null;

  for (let attempt = 0; attempt <= rmax; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), t);

    try {
      const res = await fetch(url, { headers, signal: controller.signal });
      const text = await res.text();
      clearTimeout(timer);

      // Retry on rate-limit or transient server errors
      const shouldRetry = (res.status === 429 || (res.status >= 500 && res.status <= 599));
      if (!res.ok && shouldRetry && attempt < rmax) {
        // backoff with jitter
        const backoff = Math.round((250 * Math.pow(2, attempt)) + Math.random() * 150);
        await sleep(backoff);
        continue;
      }

      if (!res.ok) {
        const err = new Error(`HTTP ${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
        err.status = res.status;
        err.body = text;
        throw err;
      }

      return { ok: true, status: res.status, text };
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;

      // Abort timeout or network error: retry if attempts remain
      const retryable =
        (e && (e.name === "AbortError" || e.code === "ECONNRESET" || e.code === "ETIMEDOUT")) ||
        (typeof e?.message === "string" && e.message.toLowerCase().includes("network"));

      if (attempt < rmax && retryable) {
        const backoff = Math.round((250 * Math.pow(2, attempt)) + Math.random() * 150);
        await sleep(backoff);
        continue;
      }

      throw e;
    }
  }

  throw lastErr || new Error("fetchWithRetry failed with unknown error.");
}

// -----------------------------
// Socrata helpers
// -----------------------------
async function socrataFetch({ domain, datasetId, appToken, params, timeoutMs, retryMax }) {
  const base = `https://${domain}/resource/${datasetId}.json`;
  const url = new URL(base);

  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });

  const headers = {};
  if (appToken) headers["X-App-Token"] = appToken;

  const { text } = await fetchWithRetry(url.toString(), { headers, timeoutMs, retryMax });
  const data = safeJsonParse(text, []);

  return { data, url: url.toString() };
}

async function socrataTryFieldCombos({
  domain,
  datasetId,
  appToken,
  fieldCombos,
  limit,
  timeoutMs,
  retryMax,
}) {
  let lastErr = null;

  for (const attempt of fieldCombos) {
    try {
      const params = {
        $limit: limit,
        ...(attempt.select ? { $select: attempt.select } : {}),
        ...(attempt.where ? { $where: attempt.where } : {}),
        ...(attempt.order ? { $order: attempt.order } : {}),
      };

      const out = await socrataFetch({
        domain,
        datasetId,
        appToken,
        params,
        timeoutMs,
        retryMax,
      });

      return out;
    } catch (e) {
      lastErr = e;
      continue;
    }
  }

  throw lastErr || new Error("Socrata query attempts failed.");
}

// -----------------------------
// Adapter interface
// -----------------------------
// Each adapter returns a normalized response:
// {
//   ok: boolean,
//   integrated: boolean,
//   method: string,
//   query: { state, name, registryNumber },
//   match: { confidence, strategy, ... } | null,
//   business: { ... },
//   parties: { ... },
//   addresses: { ... },
//   evidence: { sourceName, sourceUrl, retrievedAt, notes },
//   debug: { durationMs, cacheHit, adapter, ... }
// }

function buildBaseResponse({ state, name, registryNumber }) {
  return {
    ok: true,
    integrated: false,
    method: "placeholder",
    query: {
      state: state || null,
      name: name || null,
      registryNumber: registryNumber || null,
    },
    match: null,
    business: {
      registryId: null,
      businessName: null,
      legalName: null,
      status: "unknown",
      formationDate: null,
      entityType: null,
      jurisdiction: state || null,
    },
    parties: {
      registeredAgent: { name: null, address: null },
      officers: [],
    },
    addresses: {
      principal: null,
      mailing: null,
    },
    evidence: {
      sourceName: "state_placeholder",
      sourceUrl: null,
      retrievedAt: nowIso(),
      notes: "State not implemented yet.",
    },
    debug: {
      durationMs: 0,
      cacheHit: false,
      adapter: "placeholder",
    },
  };
}

// -----------------------------
// OR adapter: Socrata (Oregon Open Data)
// -----------------------------
async function adapterOregonSocrata({ stateCfg, globalCfg, query }) {
  const start = Date.now();

  const domain = String(stateCfg?.socrata?.domain || "data.oregon.gov").trim();
  const datasetId = String(stateCfg?.socrata?.datasetId || "tckn-sxa6").trim();
  const appToken = stateCfg?.socrata?.appToken || "";

  const timeoutMs = asInt(globalCfg?.timeoutMs, DEFAULT_TIMEOUT_MS);
  const retryMax = asInt(globalCfg?.retryMax, DEFAULT_RETRY_MAX);

  // Field candidates (datasets can vary)
  const REG_FIELDS = ["registry_number", "registry_no", "registry", "registryid", "registry_id"];
  const NAME_FIELDS = ["business_name", "name", "assumed_name", "entity_name", "businessname"];

  const rowToBusiness = (row) => ({
    registryId: pick(row, ["registry_number", "registry_no", "registry", "registryid", "registry_id"]),
    businessName: pick(row, ["business_name", "name", "entity_name", "assumed_name"]),
    legalName: pick(row, ["business_name", "name", "entity_name"]),
    entityType: pick(row, ["entity_type", "business_type", "type", "entity"]),
    status: pick(row, ["status", "registry_status", "entity_status"]) || "unknown",
    formationDate: pick(row, ["registry_date", "formation_date", "created_at"]),
    jurisdiction: "OR",
  });

  // 1) Registry number exact
  if (query.registryNumber && isLikelyRegistryNumber(query.registryNumber)) {
    const rn = String(query.registryNumber).trim();
    const attempts = REG_FIELDS.map((f) => ({
      where: `${f}='${escSocrataLiteral(rn)}'`,
      select: "*",
    }));

    const { data, url } = await socrataTryFieldCombos({
      domain,
      datasetId,
      appToken,
      fieldCombos: attempts,
      limit: 3,
      timeoutMs,
      retryMax,
    });

    const rows = Array.isArray(data) ? data : [];
    const row = rows[0] || null;

    const out = buildBaseResponse({ state: "OR", name: query.name, registryNumber: query.registryNumber });
    out.integrated = true;
    out.method = "socrata";
    out.evidence = {
      sourceName: "OR_open_data_socrata",
      sourceUrl: url,
      retrievedAt: nowIso(),
      notes: row ? "Matched OR dataset via registry number." : "No registry number match in OR dataset.",
    };
    out.debug = {
      durationMs: Date.now() - start,
      cacheHit: false,
      adapter: "or_socrata",
    };

    if (!row) return out;

    out.match = { confidence: 0.99, strategy: "registry_number_exact" };
    out.business = rowToBusiness(row);
    out.parties.registeredAgent.name = pick(row, ["registered_agent_name", "agent_name"]);
    out.parties.registeredAgent.address = pick(row, ["registered_agent_address", "agent_address"]);
    out.addresses.principal = pick(row, ["principal_address"]);
    out.addresses.mailing = pick(row, ["mailing_address"]);

    return out;
  }

  // 2) Name search
  const name = normName(query.name);
  const out = buildBaseResponse({ state: "OR", name: query.name, registryNumber: query.registryNumber });
  out.integrated = true;
  out.method = "socrata";

  if (!name) {
    out.evidence = {
      sourceName: "OR_open_data_socrata",
      sourceUrl: null,
      retrievedAt: nowIso(),
      notes: "No name or registry number provided.",
    };
    out.debug = { durationMs: Date.now() - start, cacheHit: false, adapter: "or_socrata" };
    return out;
  }

  const esc = escSocrataLiteral(name.toUpperCase());
  const attempts = NAME_FIELDS.map((f) => ({
    where: `upper(${f}) like '%${esc}%'`,
    select: "*",
    order: `${f} asc`,
  }));

  const { data, url } = await socrataTryFieldCombos({
    domain,
    datasetId,
    appToken,
    fieldCombos: attempts,
    limit: 5,
    timeoutMs,
    retryMax,
  });

  const rows = Array.isArray(data) ? data : [];
  out.evidence = {
    sourceName: "OR_open_data_socrata",
    sourceUrl: url,
    retrievedAt: nowIso(),
    notes: rows.length ? "Matched OR dataset via name search." : "No name matches found in OR dataset.",
  };
  out.debug = { durationMs: Date.now() - start, cacheHit: false, adapter: "or_socrata" };

  if (!rows.length) return out;

  // pick best
  const qUpper = name.toUpperCase();
  let best = rows[0];
  let bestScore = 0.45;

  for (const r of rows) {
    const cand = String(pick(r, ["business_name", "name", "entity_name", "assumed_name"]) || "").toUpperCase();
    if (!cand) continue;

    let score = 0.55;
    if (cand === qUpper) score = 0.98;
    else if (cand.startsWith(qUpper)) score = 0.82;
    else if (cand.includes(qUpper)) score = 0.68;

    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }

  out.match = {
    confidence: bestScore,
    strategy: bestScore >= 0.95 ? "name_exact" : (bestScore >= 0.80 ? "name_startswith" : "name_contains"),
  };
  out.business = rowToBusiness(best);
  out.parties.registeredAgent.name = pick(best, ["registered_agent_name", "agent_name"]);
  out.parties.registeredAgent.address = pick(best, ["registered_agent_address", "agent_address"]);
  out.addresses.principal = pick(best, ["principal_address"]);
  out.addresses.mailing = pick(best, ["mailing_address"]);

  return out;
}

// -----------------------------
// Placeholder adapter
// -----------------------------
async function adapterPlaceholder({ stateCode, query }) {
  const start = Date.now();
  const out = buildBaseResponse({ state: stateCode, name: query.name, registryNumber: query.registryNumber });
  out.integrated = false;
  out.method = "placeholder";
  out.evidence = {
    sourceName: "state_placeholder",
    sourceUrl: null,
    retrievedAt: nowIso(),
    notes: `No adapter implemented for ${stateCode} yet.`,
  };
  out.debug = { durationMs: Date.now() - start, cacheHit: false, adapter: "placeholder" };
  return out;
}

// -----------------------------
// Adapter registry (method -> function)
// -----------------------------
function getAdapterForState(stateCode, globalCfg) {
  const states = globalCfg?.states || {};
  const stateCfg = states[stateCode] || null;

  // If state has an explicit method, use that
  const method = String(stateCfg?.method || "placeholder").toLowerCase();

  // Oregon special case: allow method=socrata
  if (stateCode === "OR" && method === "socrata") {
    return {
      adapterName: "or_socrata",
      fn: (args) => adapterOregonSocrata(args),
      stateCfg,
    };
  }

  // Future: add more methods here, e.g. "html_portal", "soap", "paid_api", etc.
  return {
    adapterName: "placeholder",
    fn: (args) => adapterPlaceholder({ stateCode, query: args.query }),
    stateCfg,
  };
}

// -----------------------------
// Public function called by route
// -----------------------------
async function lookupBusiness({ state, name, registryNumber, cfg }) {
  const globalCfg = cfg || {};
  const stateCode = normState(state || globalCfg.defaultState || "OR");

  const query = {
    state: stateCode,
    name: name ? String(name) : null,
    registryNumber: registryNumber ? String(registryNumber) : null,
  };

  // caching config
  const ttl = asInt(globalCfg.cacheTtlSeconds, DEFAULT_CACHE_TTL_SECONDS);
  const maxItems = asInt(globalCfg.cacheMaxItems, DEFAULT_CACHE_MAX_ITEMS);

  const key = cacheKey(query);
  const cached = cacheGet(key);
  if (cached) {
    // attach cache debug overlay (without mutating cached object deeply)
    const out = { ...cached };
    out.debug = {
      ...(out.debug || {}),
      cacheHit: true,
      cache: { ttlSeconds: ttl, maxItems, hits: CACHE_HITS, misses: CACHE_MISSES },
    };
    return out;
  }

  const start = Date.now();

  const { adapterName, fn, stateCfg } = getAdapterForState(stateCode, globalCfg);

  try {
    const res = await fn({
      stateCfg,
      globalCfg,
      query,
    });

    // Ensure required fields exist
    const out = res && typeof res === "object" ? res : buildBaseResponse(query);

    out.ok = out.ok !== false;
    out.query = out.query || { state: stateCode, name: query.name, registryNumber: query.registryNumber };
    out.debug = {
      ...(out.debug || {}),
      durationMs: (out.debug && out.debug.durationMs) ? out.debug.durationMs : (Date.now() - start),
      adapter: out.debug?.adapter || adapterName,
      cacheHit: false,
      cache: { ttlSeconds: ttl, maxItems, hits: CACHE_HITS, misses: CACHE_MISSES },
    };

    // cache successful responses (even "no match" is useful)
    cacheSet(key, out, ttl, maxItems);

    return out;
  } catch (e) {
    const out = buildBaseResponse({ state: stateCode, name: query.name, registryNumber: query.registryNumber });
    out.ok = false;
    out.integrated = false;
    out.method = adapterName;
    out.evidence = {
      sourceName: "adapter_error",
      sourceUrl: null,
      retrievedAt: nowIso(),
      notes: e?.message ? String(e.message) : "Unknown error in adapter.",
    };
    out.debug = {
      durationMs: Date.now() - start,
      cacheHit: false,
      adapter: adapterName,
      error: {
        name: e?.name || "Error",
        message: e?.message || "Unknown",
        status: e?.status,
      },
      cache: { ttlSeconds: ttl, maxItems, hits: CACHE_HITS, misses: CACHE_MISSES },
    };
    return out;
  }
}

module.exports = {
  lookupBusiness,
};