(function () {
  "use strict";

  const G = window.BlackDragonBooksLayerControls =
    window.BlackDragonBooksLayerControls || {};

  const CONTROL_URL =
    "/data/clients/black_dragon/books/map/controls/citymap_layer_controls.v1.json";

  let state = {
    config: null,
    layerState: {
      BOOK_TARGETS: true,
      REGIONAL_CLUSTERS: true,
      PROPAGATION_PATHS: true
    },
    mounted: false,
    last_error: null
  };

  function getTargetGroup() {
    try {
      return window.BlackDragonBooksCityMapRenderer
        .getRenderedNodes()[0]?.parent || null;
    } catch (err) {
      return null;
    }
  }

  function getClusterGroup() {
    try {
      return window.BlackDragonBooksClusterRenderer
        .getRenderedClusters()[0]?.parent || null;
    } catch (err) {
      return null;
    }
  }

  function getPathGroup() {
    try {
      return window.BlackDragonBooksPathRenderer
        .getRenderedPaths()[0]?.parent || null;
    } catch (err) {
      return null;
    }
  }

  function getGroup(layerId) {
    if (layerId === "BOOK_TARGETS") return getTargetGroup();
    if (layerId === "REGIONAL_CLUSTERS") return getClusterGroup();
    if (layerId === "PROPAGATION_PATHS") return getPathGroup();
    return null;
  }

  function saveState() {
    try {
      localStorage.setItem(
        "black_dragon_books_layer_state_v1",
        JSON.stringify(state.layerState)
      );
    } catch (err) {}
  }

  function loadSavedState() {
    try {
      const raw =
        localStorage.getItem("black_dragon_books_layer_state_v1");

      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (parsed && typeof parsed === "object") {
        state.layerState = {
          ...state.layerState,
          ...parsed
        };
      }
    } catch (err) {}
  }

  function setLayerVisible(layerId, visible) {
    const group = getGroup(layerId);

    state.layerState[layerId] = !!visible;

    if (group) {
      group.visible = !!visible;
    }

    saveState();

    return !!group;
  }

  function getLayerVisible(layerId) {
    const group = getGroup(layerId);

    if (group) {
      return group.visible !== false;
    }

    return state.layerState[layerId] !== false;
  }

  function applyAll() {
    for (const [layerId, visible] of Object.entries(state.layerState)) {
      setLayerVisible(layerId, visible);
    }
  }

  async function loadConfig() {
    try {
      const res = await fetch(CONTROL_URL);
      state.config = await res.json();
      state.last_error = null;
      return state.config;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      return null;
    }
  }

  function ensureStyle() {
    if (document.getElementById("bdBookLayerControlsStyles")) return;

    const style = document.createElement("style");
    style.id = "bdBookLayerControlsStyles";
    style.textContent = `
      .bd-book-layer-controls {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 80;
        min-width: 220px;
        padding: 14px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(4, 7, 12, 0.86);
        color: #f5f5f5;
        font-family: Inter, system-ui, sans-serif;
        box-shadow: 0 18px 48px rgba(0,0,0,0.35);
      }
      .bd-book-layer-controls h3 {
        margin: 0 0 10px;
        font-size: 14px;
      }
      .bd-book-layer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 0;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .bd-book-layer-row label {
        font-size: 12px;
        color: rgba(255,255,255,0.76);
      }
    `;
    document.head.appendChild(style);
  }

  function render() {
    ensureStyle();

    let root =
      document.getElementById("blackDragonBooksLayerControls");

    if (!root) {
      root = document.createElement("section");
      root.id = "blackDragonBooksLayerControls";
      root.className = "bd-book-layer-controls";
      root.setAttribute("data-black-dragon-books", "true");
      document.body.appendChild(root);
    }

    root.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = "Black Dragon Map Layers";
    root.appendChild(title);

    const layers = [
      ["BOOK_TARGETS", "Targets"],
      ["REGIONAL_CLUSTERS", "Regional Clusters"],
      ["PROPAGATION_PATHS", "Propagation Paths"]
    ];

    for (const [layerId, labelText] of layers) {
      const row = document.createElement("div");
      row.className = "bd-book-layer-row";

      const label = document.createElement("label");
      label.textContent = labelText;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = getLayerVisible(layerId);
      input.addEventListener("change", () => {
        setLayerVisible(layerId, input.checked);
      });

      row.appendChild(label);
      row.appendChild(input);
      root.appendChild(row);
    }

    state.mounted = true;

    setTimeout(applyAll, 1000);

    return true;
  }

  async function load() {
    loadSavedState();
    await loadConfig();
    render();
    return state.config;
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_layer_controls_v2_batch_061",
      mounted: state.mounted,
      layers: 3,
      layer_state: state.layerState,
      target_visible: getLayerVisible("BOOK_TARGETS"),
      cluster_visible: getLayerVisible("REGIONAL_CLUSTERS"),
      path_visible: getLayerVisible("PROPAGATION_PATHS"),
      has_target_group: !!getTargetGroup(),
      has_cluster_group: !!getClusterGroup(),
      has_path_group: !!getPathGroup(),
      last_error: state.last_error
    };
  }

  G.load = load;
  G.render = render;
  G.setLayerVisible = setLayerVisible;
  G.getLayerVisible = getLayerVisible;
  G.applyAll = applyAll;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(load, 3000);
  });

  if (document.readyState !== "loading") {
    setTimeout(load, 3000);
  }
})();



