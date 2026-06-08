(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};

  const config =
    window.UmbraIntel.clients.blackDragon ||
    window.UmbraClientConfig?.presets?.black_dragon ||
    window.UmbraClientConfig?.black_dragon ||
    null;

  const signalDefs = window.UmbraIntel.clients.blackDragonSignals || null;

  if (config && !window.UmbraIntel.clients.blackDragon) {
    window.UmbraIntel.clients.blackDragon = config;
  }

  function summarizeTargetTypes() {
    const types =
      config?.target_profile?.target_organization_types ||
      config?.config?.targetTypes ||
      config?.targetTypes ||
      [];
    return Array.isArray(types) ? types.join(", ") : String(types || "");
  }

  function summarizeSignals() {
    const signals =
      signalDefs?.top_signals
        ? Object.values(signalDefs.top_signals)
        : config?.config?.prioritySignals || config?.prioritySignals || [];
    return Array.isArray(signals)
      ? signals.map(s => typeof s === "string" ? s : s?.label || s?.signal_id || "UNKNOWN_SIGNAL").join("; ")
      : "";
  }

  function summarizeRegions() {
    const regions =
      config?.target_profile?.geography ||
      config?.config?.primaryRegions ||
      config?.config?.regions ||
      config?.regions ||
      [];
    if (Array.isArray(regions)) return regions.join(", ");
    if (typeof regions === "object" && regions !== null) return Object.values(regions).flat().join(", ");
    return String(regions || "");
  }

  function activateRuntime() {
    const G = window.UmbraGlobe;
    const I = window.UmbraIntel;
    if (!G || !G.state || !config) {
      console.error("[black_dragon.client_preset.bridge] Runtime activation failed.", {
        hasGlobe: !!G,
        hasState: !!G?.state,
        hasClient: !!config
      });
      return false;
    }

    G.state.activeClient = config.client_id || "black_dragon_omg_cert_v1";
    G.state.activeClientKey = "blackDragon";
    G.state.clientConfig = config;
    G.state.clientSignals = signalDefs;

    I.activeClient = G.state.activeClient;
    I.activeClientKey = "blackDragon";
    I.activeClientConfig = config;
    I.activeClientSignals = signalDefs;

    window.BlackDragon = config;
    window.BlackDragonSignals = signalDefs;

    console.info("[black_dragon.client_preset.bridge] Black Dragon runtime activated.", {
      activeClient: G.state.activeClient,
      activeClientKey: G.state.activeClientKey,
      hasSignals: !!signalDefs
    });

    return true;
  }

  function applyPreset() {
    console.info("[black_dragon.client_preset.bridge] Black Dragon preset applied.", {
      targets: summarizeTargetTypes(),
      signals: summarizeSignals(),
      regions: summarizeRegions()
    });
    return activateRuntime();
  }

  window.UmbraIntel.adapters.blackDragonClientPresetBridge = Object.freeze({
    applyPreset,
    activateRuntime
  });

  window.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("clientPresetSelect");
    const button = document.getElementById("applyClientPreset");

    if (!select || !button) {
      console.warn("[black_dragon.client_preset.bridge] Preset controls not found.");
      return;
    }

    button.addEventListener("click", () => {
      if (select.value === "black_dragon") applyPreset();
    });
  });

  console.info("[black_dragon.client_preset.bridge] Ready.");
})();
