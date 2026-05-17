(function () {
  "use strict";

  const G = window.UmbraIntelligencePanel =
    window.UmbraIntelligencePanel || {};

  let state = {
    mounted: false,
    interval: null,
    lastSnapshot: null,
    last_error: null
  };

  function safe(fn, fallback) {
    try {
      return fn();
    } catch (err) {
      return fallback;
    }
  }

  function getMode() {
    return safe(() =>
      window.UmbraGlobe?.state?.mode ||
      window.UmbraGlobe?.getState?.().mode ||
      "WORLD",
      "WORLD"
    );
  }

  function getActiveCityId() {
    return safe(() =>
      window.UmbraGlobe?.state?.activeCityId ||
      window.UmbraGlobe?.state?.activeCity?.city_id ||
      null,
      null
    );
  }

  function getDatasetHash() {
    return safe(() =>
      window.UmbraGlobe?.state?.datasetHash ||
      window.UMBRA_DATA?.datasetHash ||
      window.UMBRA_DATA?.meta?.datasetHash ||
      window.__UMBRA_BUILD__ ||
      "UNVERIFIED",
      "UNVERIFIED"
    );
  }

  function getSelectedEntity() {
    return safe(() =>
      window.UMBRA_SELECTED_CLIENT_TARGET?.entity_id ||
      window.UmbraGlobe?.state?.selectedEntityId ||
      window.UmbraUsers?.getStore?.()?.selected_entity_id ||
      null,
      null
    );
  }

  function getNodeCount() {
    return safe(() => {
      const bd =
        window.BlackDragonBooksCityMapRenderer?.getDebugState?.();

      if (bd && typeof bd.rendered_nodes === "number" && bd.rendered_nodes > 0) {
        return bd.rendered_nodes;
      }

      const mapNodes =
        window.BlackDragonBooksMapNodes?.getDebugState?.();

      if (mapNodes && typeof mapNodes.nodes === "number" && mapNodes.nodes > 0) {
        return mapNodes.nodes;
      }

      if (
        window.UMBRA_DATA &&
        window.UMBRA_DATA.client_layers &&
        Array.isArray(window.UMBRA_DATA.client_layers.black_dragon_books_map_nodes)
      ) {
        return window.UMBRA_DATA.client_layers.black_dragon_books_map_nodes.length;
      }

      if (Array.isArray(window.UMBRA_DATA?.entities)) {
        return window.UMBRA_DATA.entities.length;
      }

      return 0;
    }, 0);
  }

  function getRegion() {
    return safe(() =>
      window.UMBRA_SELECTED_CLIENT_TARGET?.region ||
      window.UmbraGlobe?.state?.activeRegion ||
      getActiveCityId() ||
      "GLOBAL",
      "GLOBAL"
    );
  }

  function getCoordinates() {
    return safe(() => {
      const target = window.UMBRA_SELECTED_CLIENT_TARGET;

      if (target?.lat && target?.lon) {
        return `${Number(target.lat).toFixed(4)}, ${Number(target.lon).toFixed(4)}`;
      }

      const city = window.UmbraGlobe?.state?.activeCity;

      if (city?.lat && city?.lon) {
        return `${Number(city.lat).toFixed(4)}, ${Number(city.lon).toFixed(4)}`;
      }

      return "—";
    }, "—");
  }

  function getStatus() {
    const mode = getMode();
    const nodes = getNodeCount();

    if (!window.UmbraGlobe) return "DEGRADED";
    if (!window.UMBRA_DATA) return "DATA_PENDING";
    if (nodes <= 0) return "NO_ACTIVE_NODES";

    return mode === "CITY_MAP" ? "CITY_OPERATIONAL" : "STABLE";
  }

  function snapshot() {
    return {
      status: getStatus(),
      mode: getMode(),
      dataset_hash: getDatasetHash(),
      selected_entity: getSelectedEntity(),
      region: getRegion(),
      coordinates: getCoordinates(),
      nodes: getNodeCount(),
      active_city_id: getActiveCityId()
    };
  }

  function findPanelRoot() {
    const candidates = Array.from(document.querySelectorAll("aside,section,div"));

    return candidates.find(el => {
      const text = (el.textContent || "").toUpperCase();

      return (
        text.includes("INTELLIGENCE PANEL") ||
        (
          text.includes("SYSTEM STATUS") &&
          text.includes("DATASET")
        )
      );
    }) || null;
  }

  function setField(root, label, value) {
    if (!root) return false;

    const all = Array.from(root.querySelectorAll("*"));
    const labelUpper = label.toUpperCase();

    const labelNode = all.find(el =>
      (el.textContent || "").trim().toUpperCase() === labelUpper
    );

    if (labelNode && labelNode.parentElement) {
      const siblings = Array.from(labelNode.parentElement.children);
      const valueNode = siblings.find(n => n !== labelNode);

      if (valueNode) {
        valueNode.textContent = String(value ?? "—");
        return true;
      }
    }

    return false;
  }

  function ensureFallbackPanel() {
    let root = document.getElementById("umbraLiveIntelligencePanel");

    if (root) return root;

    root = document.createElement("section");
    root.id = "umbraLiveIntelligencePanel";
    root.setAttribute("data-umbra-panel", "LIVE_INTELLIGENCE_PANEL");

    root.style.position = "fixed";
    root.style.right = "18px";
    root.style.top = "110px";
    root.style.zIndex = "70";
    root.style.padding = "14px";
    root.style.minWidth = "230px";
    root.style.border = "1px solid rgba(255,255,255,0.12)";
    root.style.borderRadius = "16px";
    root.style.background = "rgba(3,6,10,0.72)";
    root.style.color = "white";
    root.style.fontFamily = "Inter, system-ui, sans-serif";
    root.style.fontSize = "12px";
    root.style.pointerEvents = "none";

    root.innerHTML = `
      <div style="font-size:13px;font-weight:700;margin-bottom:10px;">INTELLIGENCE PANEL</div>
      <div data-live-row="status">SYSTEM STATUS <strong></strong></div>
      <div data-live-row="mode">MODE <strong></strong></div>
      <div data-live-row="dataset">DATASET <strong></strong></div>
      <div data-live-row="selection">SELECTION <strong></strong></div>
      <div data-live-row="region">REGION <strong></strong></div>
      <div data-live-row="coordinates">COORDINATES <strong></strong></div>
      <div data-live-row="nodes">NODES <strong></strong></div>
    `;

    document.body.appendChild(root);

    return root;
  }

  function updateFallback(root, snap) {
    const rows = {
      status: snap.status,
      mode: snap.mode,
      dataset: snap.dataset_hash,
      selection: snap.selected_entity || "NONE",
      region: snap.region,
      coordinates: snap.coordinates,
      nodes: snap.nodes
    };

    for (const [key, value] of Object.entries(rows)) {
      const row = root.querySelector(`[data-live-row="${key}"] strong`);
      if (row) row.textContent = String(value ?? "—");
    }
  }

  function render() {
    const snap = snapshot();
    const existing = findPanelRoot();
    const root = existing || ensureFallbackPanel();

    const ok =
      setField(root, "SYSTEM STATUS", snap.status) |
      setField(root, "MODE", snap.mode) |
      setField(root, "DATASET", snap.dataset_hash) |
      setField(root, "SELECTION", snap.selected_entity || "NONE") |
      setField(root, "REGION", snap.region) |
      setField(root, "COORDINATES", snap.coordinates) |
      setField(root, "NODES", snap.nodes);

    if (!ok || root.id === "umbraLiveIntelligencePanel") {
      updateFallback(root, snap);
    }

    state.lastSnapshot = snap;
    state.mounted = true;

    return snap;
  }

  function start() {
    if (state.interval) {
      clearInterval(state.interval);
    }

    render();

    state.interval = setInterval(render, 1000);

    window.addEventListener("umbra:moduleChanged", render);
    window.addEventListener("umbra:blackDragonBookTargetSelected", render);
    window.addEventListener("umbra:blackDragonLocalResponseSaved", render);

    return true;
  }

  function getDebugState() {
    return {
      version: "umbra_intelligence_panel_live_state_v1",
      mounted: state.mounted,
      has_interval: !!state.interval,
      last_snapshot: state.lastSnapshot,
      last_error: state.last_error
    };
  }

  G.start = start;
  G.render = render;
  G.snapshot = snapshot;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(start, 2000);
  });

  if (document.readyState !== "loading") {
    setTimeout(start, 2000);
  }
})();

