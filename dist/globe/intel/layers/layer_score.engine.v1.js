// public/globe/intel/layers/layer_score.engine.v1.js
// Umbra Nexus Layer Score Engine V1
// Purpose: calculate explainable layer-level score contributions for any client/entity.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.layers = window.UmbraIntel.layers || {};

  const registryApi = window.UmbraIntel.layers.api;
  const weightsApi = window.UmbraIntel.layers.weightsApi;

  if (!registryApi || !weightsApi) {
    console.error("[layer_score.engine.v1] Missing registryApi or weightsApi.");
    return;
  }

  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function number(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function getLayerRawValue(entity, layerId) {
    const layers = entity?.layer_scores || entity?.layerScores || {};
    const direct = layers[layerId];

    if (Number.isFinite(Number(direct))) {
      return clamp01(direct);
    }

    const signals = entity?.signals || {};

    switch (layerId) {
      case "identity_entity":
        return entity?.full_name && entity?.agency_name ? 1 : 0.4;

      case "contactability":
        return entity?.email && entity?.phone ? 1 : entity?.email || entity?.phone ? 0.65 : 0;

      case "authority_role":
        return signals.decision_maker_match ? 1 : entity?.title ? 0.5 : 0;

      case "organizational_fit":
        return entity?.agency_type || entity?.agency_name ? 0.75 : 0.25;

      case "operational_need":
        return signals.recent_omg_incident || signals.task_force_participation ? 1 : 0.25;

      case "trigger_event":
        return signals.recent_omg_incident || signals.new_or_expanded_unit || signals.active_job_posting ? 1 : 0.2;

      case "budget_funding":
        return signals.grant_funding ? 1 : number(entity?.agency_size, 0) >= 300 ? 0.55 : 0.25;

      case "training_certification":
        return signals.post_or_training_need ? 1 : signals.decision_maker_match ? 0.65 : 0.25;

      case "competitive_alternatives":
        return signals.prior_external_training_purchase ? 0.85 : 0.25;

      case "timing_recency":
        return entity?.source_date ? 0.85 : 0.35;

      case "risk_compliance_disqualification":
        return Array.isArray(entity?.disqualifiers) && entity.disqualifiers.length ? 0.25 : 1;

      case "outcome_feedback":
        return entity?.outcome_status || entity?.crm_status ? 0.8 : 0.2;

      default:
        return 0;
    }
  }

  function scoreLayers(entity, clientId) {
    const layers = registryApi.listLayers();
    const weights = weightsApi.getClientWeights(clientId);

    const results = layers.map((layer) => {
      const raw = getLayerRawValue(entity, layer.layer_id);
      const weight = number(weights[layer.layer_id], 1);
      const weighted = Number((raw * weight).toFixed(4));

      return {
        layer_id: layer.layer_id,
        name: layer.name,
        raw,
        weight,
        weighted,
        purpose: layer.purpose
      };
    });

    const totalWeighted = results.reduce((sum, item) => sum + item.weighted, 0);
    const maxWeighted = results.reduce((sum, item) => sum + item.weight, 0);
    const normalized = maxWeighted > 0 ? Number((totalWeighted / maxWeighted).toFixed(4)) : 0;

    const report = {
      client_id: clientId || "baseline",
      normalized,
      totalWeighted: Number(totalWeighted.toFixed(4)),
      maxWeighted: Number(maxWeighted.toFixed(4)),
      layers: results.sort((a, b) => b.weighted - a.weighted)
    };

    entity.layer_score_report = report;
    return report;
  }

  function getTopLayers(entity, clientId, limit = 5) {
    const report = entity?.layer_score_report || scoreLayers(entity, clientId);
    return report.layers.slice(0, limit);
  }

  window.UmbraIntel.layers.scoreEngine = Object.freeze({
    scoreLayers,
    getTopLayers,
    getLayerRawValue
  });

  console.info("[layer_score.engine.v1] Ready.");
})();