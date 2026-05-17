// public/globe/intel/clients/black_dragon.layer_bridge.js
// Black Dragon Layer Bridge
// Purpose: attach 12-layer intelligence score reports to Black Dragon processed leads.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const CLIENT_ID = "black_dragon_omg_cert_v1";

  function hasLayerEngine() {
    return Boolean(window.UmbraIntel.layers?.scoreEngine?.scoreLayers);
  }

  function attachLayerReport(entity) {
    if (!entity || typeof entity !== "object") return entity;

    if (!hasLayerEngine()) {
      console.warn("[black_dragon.layer_bridge] Layer score engine unavailable.");
      return entity;
    }

    const report = window.UmbraIntel.layers.scoreEngine.scoreLayers(entity, CLIENT_ID);

    entity.layer_score_report = report;
    entity.top_intelligence_layers = report.layers.slice(0, 5);

    return entity;
  }

  function attachLayerReports(entities) {
    if (!Array.isArray(entities)) return [];
    return entities.map(attachLayerReport);
  }

  window.UmbraIntel.adapters.blackDragonLayerBridge = Object.freeze({
    attachLayerReport,
    attachLayerReports
  });

  console.info("[black_dragon.layer_bridge] Ready.");
})();