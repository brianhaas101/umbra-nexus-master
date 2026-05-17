(function () {
  "use strict";

  const G = window.BlackDragonBooksDossierSync =
    window.BlackDragonBooksDossierSync || {};

  let state = {
    installed: false,
    selectedEntityId: null,
    selectedTarget: null,
    lastSyncAt: null,
    last_error: null
  };

  function now() {
    return new Date().toISOString();
  }

  function getTarget(entityId) {
    const id = String(entityId || "");
    if (!id) return null;

    const nodes =
      window.UMBRA_DATA?.client_layers?.black_dragon_books_map_nodes || [];

    return nodes.find(n => String(n.entity_id) === id) ||
      (
        window.UMBRA_SELECTED_CLIENT_TARGET &&
        String(window.UMBRA_SELECTED_CLIENT_TARGET.entity_id) === id
          ? window.UMBRA_SELECTED_CLIENT_TARGET
          : null
      );
  }

  function buildDossier(target) {
    if (!target) return null;

    return {
      dossier_id: `BD_BOOK_DOSSIER_${target.entity_id}`,
      client_id: "black_dragon",
      module: "book_sales_v2",
      entity_id: target.entity_id,
      organization_name: target.organization_name || target.label || "UNKNOWN_TARGET",
      organization_type: target.organization_type || "UNKNOWN",
      region: target.region || "National",
      country: target.country || "USA",
      scores: {
        propagation_score: Number(target.propagation_score || 0),
        adaptive_priority_score: Number(target.adaptive_priority_score || 0),
        queue_priority_score: Number(target.queue_priority_score || 0),
        visual_score: Number(target.visual_score || 0)
      },
      outreach: {
        queue_status: target.queue_status || "UNKNOWN",
        recommended_action: target.recommended_action || null,
        response_status: target.response_status || null,
        response_classification: target.response_classification || null
      },
      coordinates: {
        lat: typeof target.lat === "number" ? target.lat : null,
        lon: typeof target.lon === "number" ? target.lon : null
      },
      generated_at: now()
    };
  }

  function sync(entityId, source) {
    const target = getTarget(entityId);

    if (!target) {
      state.last_error = "Target not found for dossier sync: " + entityId;
      return null;
    }

    const dossier = buildDossier(target);

    state.selectedEntityId = target.entity_id;
    state.selectedTarget = target;
    state.lastSyncAt = now();
    state.last_error = null;

    window.UMBRA_SELECTED_CLIENT_TARGET = {
      source: "BLACK_DRAGON_DOSSIER_SYNC",
      ...target
    };

    window.UMBRA_SELECTED_DOSSIER = dossier;
    window.BLACK_DRAGON_SELECTED_DOSSIER = dossier;

    try {
      if (window.UmbraGlobe?.state) {
        window.UmbraGlobe.state.selectedEntityId = target.entity_id;
        window.UmbraGlobe.state.selectedEntity = target;
      }
    } catch (err) {}

    try {
      window.UmbraUsers?.recordSelectionFromState?.();
    } catch (err) {}

    try {
      window.dispatchEvent(
        new CustomEvent("umbra:blackDragonDossierSynced", {
          detail: {
            entity_id: target.entity_id,
            source: source || "UNKNOWN",
            dossier
          }
        })
      );
    } catch (err) {}

    try {
      window.UmbraIntelligencePanel?.render?.();
    } catch (err) {}

    return dossier;
  }

  function select(entityId) {
    try {
      window.BlackDragonBooksSelectionBus?.select?.(entityId, "DOSSIER_SYNC");
    } catch (err) {}

    return sync(entityId, "DIRECT");
  }

  function bind() {
    if (state.installed) return true;

    window.addEventListener("umbra:blackDragonSelectionChanged", function (ev) {
      const entityId = ev?.detail?.entity_id;
      if (entityId) sync(entityId, "SELECTION_BUS");
    });

    window.addEventListener("umbra:blackDragonBookTargetSelected", function (ev) {
      const entityId = ev?.detail?.entity_id;
      if (entityId) sync(entityId, "MAP_NODE");
    });

    state.installed = true;
    return true;
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_dossier_sync_v1_patch_062A",
      installed: state.installed,
      selected_entity_id: state.selectedEntityId,
      has_selected_target: !!state.selectedTarget,
      has_global_target: !!window.UMBRA_SELECTED_CLIENT_TARGET,
      has_global_dossier: !!window.UMBRA_SELECTED_DOSSIER,
      last_sync_at: state.lastSyncAt,
      last_error: state.last_error
    };
  }

  G.bind = bind;
  G.sync = sync;
  G.select = function(entityId) {
    return sync(entityId, "DIRECT_EXPORT_LOCK");
  };
  G.buildDossier = buildDossier;
  G.getDebugState = getDebugState;

  bind();
})();




