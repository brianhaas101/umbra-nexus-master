// public/globe/intel/sources/black_dragon_source_registry.loader.js
// Loads Black Dragon approved real-world source registry.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.sources = window.UmbraIntel.sources || {};

  const REGISTRY_URL =
    "/data/clients/black_dragon/black_dragon_source_registry.v1.json";

  let registry = null;

  async function load(options = {}) {
    const url = `${REGISTRY_URL}?v=${options.cacheBust ? Date.now() : "v1"}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`[black_dragon_source_registry.loader] Failed to load registry: ${res.status}`);
    }

    registry = await res.json();

    console.info("[black_dragon_source_registry.loader] Loaded.", {
      client_id: registry.client_id,
      sources: registry.approved_sources?.length || 0
    });

    return registry;
  }

  function getRegistry() {
    return registry;
  }

  function getApprovedSources() {
    return Array.isArray(registry?.approved_sources)
      ? registry.approved_sources
      : [];
  }

  function findSource(sourceId) {
    return getApprovedSources().find((src) => src.source_id === sourceId) || null;
  }

  function getEntityCreationSources() {
    const allowed = registry?.ingestion_rules?.entity_creation_allowed_from || [];
    return getApprovedSources().filter((src) => allowed.includes(src.source_id));
  }

  function getEnrichmentOnlySources() {
    const allowed = registry?.ingestion_rules?.enrichment_only_sources || [];
    return getApprovedSources().filter((src) => allowed.includes(src.source_id));
  }

  window.UmbraIntel.sources.blackDragonSourceRegistry = Object.freeze({
    load,
    getRegistry,
    getApprovedSources,
    findSource,
    getEntityCreationSources,
    getEnrichmentOnlySources
  });

  console.info("[black_dragon_source_registry.loader] Ready.");
})();