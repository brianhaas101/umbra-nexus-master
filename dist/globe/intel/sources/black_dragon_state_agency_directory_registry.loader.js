// public/globe/intel/sources/black_dragon_state_agency_directory_registry.loader.js
// Loads Black Dragon nationwide verified state agency directory registry.
// No lead creation. No placeholder generation.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.sources = window.UmbraIntel.sources || {};

  const REGISTRY_URL =
    "./data/clients/black_dragon/black_dragon_state_agency_directory_registry.v1.json";

  let registry = null;
  let loadedAt = null;

  async function load(options = {}) {
    const cacheBust = options.cacheBust ? `?v=${Date.now()}` : "";
    const response = await fetch(REGISTRY_URL + cacheBust);

    if (!response.ok) {
      throw new Error(
        `[black_dragon_state_agency_directory_registry.loader] Failed to load registry: HTTP ${response.status}`
      );
    }

    registry = await response.json();
    loadedAt = new Date().toISOString();

    console.info("[black_dragon_state_agency_directory_registry.loader] Loaded.", {
      client_id: registry.client_id,
      sources: getApprovedSources().length,
      backlog: getStateBacklog().length
    });

    return {
      ok: true,
      client_id: registry.client_id,
      version: registry.version,
      source_count: getApprovedSources().length,
      backlog_count: getStateBacklog().length,
      loaded_at: loadedAt
    };
  }

  function getRegistry() {
    return registry;
  }

  function getApprovedSources() {
    return Array.isArray(registry?.approved_state_sources)
      ? registry.approved_state_sources
      : [];
  }

  function getStateBacklog() {
    return Array.isArray(registry?.state_backlog)
      ? registry.state_backlog
      : [];
  }

  function getSourcesForState(state) {
    const s = String(state || "").trim().toUpperCase();
    return getApprovedSources().filter((src) => src.state === s);
  }

  function getPrioritySources() {
    return getApprovedSources().filter((src) => src.priority_for_top_50 === true);
  }

  function getEntityCreationSources() {
    return getApprovedSources().filter((src) => src.creates_entities === true);
  }

  function getEnrichmentSources() {
    return getApprovedSources().filter((src) => src.enriches_entities === true);
  }

  function getTop50CitiesCovered() {
    const cities = new Set();

    getApprovedSources().forEach((src) => {
      const supported = Array.isArray(src.top_50_cities_supported)
        ? src.top_50_cities_supported
        : [];

      supported.forEach((city) => {
        if (city) cities.add(`${city}|${src.state}`);
      });
    });

    return Array.from(cities).sort();
  }

  window.UmbraIntel.sources.blackDragonStateAgencyDirectoryRegistry = Object.freeze({
    load,
    getRegistry,
    getApprovedSources,
    getStateBacklog,
    getSourcesForState,
    getPrioritySources,
    getEntityCreationSources,
    getEnrichmentSources,
    getTop50CitiesCovered
  });
})();