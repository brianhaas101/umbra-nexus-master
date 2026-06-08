// public/globe/intel/registry.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) {
    console.error("[intel/registry] UmbraGlobe missing.");
    return;
  }

  function freezeDeep(obj) {
    if (!obj || typeof obj !== "object" || Object.isFrozen(obj)) return obj;
    Object.freeze(obj);
    for (const key of Object.keys(obj)) {
      freezeDeep(obj[key]);
    }
    return obj;
  }

  const REGISTRY = {
    VERSION: "v1",
    MODE: "CONTROL_DATASET", // CONTROL_DATASET | LIVE_INTEL
    DEFAULT_TIMEOUT_MS: 15000,

    LAYERS: {
      federal: {
        layer: "federal",
        authority_weight: 1.0,
        freshness_days: 90,
        enabled: false
      },
      state: {
        layer: "state",
        authority_weight: 0.9,
        freshness_days: 90,
        enabled: false
      },
      private: {
        layer: "private",
        authority_weight: 0.8,
        freshness_days: 60,
        enabled: false
      },
      commercial: {
        layer: "commercial",
        authority_weight: 0.75,
        freshness_days: 45,
        enabled: false
      },
      behavioral: {
        layer: "behavioral",
        authority_weight: 0.7,
        freshness_days: 30,
        enabled: false
      },
      asset: {
        layer: "asset",
        authority_weight: 0.65,
        freshness_days: 180,
        enabled: false
      },
      operational: {
        layer: "operational",
        authority_weight: 0.6,
        freshness_days: 14,
        enabled: false
      }
    },

    SOURCES: [
      {
        source_key: "federal_primary",
        label: "Federal Primary Source",
        layer: "federal",
        adapter_key: "federal_primary",
        enabled: false,
        required_fields: ["external_id", "observed_at", "payload"],
        rate_limit_per_min: 60,
        timeout_ms: 15000
      },
      {
        source_key: "state_primary",
        label: "State Primary Source",
        layer: "state",
        adapter_key: "state_primary",
        enabled: false,
        required_fields: ["external_id", "observed_at", "payload"],
        rate_limit_per_min: 60,
        timeout_ms: 15000
      },
      {
        source_key: "private_primary",
        label: "Private Primary Source",
        layer: "private",
        adapter_key: "private_primary",
        enabled: false,
        required_fields: ["external_id", "observed_at", "payload"],
        rate_limit_per_min: 120,
        timeout_ms: 15000
      },
      {
        source_key: "commercial_primary",
        label: "Commercial Primary Source",
        layer: "commercial",
        adapter_key: "commercial_primary",
        enabled: false,
        required_fields: ["external_id", "observed_at", "payload"],
        rate_limit_per_min: 120,
        timeout_ms: 15000
      },
      {
        source_key: "behavioral_primary",
        label: "Behavioral Primary Source",
        layer: "behavioral",
        adapter_key: "behavioral_primary",
        enabled: false,
        required_fields: ["external_id", "observed_at", "payload"],
        rate_limit_per_min: 120,
        timeout_ms: 15000
      },
      {
        source_key: "asset_primary",
        label: "Asset Primary Source",
        layer: "asset",
        adapter_key: "asset_primary",
        enabled: false,
        required_fields: ["external_id", "observed_at", "payload"],
        rate_limit_per_min: 60,
        timeout_ms: 15000
      },
      {
        source_key: "operational_primary",
        label: "Operational Primary Source",
        layer: "operational",
        adapter_key: "operational_primary",
        enabled: false,
        required_fields: ["external_id", "observed_at", "payload"],
        rate_limit_per_min: 120,
        timeout_ms: 15000
      }
    ],

    getLayer(layerKey) {
      const key = String(layerKey || "").trim();
      return this.LAYERS[key] || null;
    },

    getSource(sourceKey) {
      const key = String(sourceKey || "").trim();
      return this.SOURCES.find((s) => s.source_key === key) || null;
    },

    getEnabledSources() {
      return this.SOURCES.filter((s) => s.enabled === true);
    }
  };

  freezeDeep(REGISTRY);

  G.intel = G.intel || {};
  G.intel.registry = REGISTRY;

  console.log("[intel/registry] LOADED", {
    version: REGISTRY.VERSION,
    mode: REGISTRY.MODE,
    sources: REGISTRY.SOURCES.length
  });
})();

// BATCH 603R: native legacy alias export for registry
(function bindNativeIntelRegistryAliases603R() {
  const G = window.UmbraGlobe;
  if (!G || !G.intel || !G.intel.registry) return;
  G.IntelligenceRegistry = G.IntelligenceRegistry || G.intel.registry;
  G.intelligenceRegistry = G.intelligenceRegistry || G.intel.registry;
  G.__nativeIntelRegistryAlias603R = {
    installed: true,
    hasRegistry: !!G.intel.registry
  };
})();

