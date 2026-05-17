(function () {
  "use strict";

  const G = window.UmbraCommandDeck =
    window.UmbraCommandDeck || {};

  let state = {
    mounted: false,
    activeModule: "WORLD",
    modules: {},
    last_error: null
  };

  const MODULE_ALIASES = {
    "ACCESS": "ACCESS",
    "PROFILE": "PROFILE",
    "ACCOUNT": "ACCOUNT",

    "LEADS ENGINE": "LEADS_ENGINE",
    "CLIENTS": "CLIENTS",
    "OPERATIONS": "OPERATIONS",
    "SAFEGUARDS": "SAFEGUARDS",

    "WORLD": "WORLD"
  };

  function normalize(text) {
    return String(text || "")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  function getButtons() {
    return Array.from(document.querySelectorAll("button,a,div,li"))
      .filter(el => {
        const txt = normalize(el.textContent);

        return !!MODULE_ALIASES[txt];
      });
  }

  function clearActiveStates() {
    getButtons().forEach(el => {
      el.classList.remove("umbra-commanddeck-active");
      el.removeAttribute("data-umbra-active");
    });
  }

  function applyActiveState(moduleId) {
    clearActiveStates();

    getButtons().forEach(el => {
      const txt = normalize(el.textContent);

      if (MODULE_ALIASES[txt] === moduleId) {
        el.classList.add("umbra-commanddeck-active");
        el.setAttribute("data-umbra-active", "true");
      }
    });

    state.activeModule = moduleId;

    try {
      window.UMBRA_ACTIVE_MODULE = moduleId;
    } catch (err) {}
  }

  function ensureStyle() {
    if (document.getElementById("umbraCommandDeckStyle")) {
      return true;
    }

    const style = document.createElement("style");

    style.id = "umbraCommandDeckStyle";

    style.textContent = `
      .umbra-commanddeck-active,
      [data-umbra-active="true"] {
        outline: 1px solid rgba(255,140,42,0.85) !important;
        box-shadow:
          0 0 12px rgba(255,140,42,0.25),
          inset 0 0 8px rgba(255,140,42,0.12);
        border-radius: 8px;
        transition: all 140ms ease;
      }
    `;

    document.head.appendChild(style);

    return true;
  }

  function bindButton(el) {
    if (!el || el.__umbraBound) return false;

    const txt = normalize(el.textContent);
    const moduleId = MODULE_ALIASES[txt];

    if (!moduleId) return false;

    el.__umbraBound = true;

    el.style.cursor = "pointer";

    el.addEventListener("click", function () {
      applyActiveState(moduleId);

      console.info("[UmbraCommandDeck] active module", {
        module: moduleId
      });

      try {
        window.dispatchEvent(
          new CustomEvent("umbra:moduleChanged", {
            detail: {
              module: moduleId
            }
          })
        );
      } catch (err) {}
    });

    state.modules[moduleId] = true;

    return true;
  }

  function bindAll() {
    ensureStyle();

    const buttons = getButtons();

    buttons.forEach(bindButton);

    if (!state.activeModule) {
      state.activeModule = "WORLD";
    }

    applyActiveState(state.activeModule);

    state.mounted = true;

    return buttons.length;
  }

  function getDebugState() {
    return {
      version: "umbra_command_deck_runtime_v1",
      mounted: state.mounted,
      active_module: state.activeModule,
      modules_detected: Object.keys(state.modules),
      buttons_detected: getButtons().length,
      last_error: state.last_error
    };
  }

  G.bindAll = bindAll;
  G.applyActiveState = applyActiveState;
  G.getButtons = getButtons;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(bindAll, 1500);
  });

  if (document.readyState !== "loading") {
    setTimeout(bindAll, 1500);
  }
})();
