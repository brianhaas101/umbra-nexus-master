'use strict';
(function () {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};

  function attachLawEnforcementAdapter() {
    if (!G.state) G.state = {};

    G.openDossierFromResolved = function openDossierFromResolved(entityId) {
      const dossier = G.state?.resolvedDossiers?.get(entityId) || null;
      G.state.activeEntityId = entityId || null;
      G.state.currentResolvedDossier = dossier;

      if (typeof G.renderResolvedDossierPanel === 'function') {
        G.renderResolvedDossierPanel(dossier);
      }

      return dossier;
    };

    return {
      hasCreateCityMapNode: typeof G.createCityMapNode === 'function',
      hasRegisterCityMapPick: typeof G.registerCityMapPick === 'function',
      hasProjectCityMapLatLon: typeof G.projectCityMapLatLon === 'function'
    };
  }

  G.attachLawEnforcementAdapter = attachLawEnforcementAdapter;
})();