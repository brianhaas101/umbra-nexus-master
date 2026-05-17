// public/globe/intel/clients/black_dragon.processor.v1.js
// Black Dragon Processor V1
// Purpose: one safe entry point for raw lead -> normalized -> scored -> layered -> dossier-ready output.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const CLIENT_ID = "black_dragon_omg_cert_v1";

  function requireAdapter(name) {
    const adapter = window.UmbraIntel.adapters[name];

    if (!adapter) {
      console.error(`[black_dragon.processor.v1] Missing adapter: ${name}`);
      return null;
    }

    return adapter;
  }

  function processLead(rawLead) {
    const normalizer = requireAdapter("blackDragonLeadNormalizer");
    const pipeline = requireAdapter("blackDragonPipeline");
    const layerBridge = requireAdapter("blackDragonLayerBridge");
    const dossierAdapter = requireAdapter("blackDragonDossier");
    const dossierEnhancer = requireAdapter("blackDragonDossierLayerEnhancer");

    if (!normalizer || !pipeline || !layerBridge || !dossierAdapter || !dossierEnhancer) {
      return null;
    }

    const normalized = normalizer.normalizeLead(rawLead);
    normalized.client_id = CLIENT_ID;

    const processed = pipeline.processEntity(normalized);
    layerBridge.attachLayerReport(processed);

    dossierAdapter.buildDossier(processed);
    dossierEnhancer.enhanceDossier(processed);

    return processed;
  }

  function processLeads(rawLeads) {
    if (!Array.isArray(rawLeads)) return [];

    return rawLeads
      .map(processLead)
      .filter(Boolean)
      .sort((a, b) => Number(b.umbraScore || 0) - Number(a.umbraScore || 0));
  }

  function summarizeProcessedLeads(leads) {
    const list = Array.isArray(leads) ? leads : [];

    return {
      client_id: CLIENT_ID,
      total: list.length,
      hot: list.filter((lead) => lead.tier === "HOT").length,
      warm: list.filter((lead) => lead.tier === "WARM").length,
      cold: list.filter((lead) => lead.tier === "COLD").length,
      average_score: list.length
        ? Number((list.reduce((sum, lead) => sum + Number(lead.umbraScore || 0), 0) / list.length).toFixed(3))
        : 0,
      top_lead: list[0] || null,
      timestamp: new Date().toISOString()
    };
  }

  window.UmbraIntel.adapters.blackDragonProcessor = Object.freeze({
    processLead,
    processLeads,
    summarizeProcessedLeads
  });

  console.info("[black_dragon.processor.v1] Ready.");
})();