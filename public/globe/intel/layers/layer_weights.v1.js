// public/globe/intel/layers/layer_weights.v1.js
// Umbra Nexus Layer Weights V1
// Purpose: define baseline intelligence-layer weights and client-specific overrides.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.layers = window.UmbraIntel.layers || {};

  const WEIGHTS = Object.freeze({
    version: "LAYER_WEIGHTS_V1",

    baseline: Object.freeze({
      identity_entity: 1.0,
      contactability: 1.0,
      authority_role: 1.0,
      organizational_fit: 1.0,
      operational_need: 1.0,
      trigger_event: 1.0,
      budget_funding: 1.0,
      training_certification: 1.0,
      competitive_alternatives: 0.75,
      timing_recency: 1.0,
      risk_compliance_disqualification: 1.0,
      outcome_feedback: 0.85
    }),

    clients: Object.freeze({
      black_dragon_omg_cert_v1: Object.freeze({
        identity_entity: 1.0,
        contactability: 1.25,
        authority_role: 1.35,
        organizational_fit: 1.15,
        operational_need: 1.5,
        trigger_event: 1.45,
        budget_funding: 1.25,
        training_certification: 1.4,
        competitive_alternatives: 0.7,
        timing_recency: 1.45,
        risk_compliance_disqualification: 1.3,
        outcome_feedback: 1.0
      })
    }),

    descriptions: Object.freeze({
      identity_entity: "Correct identity and entity matching.",
      contactability: "Reachability and contact-path quality.",
      authority_role: "Decision authority, influence, and role fit.",
      organizational_fit: "Target organization match against client criteria.",
      operational_need: "Real-world operational reason to care.",
      trigger_event: "Recent event creating urgency.",
      budget_funding: "Funding, grants, procurement, and budget capacity.",
      training_certification: "Training, certification, and professional development relevance.",
      competitive_alternatives: "Existing vendors, substitutes, or competitive pressure.",
      timing_recency: "Freshness and time-window enforcement.",
      risk_compliance_disqualification: "Filtering, risk control, disqualification, and suppression.",
      outcome_feedback: "Learning from outreach, sales, and close data."
    })
  });

  function getBaselineWeights() {
    return Object.assign({}, WEIGHTS.baseline);
  }

  function getClientWeights(clientId) {
    const clientWeights = WEIGHTS.clients[clientId];

    if (!clientWeights) {
      return getBaselineWeights();
    }

    return Object.assign({}, WEIGHTS.baseline, clientWeights);
  }

  function getLayerWeight(layerId, clientId) {
    const weights = getClientWeights(clientId);
    return Number(weights[layerId] || 0);
  }

  function normalizeWeights(weights) {
    const input = weights && typeof weights === "object" ? weights : {};
    const total = Object.values(input).reduce((sum, value) => {
      const n = Number(value);
      return sum + (Number.isFinite(n) && n > 0 ? n : 0);
    }, 0);

    if (!total) return {};

    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => {
        const n = Number(value);
        return [key, Number(((Number.isFinite(n) && n > 0 ? n : 0) / total).toFixed(4))];
      })
    );
  }

  function getNormalizedClientWeights(clientId) {
    return normalizeWeights(getClientWeights(clientId));
  }

  function validateWeights() {
    const registry = window.UmbraIntel.layers?.registry;
    const layerIds = registry?.layers?.map((layer) => layer.layer_id) || [];
    const baselineKeys = Object.keys(WEIGHTS.baseline);

    const checks = {
      registry_available: Boolean(registry),
      every_layer_has_baseline_weight: layerIds.every((id) => baselineKeys.includes(id)),
      no_unknown_baseline_keys: baselineKeys.every((id) => layerIds.includes(id)),
      baseline_weights_are_numeric: baselineKeys.every((id) => Number.isFinite(Number(WEIGHTS.baseline[id]))),
      client_weights_are_numeric: Object.values(WEIGHTS.clients).every((client) =>
        Object.values(client).every((value) => Number.isFinite(Number(value)))
      )
    };

    return {
      system: "Umbra Nexus Layer Weights",
      version: WEIGHTS.version,
      pass: Object.values(checks).every(Boolean),
      checks,
      timestamp: new Date().toISOString()
    };
  }

  window.UmbraIntel.layers.weights = WEIGHTS;

  window.UmbraIntel.layers.weightsApi = Object.freeze({
    getBaselineWeights,
    getClientWeights,
    getLayerWeight,
    normalizeWeights,
    getNormalizedClientWeights,
    validateWeights
  });

  console.info("[layer_weights.v1] Ready.", validateWeights());
})();