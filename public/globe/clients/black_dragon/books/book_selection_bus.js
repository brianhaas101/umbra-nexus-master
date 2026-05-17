(function () {
  "use strict";

  const G = window.BlackDragonBooksSelectionBus =
    window.BlackDragonBooksSelectionBus || {};

  let state = {
    selectedEntityId: null,
    selectedTarget: null,
    source: null,
    updatedAt: null,
    listenersBound: false,
    last_error: null
  };

  function now() {
    return new Date().toISOString();
  }

  function getQueueItems() {
    try {
      const q =
        window.BlackDragonBooksQueueUI?.getQueue?.() ||
        window.BlackDragonBooksQueueUI?.queue ||
        [];

      return Array.isArray(q) ? q : [];
    } catch (err) {
      return [];
    }
  }

  function getMapNodes() {
    try {
      return (
        window.UMBRA_DATA?.client_layers?.black_dragon_books_map_nodes ||
        []
      );
    } catch (err) {
      return [];
    }
  }

  function findTarget(entityId) {
    const id = String(entityId || "");

    if (!id) return null;

    const queue = getQueueItems();
    const qHit = queue.find(x => String(x.entity_id) === id);
    if (qHit) return qHit;

    const nodes = getMapNodes();
    const nHit = nodes.find(x => String(x.entity_id) === id);
    if (nHit) return nHit;

    if (
      window.UMBRA_SELECTED_CLIENT_TARGET &&
      String(window.UMBRA_SELECTED_CLIENT_TARGET.entity_id) === id
    ) {
      return window.UMBRA_SELECTED_CLIENT_TARGET;
    }

    return {
      entity_id: id,
      organization_name: "UNKNOWN_TARGET"
    };
  }

  function emit() {
    const detail = {
      entity_id: state.selectedEntityId,
      target: state.selectedTarget,
      source: state.source,
      updated_at: state.updatedAt
    };

    try {
      window.dispatchEvent(
        new CustomEvent("umbra:blackDragonSelectionChanged", {
          detail
        })
      );
    } catch (err) {}

    return detail;
  }

  function select(entityId, source) {
    const target = findTarget(entityId);

    if (!target || !target.entity_id) return null;

    state.selectedEntityId = String(target.entity_id);
    state.selectedTarget = target;
    state.source = source || "UNKNOWN";
    state.updatedAt = now();

    window.UMBRA_SELECTED_CLIENT_TARGET = {
      source: "BLACK_DRAGON_BOOK_SELECTION_BUS",
      ...target
    };

    emit();

    return state.selectedTarget;
  }

  function bindNativeEvents() {
    if (state.listenersBound) return true;

    window.addEventListener("umbra:blackDragonBookTargetSelected", function (ev) {
      const entityId = ev?.detail?.entity_id;
      if (entityId) select(entityId, "MAP_NODE");
    });

    state.listenersBound = true;
    return true;
  }

  function getDebugState() {    const queueSelected =
      window.BlackDragonBooksQueueUI?.selected_entity_id ||
      null;

    const responseSelected =
      window.BlackDragonBooksResponseUI?.selected_entity_id ||
      null;
    return {
      version: "black_dragon_books_selection_bus_v1",
      selected_entity_id: state.selectedEntityId,
      selected_source: state.source,
      queue_selected_entity_id: queueSelected,
      response_selected_entity_id: responseSelected,      aligned:
        !!state.selectedEntityId &&
        (
          queueSelected === state.selectedEntityId ||
          queueSelected === null
        ) &&
        (
          responseSelected === state.selectedEntityId ||
          responseSelected === null
        ),      listeners_bound: state.listenersBound,
      last_error: state.last_error
    };
  }

  G.select = select;
  G.findTarget = findTarget;
  G.bindNativeEvents = bindNativeEvents;
  G.getDebugState = getDebugState;

  bindNativeEvents();
})();




