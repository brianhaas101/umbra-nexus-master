'use strict';
(function () {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};
  function traceLawEnforcementCityMapState() {
    const state = G.state || {};
    return {
      activeCityId: state.activeCityId || null,
      snapshotCount: Array.isArray(state.cityMapSnapshots) ? state.cityMapSnapshots.length : 0,
      dossierCount: state.resolvedDossiers instanceof Map ? state.resolvedDossiers.size : 0,
      pickMeshCount: Array.isArray(state.cityMapPickMeshes) ? state.cityMapPickMeshes.length : 0,
      activeEntityId: state.activeEntityId || null,
      currentResolvedDossier: state.currentResolvedDossier?.entity_id || null
    };
  }
  function traceLawEnforcementPick(mesh) {
    return {
      entity_id: mesh?.userData?.entity_id || null,
      city_id: mesh?.userData?.city_id || null,
      industry_id: mesh?.userData?.industry_id || null,
      pickRole: mesh?.userData?.pickRole || null
    };
  }
  G.traceLawEnforcementCityMapState = traceLawEnforcementCityMapState;
  G.traceLawEnforcementPick = traceLawEnforcementPick;
})();
