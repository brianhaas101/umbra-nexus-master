// public/globe/intel/adapters/private_primary.adapter.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) {
    console.error("[intel/adapters/private_primary] UmbraGlobe missing.");
    return;
  }

  G.intel = G.intel || {};
  G.intel.adapters = G.intel.adapters || {};

  function str(x) {
    return String(x ?? "").trim();
  }

  function asNum(x) {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
  }

  function isObj(x) {
    return !!x && typeof x === "object" && !Array.isArray(x);
  }

  function clamp01(v) {
    const n = asNum(v);
    if (n === null) return null;
    if (n > 1.00001) return Math.max(0, Math.min(1, n / 100));
    return Math.max(0, Math.min(1, n));
  }

  function validLatLon(lat, lon) {
    return Number.isFinite(lat) && Number.isFinite(lon) &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180;
  }

  function pickFirst(obj, keys) {
    if (!isObj(obj)) return undefined;
    for (const key of keys) {
      if (!(key in obj)) continue;
      const v = obj[key];
      if (v === null || v === undefined) continue;
      if (typeof v === "string" && !v.trim()) continue;
      return v;
    }
    return undefined;
  }

  function readLocation(record) {
    const loc = isObj(record?.location) ? record.location : null;
    const lat =
      asNum(pickFirst(loc, ["lat", "latitude"])) ??
      asNum(pickFirst(record, ["lat", "latitude"]));

    const lon =
      asNum(pickFirst(loc, ["lon", "lng", "longitude"])) ??
      asNum(pickFirst(record, ["lon", "lng", "longitude"]));

    if (!validLatLon(lat, lon)) return null;

    return {
      lat,
      lon,
      city: str(pickFirst(loc, ["city", "city_name"]) ?? pickFirst(record, ["city", "city_name"])),
      region: str(pickFirst(loc, ["region", "state", "province"]) ?? pickFirst(record, ["region", "state", "province"])),
      country: str(pickFirst(loc, ["country"]) ?? pickFirst(record, ["country"]))
    };
  }

  function normalizeConfidence(record) {
    return clamp01(
      pickFirst(record, ["confidence", "score_confidence", "match_confidence"]) ??
      record?.scores?.confidence
    );
  }

  function normalizeObservedAt(record) {
    return str(
      pickFirst(record, [
        "observed_at",
        "observedAt",
        "updated_at",
        "updatedAt",
        "created_at",
        "createdAt",
        "timestamp",
        "date"
      ])
    );
  }

  function normalizeExternalId(record) {
    return str(
      pickFirst(record, [
        "external_id",
        "externalId",
        "id",
        "_id",
        "uuid",
        "record_id",
        "recordId"
      ])
    );
  }

  function normalizePayload(record) {
    if (!isObj(record)) return null;

    const location = readLocation(record);

    return {
      name: str(pickFirst(record, ["name", "title", "label", "business", "company"])),
      entity_type: str(pickFirst(record, ["entity_type", "entityType", "type"])),
      location,
      attributes: isObj(record.attributes) ? record.attributes : null,
      tags: Array.isArray(record.tags) ? record.tags.slice() : [],
      meta: isObj(record.meta) ? record.meta : null,
      sources: Array.isArray(record.sources) ? record.sources.slice() : [],
      scores: isObj(record.scores) ? { ...record.scores } : null,
      raw: record
    };
  }

  function normalizeRecord(record, source) {
    const external_id = normalizeExternalId(record);
    const observed_at = normalizeObservedAt(record);
    const confidence = normalizeConfidence(record);
    const payload = normalizePayload(record);

    return {
      source_key: str(source?.source_key || "private_primary"),
      layer: str(source?.layer || "private"),
      external_id,
      observed_at,
      confidence,
      location: payload?.location || null,
      payload,
      raw_ref: record
    };
  }

  function extractRecordArray(json) {
    if (Array.isArray(json)) return json;
    if (Array.isArray(json?.records)) return json.records;
    if (Array.isArray(json?.items)) return json.items;
    if (Array.isArray(json?.results)) return json.results;
    if (Array.isArray(json?.data)) return json.data;
    return [];
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`JSON_PARSE_FAIL: ${String(e?.message || e)}`);
    }

    return json;
  }

  function buildHeaders(context) {
    const headers = {
      "Accept": "application/json"
    };

    const apiKey = str(
      context?.apiKey ??
      context?.auth?.apiKey ??
      window.UMBRA_PRIVATE_PRIMARY_API_KEY
    );

    const bearerToken = str(
      context?.bearerToken ??
      context?.auth?.bearerToken ??
      window.UMBRA_PRIVATE_PRIMARY_BEARER_TOKEN
    );

    if (apiKey) headers["x-api-key"] = apiKey;
    if (bearerToken) headers["Authorization"] = `Bearer ${bearerToken}`;

    return headers;
  }

  function buildUrl(source, context) {
    const explicit =
      str(context?.url) ||
      str(context?.endpoint) ||
      str(source?.endpoint) ||
      str(window.UMBRA_PRIVATE_PRIMARY_ENDPOINT);

    if (!explicit) {
      throw new Error("PRIVATE_PRIMARY_ENDPOINT_MISSING");
    }

    const url = new URL(explicit, window.location.origin);

    const q = context?.query;
    if (isObj(q)) {
      for (const [key, value] of Object.entries(q)) {
        if (value === null || value === undefined) continue;
        const sv = String(value).trim();
        if (!sv) continue;
        url.searchParams.set(key, sv);
      }
    }

    return url.toString();
  }

  G.intel.adapters.private_primary = async function privatePrimaryAdapter({ source, context }) {
    const timeoutMs = asNum(context?.timeout_ms ?? source?.timeout_ms) || 15000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = buildUrl(source, context);
      const headers = buildHeaders(context);

      const method = String(context?.method || "GET").toUpperCase();
      const body =
        method === "GET"
          ? undefined
          : JSON.stringify(isObj(context?.body) ? context.body : {});

      const json = await fetchJson(url, {
        method,
        headers: {
          ...headers,
          ...(method === "GET" ? {} : { "Content-Type": "application/json" })
        },
        body,
        signal: controller.signal,
        cache: "no-store"
      });

      const rawRecords = extractRecordArray(json);
      const records = rawRecords.map((record) => normalizeRecord(record, source));

      return {
        records
      };
    } catch (e) {
      console.error("[intel/adapters/private_primary] FAIL", {
        source_key: source?.source_key || "private_primary",
        error: String(e?.message || e)
      });

      return {
        records: []
      };
    } finally {
      clearTimeout(timer);
    }
  };

  console.log("[intel/adapters/private_primary] LOADED");
})();