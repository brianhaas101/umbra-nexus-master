// public/globe/intel/clients/black_dragon.dossier_layer.enhancer.js
// Black Dragon Dossier Layer Enhancer
// Purpose: add 12-layer intelligence explanations into Black Dragon dossiers.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  function enhanceDossier(entity) {
    if (!entity || typeof entity !== "object") return entity;

    const dossier = entity.dossier;
    const layerReport = entity.layer_score_report;
    const topLayers = entity.top_intelligence_layers || layerReport?.layers?.slice(0, 5) || [];

    if (!dossier || !layerReport) return entity;

    dossier.intelligence_layers = {
      normalized_layer_score: layerReport.normalized,
      total_weighted: layerReport.totalWeighted,
      max_weighted: layerReport.maxWeighted,
      top_layers: topLayers.map((layer) => ({
        layer_id: layer.layer_id,
        name: layer.name,
        raw: layer.raw,
        weight: layer.weight,
        weighted: layer.weighted,
        purpose: layer.purpose
      })),
      full_layer_report: layerReport.layers
    };

    return entity;
  }

  function enhanceDossiers(entities) {
    if (!Array.isArray(entities)) return [];
    return entities.map(enhanceDossier);
  }

  window.UmbraIntel.adapters.blackDragonDossierLayerEnhancer = Object.freeze({
    enhanceDossier,
    enhanceDossiers
  });

  console.info("[black_dragon.dossier_layer.enhancer] Ready.");
})();