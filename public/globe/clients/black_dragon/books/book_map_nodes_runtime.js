(function () {
  "use strict";

  const G = window.BlackDragonBooksMapNodes =
    window.BlackDragonBooksMapNodes || {};

  const NODE_URL =
    "/data/clients/black_dragon/books/map/runtime/book_citymap_nodes.v1.json";

  let state = {
    payload: null,
    nodes: [],
    loaded: false,
    last_error: null
  };

  function getDatasetSecurity() {
    return window.UmbraDatasetSecurity || null;
  }

  async function safeFetchJson(url) {
    const datasetSecurity = getDatasetSecurity();
    const relativePath = url.replace(/^\//, "public/");

    if (datasetSecurity && typeof datasetSecurity.guardedFetch === "function") {
      const res = await datasetSecurity.guardedFetch(relativePath);
      if (!res.ok) throw new Error("Failed to fetch " + url);
      return await res.json();
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch " + url);
    return await res.json();
  }

  function getNodes() {
    return state.nodes.slice();
  }

  function getVisibleNodes(mode) {
    return state.nodes.filter(n => {
      if (mode === "CITY_MAP") return n.render && n.render.visible_in_city_map;
      if (mode === "WORLD") return n.render && n.render.visible_in_world;
      return true;
    });
  }

  function injectIntoUmbraData() {
    const W = window;

    W.UMBRA_DATA = W.UMBRA_DATA || {};
    W.UMBRA_DATA.client_layers = W.UMBRA_DATA.client_layers || {};
    W.UMBRA_DATA.client_layers.black_dragon_books_map_nodes = state.nodes;

    return true;
  }

  async function load() {
    try {
      state.payload = await safeFetchJson(NODE_URL);
      state.nodes = Array.isArray(state.payload.nodes)
        ? state.payload.nodes
        : [];
      state.loaded = true;
      state.last_error = null;

      injectIntoUmbraData();

      console.info("[BlackDragonBooksMapNodes] Loaded", {
        nodes: state.nodes.length
      });

      return state.payload;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      console.error("[BlackDragonBooksMapNodes] Load failed:", err);
      return null;
    }
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_map_nodes_runtime_v1",
      loaded: state.loaded,
      nodes: state.nodes.length,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.getNodes = getNodes;
  G.getVisibleNodes = getVisibleNodes;
  G.injectIntoUmbraData = injectIntoUmbraData;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    load();
  });

  if (document.readyState !== "loading") {
    load();
  }
})();



