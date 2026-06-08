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

// BATCH 603R: native legacy alias export for pipeline
(function bindNativeIntelPipelineAliases603R() {
  const G = window.UmbraGlobe;
  if (!G || !G.intel || !G.intel.pipeline) return;
  G.IntelligencePipeline = G.IntelligencePipeline || G.intel.pipeline;
  G.intelligencePipeline = G.intelligencePipeline || G.intel.pipeline;
  G.__nativeIntelPipelineAlias603R = {
    installed: true,
    hasPipeline: !!G.intel.pipeline
  };
})();

// BATCH 609R: native intelligence scoring foundation
(function installNativeIntelligenceScoring609R() {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};
  G.intel = G.intel || {};
  G.intel.pipeline = G.intel.pipeline || {};

  if (G.intel.pipeline.__nativeScoring609RInstalled) return;
  G.intel.pipeline.__nativeScoring609RInstalled = true;

  const TIERS = [
    { min: 90, tier: "CRITICAL" },
    { min: 75, tier: "HIGH" },
    { min: 50, tier: "MEDIUM" },
    { min: 25, tier: "LOW" },
    { min: 0, tier: "DORMANT" }
  ];

  function num(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function resolveTier(score) {
    const n = clamp(num(score), 0, 100);
    for (const entry of TIERS) {
      if (n >= entry.min) return entry.tier;
    }
    return "DORMANT";
  }

  function deriveActivity(entity) {
    return clamp(
      num(entity.activityScore) ||
      num(entity.activity_score) ||
      num(entity.activity) ||
      (entity.status === "active" ? 15 : 5),
      0,
      20
    );
  }

  function deriveRelationships(entity) {
    const links = Array.isArray(entity.relationships) ? entity.relationships.length : 0;
    const connected = Array.isArray(entity.connected_entities) ? entity.connected_entities.length : 0;
    return clamp(
      num(entity.relationshipScore) ||
      num(entity.relationship_score) ||
      links * 4 ||
      connected * 4 ||
      8,
      0,
      20
    );
  }

  function deriveSignals(entity) {
    const tags = Array.isArray(entity.tags) ? entity.tags.length : 0;
    const signals = Array.isArray(entity.signals) ? entity.signals.length : 0;
    const alerts = Array.isArray(entity.alerts) ? entity.alerts.length : 0;
    return clamp(
      num(entity.signalScore) ||
      num(entity.signal_score) ||
      signals * 4 + alerts * 5 + tags * 2 ||
      10,
      0,
      20
    );
  }

  function derivePriority(entity) {
    const raw =
      entity.priority ||
      entity.node_priority ||
      entity.lead_priority ||
      entity.status ||
      "";

    const text = String(raw).toLowerCase();

    if (text.includes("critical")) return 20;
    if (text.includes("high")) return 17;
    if (text.includes("tracked")) return 15;
    if (text.includes("medium")) return 12;
    if (text.includes("low")) return 7;

    return clamp(
      num(entity.priorityScore) ||
      num(entity.priority_score) ||
      num(entity.node_priority) ||
      10,
      0,
      20
    );
  }

  function deriveRecency(entity) {
    const raw =
      entity.updated_at ||
      entity.last_updated ||
      entity.lastSeen ||
      entity.created_at ||
      null;

    if (!raw) return 10;

    const t = Date.parse(raw);
    if (!Number.isFinite(t)) return 10;

    const ageDays = Math.max(0, (Date.now() - t) / 86400000);

    if (ageDays <= 1) return 20;
    if (ageDays <= 7) return 16;
    if (ageDays <= 30) return 12;
    if (ageDays <= 90) return 8;
    return 4;
  }

  function scoreEntity(entity) {
    const target = entity || {};

    const activity = deriveActivity(target);
    const relationships = deriveRelationships(target);
    const signals = deriveSignals(target);
    const priority = derivePriority(target);
    const recency = deriveRecency(target);

    const score = clamp(
      Math.round(activity + relationships + signals + priority + recency),
      0,
      100
    );

    const intelligence = {
      score,
      tier: resolveTier(score),
      activity,
      relationships,
      signals,
      priority,
      recency,
      scored_at: new Date().toISOString(),
      source: "609R_native_intelligence_scoring"
    };

    target.intelligence = intelligence;
    return intelligence;
  }

  function scoreAllEntities(entities) {
    const list = Array.isArray(entities)
      ? entities
      : (Array.isArray(window.UMBRA_DATA?.entities) ? window.UMBRA_DATA.entities : []);

    return list
      .map(entity => {
        scoreEntity(entity);
        return entity;
      })
      .sort((a, b) => {
        return (b.intelligence?.score || 0) - (a.intelligence?.score || 0);
      });
  }

  function getTopEntities(limit) {
    const n = Math.max(1, Number(limit || 10));
    return scoreAllEntities().slice(0, n);
  }

  G.intel.pipeline.scoreEntity = scoreEntity;
  G.intel.pipeline.scoreAllEntities = scoreAllEntities;
  G.intel.pipeline.getTopEntities = getTopEntities;
  G.intel.pipeline.resolveTier = resolveTier;
  G.intel.pipeline.__nativeScoring609R = {
    installed: true,
    tiers: TIERS.map(t => ({ min: t.min, tier: t.tier }))
  };

  G.IntelligencePipeline = G.IntelligencePipeline || G.intel.pipeline;
  G.intelligencePipeline = G.intelligencePipeline || G.intel.pipeline;

  console.log("[609R] native intelligence scoring foundation installed", G.intel.pipeline.__nativeScoring609R);
})();

