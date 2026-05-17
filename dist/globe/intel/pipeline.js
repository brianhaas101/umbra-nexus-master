// public/globe/intel/pipeline.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) {
    console.error("[intel/pipeline] UmbraGlobe missing.");
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

  function validLatLon(lat, lon) {
    return Number.isFinite(lat) && Number.isFinite(lon) &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180;
  }

  function normalizeConfidence(v) {
    const n = asNum(v);
    if (n === null) return null;
    if (n > 1.00001) return Math.max(0, Math.min(1, n / 100));
    return Math.max(0, Math.min(1, n));
  }

  function normalizeSourceRecord(source, record) {
    const srcKey = str(source?.source_key);
    const layer = str(source?.layer);

    const external_id = str(record?.external_id ?? record?.externalId ?? record?.id);
    const observed_at = str(record?.observed_at ?? record?.observedAt ?? record?.timestamp);
    const confidence = normalizeConfidence(record?.confidence);

    const payload = isObj(record?.payload) ? record.payload : (isObj(record) ? record : null);

    const lat =
      asNum(record?.location?.lat) ??
      asNum(record?.lat) ??
      asNum(payload?.location?.lat) ??
      asNum(payload?.lat);

    const lon =
      asNum(record?.location?.lon) ??
      asNum(record?.location?.lng) ??
      asNum(record?.lon) ??
      asNum(record?.lng) ??
      asNum(payload?.location?.lon) ??
      asNum(payload?.location?.lng) ??
      asNum(payload?.lon) ??
      asNum(payload?.lng);

    const out = {
      source_key: srcKey,
      layer,
      external_id,
      observed_at,
      confidence,
      location: validLatLon(lat, lon) ? { lat, lon } : null,
      payload,
      raw_ref: record
    };

    const errors = [];
    if (!srcKey) errors.push("MISSING_SOURCE_KEY");
    if (!layer) errors.push("MISSING_LAYER");
    if (!external_id) errors.push("MISSING_EXTERNAL_ID");
    if (!observed_at) errors.push("MISSING_OBSERVED_AT");
    if (!payload) errors.push("MISSING_PAYLOAD");

    return {
      ok: errors.length === 0,
      errors,
      value: out
    };
  }

  async function runAdapter(source, context) {
    const adapterKey = str(source?.adapter_key);
    const adapter = G.intel.adapters[adapterKey];

    if (typeof adapter !== "function") {
      return {
        ok: false,
        source_key: source?.source_key || null,
        records: [],
        errors: [`ADAPTER_MISSING:${adapterKey}`]
      };
    }

    try {
      const result = await adapter({
        source,
        context: context || {}
      });

      const rawRecords = Array.isArray(result?.records) ? result.records : [];
      const normalized = [];
      const errors = [];

      for (const record of rawRecords) {
        const norm = normalizeSourceRecord(source, record);
        if (!norm.ok) {
          errors.push(...norm.errors.map((e) => `${source.source_key}:${e}`));
          continue;
        }
        normalized.push(norm.value);
      }

      return {
        ok: errors.length === 0,
        source_key: source.source_key,
        records: normalized,
        errors
      };
    } catch (e) {
      return {
        ok: false,
        source_key: source?.source_key || null,
        records: [],
        errors: [`ADAPTER_THROW:${String(e?.message || e)}`]
      };
    }
  }

  G.intel.pipeline = {
    VERSION: "v1",

    async collect(context) {
      const registry = G.intel.registry;
      if (!registry) {
        console.error("[intel/pipeline] registry missing.");
        return {
          ok: false,
          records: [],
          reports: [],
          errors: ["REGISTRY_MISSING"]
        };
      }

      const sources = registry.getEnabledSources();
      const reports = [];
      const allRecords = [];
      const errors = [];

      for (const source of sources) {
        const report = await runAdapter(source, context);
        reports.push(report);

        if (Array.isArray(report.records) && report.records.length) {
          allRecords.push(...report.records);
        }

        if (Array.isArray(report.errors) && report.errors.length) {
          errors.push(...report.errors);
        }
      }

      return {
        ok: errors.length === 0,
        records: allRecords,
        reports,
        errors
      };
    },

    summarize(result) {
      const records = Array.isArray(result?.records) ? result.records : [];
      const reports = Array.isArray(result?.reports) ? result.reports : [];
      const errors = Array.isArray(result?.errors) ? result.errors : [];

      const byLayer = {};
      for (const r of records) {
        const layer = str(r?.layer) || "unknown";
        byLayer[layer] = (byLayer[layer] || 0) + 1;
      }

      return {
        ok: errors.length === 0,
        recordCount: records.length,
        sourceCount: reports.length,
        byLayer,
        errors
      };
    }
  };

  console.log("[intel/pipeline] LOADED");
})();