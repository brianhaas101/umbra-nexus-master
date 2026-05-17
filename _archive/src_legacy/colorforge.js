// UMBRA NEXUS — COLOR FORGE
// Minimal noir profile page controller for node color presets

(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const hotInput   = document.getElementById("nodeHotColor");
    const warmInput  = document.getElementById("nodeWarmColor");
    const coldInput  = document.getElementById("nodeColdColor");
    const applyBtn   = document.getElementById("applyNodeColors");
    const resetBtn   = document.getElementById("resetNodeColors");
    const presetBtns = document.querySelectorAll(".preset-btn[data-theme-preset]");

    // If profile / Color Forge isn't in DOM yet, just bail quietly.
    if (!hotInput || !warmInput || !coldInput) {
      return;
    }

    const defaultPalette = {
      hot:  "#fff3c0",
      warm: "#ffb060",
      cold: "#803820"
    };

    function pushPaletteToGlobe() {
      if (window.UMBRA_THEME && typeof window.UMBRA_THEME.setNodePalette === "function") {
        window.UMBRA_THEME.setNodePalette({
          hot:  hotInput.value,
          warm: warmInput.value,
          cold: coldInput.value
        });
      } else {
        console.warn("[COLOR FORGE] UMBRA_THEME.setNodePalette is not available yet.");
      }
    }

    function applyPaletteToInputs(palette) {
      if (palette.hot)  hotInput.value  = palette.hot;
      if (palette.warm) warmInput.value = palette.warm;
      if (palette.cold) coldInput.value = palette.cold;
      pushPaletteToGlobe();
    }

    // Apply button: use current input values
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        pushPaletteToGlobe();
      });
    }

    // Reset button: go back to default noir-gold ember palette
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        applyPaletteToInputs(defaultPalette);
      });
    }

    // Preset buttons
    presetBtns.forEach(btn => {
      btn.addEventListener("click", function () {
        const preset = this.getAttribute("data-theme-preset");
        let palette = null;

        if (preset === "noir-gold") {
          palette = defaultPalette;
        } else if (preset === "ember") {
          palette = {
            hot:  "#ffd9a0",
            warm: "#ff9140",
            cold: "#4a1b0a"
          };
        } else if (preset === "forerunner") {
          palette = {
            hot:  "#e0f9ff",
            warm: "#84e8ff",
            cold: "#0f2a33"
          };
        }

        if (palette) {
          applyPaletteToInputs(palette);
        }
      });
    });

    // Initialize inputs with default palette to stay in sync with scene.js
    applyPaletteToInputs(defaultPalette);
  });
})();