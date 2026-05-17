// public/globe/intel/clients/black_dragon.integrity.check.js
// Black Dragon Integrity Check
// Purpose: verify all Black Dragon client preset components are loaded before testing or live use.

(function () {
  window.UmbraIntel = window.UmbraIntel || {};
  window.UmbraIntel.clients = window.UmbraIntel.clients || {};
  window.UmbraIntel.adapters = window.UmbraIntel.adapters || {};
  window.UmbraIntel.layers = window.UmbraIntel.layers || {};

  function exists(path, label) {
    const ok = Boolean(path);
    return { label, ok };
  }

  function runBlackDragonIntegrityCheck() {
    const checks = [
      exists(window.UmbraIntel.clients.blackDragon, "Client config"),
      exists(window.UmbraIntel.clients.blackDragonSignals, "Signal definitions"),

      exists(window.UmbraIntel.layers.registry, "12-layer registry"),
      exists(window.UmbraIntel.layers.sourceCatalog, "Source catalog"),
      exists(window.UmbraIntel.layers.weights, "Layer weights"),
      exists(window.UmbraIntel.layers.scoreEngine, "Layer score engine"),

      exists(window.UmbraIntel.adapters.blackDragonLeadNormalizer, "Lead normalizer"),
      exists(window.UmbraIntel.adapters.blackDragonScoring, "Scoring adapter"),
      exists(window.UmbraIntel.adapters.blackDragonPipeline, "Pipeline adapter"),
      exists(window.UmbraIntel.adapters.blackDragonDossier, "Dossier adapter"),
      exists(window.UmbraIntel.adapters.blackDragonLayerBridge, "Layer bridge"),
      exists(window.UmbraIntel.adapters.blackDragonDossierLayerEnhancer, "Dossier layer enhancer"),
      exists(window.UmbraIntel.adapters.blackDragonProcessor, "Black Dragon processor"),
      exists(window.UmbraIntel.adapters.blackDragonClientPresetBridge, "Client preset bridge")
    ];

    const layerIntegrity =
      typeof window.UmbraIntel.layers.runLayerIntegrityCheck === "function"
        ? window.UmbraIntel.layers.runLayerIntegrityCheck()
        : null;

    const pass =
      checks.every((item) => item.ok) &&
      (layerIntegrity ? layerIntegrity.pass === true : true);

    const report = {
      system: "Black Dragon Client Preset",
      stage: "CLIENT_PRESET_INTEGRITY",
      pass,
      checks,
      layerIntegrity,
      activeClient: window.UmbraIntel.activeClient || null,
      timestamp: new Date().toISOString()
    };

    if (pass) {
      console.info("[BLACK DRAGON INTEGRITY] PASS", report);
    } else {
      console.error("[BLACK DRAGON INTEGRITY] FAIL", report);
    }

    return report;
  }

  window.UmbraIntel.runBlackDragonIntegrityCheck = runBlackDragonIntegrityCheck;

  console.info("[black_dragon.integrity.check] Ready. Run: UmbraIntel.runBlackDragonIntegrityCheck()");
})();