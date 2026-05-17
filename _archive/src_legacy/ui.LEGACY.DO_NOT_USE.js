// public/globe/ui.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[ui] window.UmbraGlobe missing.");

  console.log("[SIGNATURE] globe/ui.js LOADED", new Date().toISOString());

  G.initUI = function initUI() {
    // ---- STATE (NO REASSIGN) ----
    G.hardenState?.();
    const st = G.state;

    // GUARD: prevent double-binding listeners
    if (st._uiBound) return;
    st._uiBound = true;

    const toggleNodes = document.getElementById("toggleNodes");
    const toggleStar = document.getElementById("toggleStarfield");

    const toggleVeins = document.getElementById("toggleVeins");
    const rangeNight = document.getElementById("rangeNight");
    const rangeGridOpacity = document.getElementById("rangeGridOpacity");
    const selectPalette = document.getElementById("selectPalette");

    function clamp(n, a, b, fb) {
      const x = Number(n);
      if (!Number.isFinite(x)) return fb;
      return Math.max(a, Math.min(b, x));
    }

    function wantNodesEnabled() {
      return toggleNodes ? !!toggleNodes.checked : true;
    }

    function wantStarEnabled() {
      return toggleStar ? !!toggleStar.checked : true;
    }

    function wantVeinsEnabled() {
      const t = G.theme?.grid?.enabled;
      const fallback = (typeof t === "boolean") ? t : true;
      return toggleVeins ? !!toggleVeins.checked : fallback;
    }

    function getNightIntensity() {
      if (rangeNight) return clamp(rangeNight.value, 0.0, 4.0, 1.55);
      const t = G.theme?.globe?.emissiveIntensity;
      return (typeof t === "number" && Number.isFinite(t)) ? clamp(t, 0.0, 4.0, 1.55) : 1.55;
    }

    function getGridOpacity() {
      if (rangeGridOpacity) return clamp(rangeGridOpacity.value, 0.0, 0.6, 0.10);
      const t = G.theme?.grid?.opacity;
      return (typeof t === "number" && Number.isFinite(t)) ? clamp(t, 0.0, 0.6, 0.10) : 0.10;
    }

    function getPaletteMode() {
      return selectPalette ? String(selectPalette.value || "default") : "default";
    }

    function apply() {
      if (typeof G.ensureWorldWeld === "function") {
        try { G.ensureWorldWeld(); } catch {}
      }

      st.nodesEnabled = wantNodesEnabled();

      const night = getNightIntensity();
      const gridOp = getGridOpacity();
      const veinsOn = wantVeinsEnabled();
      const starOn = wantStarEnabled();

      if (typeof G.setVeinsEnabled === "function") {
        try { G.setVeinsEnabled(veinsOn); } catch {}
      } else if (typeof G.setTheme === "function") {
        try { G.setTheme({ grid: { enabled: veinsOn } }); } catch {}
      }

      if (typeof G.setGridOpacity === "function") {
        try { G.setGridOpacity(gridOp); } catch {}
      } else if (typeof G.setTheme === "function") {
        try { G.setTheme({ grid: { opacity: gridOp } }); } catch {}
      }

      if (typeof G.setNightIntensity === "function") {
        try { G.setNightIntensity(night); } catch {}
      } else if (typeof G.setTheme === "function") {
        try { G.setTheme({ globe: { emissiveIntensity: night } }); } catch {}
      }

      if (typeof G.setTheme === "function") {
        try { G.setTheme({ starfield: { enabled: starOn } }); } catch {}
      }

      st.paletteMode = getPaletteMode();

      try { G.enforceModeVisibility?.(); } catch {}
    }

    if (toggleNodes) toggleNodes.addEventListener("change", apply);
    if (toggleStar) toggleStar.addEventListener("change", apply);
    if (toggleVeins) toggleVeins.addEventListener("change", apply);
    if (rangeNight) rangeNight.addEventListener("input", apply);
    if (rangeGridOpacity) rangeGridOpacity.addEventListener("input", apply);
    if (selectPalette) selectPalette.addEventListener("change", apply);

    (function syncFromTheme() {
      const tNight = G.theme?.globe?.emissiveIntensity;
      const tGridOp = G.theme?.grid?.opacity;
      const tVeins = G.theme?.grid?.enabled;
      const tStar = G.theme?.starfield?.enabled;

      if (rangeNight && typeof tNight === "number" && Number.isFinite(tNight)) {
        rangeNight.value = String(clamp(tNight, 0.0, 4.0, 1.55));
      }
      if (rangeGridOpacity && typeof tGridOp === "number" && Number.isFinite(tGridOp)) {
        rangeGridOpacity.value = String(clamp(tGridOp, 0.0, 0.6, 0.10));
      }

      if (toggleVeins && typeof tVeins === "boolean") toggleVeins.checked = !!tVeins;
      if (toggleStar && typeof tStar === "boolean") toggleStar.checked = !!tStar;

      if (toggleNodes) st.nodesEnabled = !!toggleNodes.checked;
      else if (typeof st.nodesEnabled !== "boolean") st.nodesEnabled = true;
    })();

    apply();
    setTimeout(() => { try { apply(); } catch {} }, 120);
  };
})();
