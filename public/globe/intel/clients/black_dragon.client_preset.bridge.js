// public/globe/intel/clients/black_dragon.client_preset.bridge.js
// Black Dragon Client Preset Bridge
// Purpose: connect the Account "Apply Black Dragon" preset UI to the Black Dragon config safely.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const config = window.UmbraIntel.clients.blackDragon;
  const signalDefs = window.UmbraIntel.clients.blackDragonSignals;

  if (!config || !signalDefs) {
    console.error("[black_dragon.client_preset.bridge] Missing config or signal definitions.");
    return;
  }

  function text(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function summarizeTargetTypes() {
    return config.target_profile.target_organization_types
      .slice(0, 6)
      .map((v) => v.replace(/_/g, " "))
      .join(", ");
  }

  function summarizeSignals() {
    return Object.values(signalDefs.top_signals)
      .slice(0, 5)
      .map((signal) => signal.label)
      .join("; ");
  }

  function summarizeRegions() {
    return `All 50 states; Tier 1 weighted: ${config.target_profile.geography.tier_1_states.join(", ")}`;
  }

  function activateRuntime() {
    const G = window.UmbraGlobe;
    const I = window.UmbraIntel;

    if (!G || !G.state || !I?.clients?.blackDragon) {
      console.error("[black_dragon.client_preset.bridge] Runtime activation failed.", {
        hasGlobe: !!G,
        hasState: !!G?.state,
        hasClient: !!I?.clients?.blackDragon
      });

      return {
        applied: false,
        reason: "missing_runtime_dependency"
      };
    }

    G.state.activeClient = config.client_id;
    G.state.activeClientKey = "blackDragon";
    G.state.clientConfig = I.clients.blackDragon;
    G.state.clientSignals = I.clients.blackDragonSignals || null;

    I.activeClient = config.client_id;
    I.activeClientKey = "blackDragon";
    I.activeClientConfig = config;
    I.activeClientSignals = signalDefs;

    I.BlackDragon = I.clients.blackDragon;
    I.BlackDragonSignals = I.clients.blackDragonSignals || null;

    window.BlackDragon = I.clients.blackDragon;
    window.BlackDragonSignals = I.clients.blackDragonSignals || null;

    console.info("[black_dragon.client_preset.bridge] Black Dragon runtime activated.", {
      activeClient: G.state.activeClient,
      activeClientKey: G.state.activeClientKey,
      client_id: G.state.clientConfig?.client_id,
      hasSignals: !!G.state.clientSignals
    });

    return {
      applied: true,
      activeClient: G.state.activeClient,
      activeClientKey: G.state.activeClientKey,
      client_id: G.state.clientConfig.client_id,
      hasSignals: !!G.state.clientSignals
    };
  }

  function applyPreset() {
    text("clientConfigIndustry", "Law Enforcement / Public Safety Training");
    text("clientConfigUseCase", "OMG certification lead generation and agency training sales");
    text("clientConfigScope", "National — United States");
    text("clientConfigTargets", summarizeTargetTypes());
    text("clientConfigSignals", summarizeSignals());
    text("clientConfigRegions", summarizeRegions());

    console.info("[black_dragon.client_preset.bridge] Black Dragon preset applied.", {
      client_id: config.client_id,
      client_name: config.client_name
    });

    return activateRuntime();
  }

  function bindPresetButton() {
    const select = document.getElementById("clientPresetSelect");
    const button = document.getElementById("applyClientPreset");

    if (!select || !button) {
      console.warn("[black_dragon.client_preset.bridge] Preset controls not found.");
      return false;
    }

    button.addEventListener("click", function () {
      if (select.value === "black_dragon") {
        applyPreset();
      }
    });

    return true;
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindPresetButton, { once: true });
    } else {
      bindPresetButton();
    }
  }

  window.UmbraIntel.adapters.blackDragonClientPresetBridge = Object.freeze({
    init,
    applyPreset,
    activateRuntime,
    bindPresetButton
  });

  init();

  console.info("[black_dragon.client_preset.bridge] Ready.");
})();