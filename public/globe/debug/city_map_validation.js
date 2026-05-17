'use strict';
(function () {
  const G = window.UmbraGlobe = window.UmbraGlobe || {};
  function validateCityMapState() {
    const state = G.state || {};
    const cityMap = state.cityMap || {};
    const picks = state.cityMapPickMeshes || [];
    const snapshots = state.cityMapSnapshots || [];
    return {
      activeCityId: state.activeCityId || null,
      activeEntityId: state.activeEntityId || null,
      snapshotCount: Array.isArray(snapshots) ? snapshots.length : 0,
      pickMeshCount: Array.isArray(picks) ? picks.length : 0,
      selectedMesh: state.selectedMesh?.name || null,
      zoom: cityMap.zoom ?? null,
      panX: cityMap.panX ?? null,
      panY: cityMap.panY ?? null
    };
  }
  function validateProjectedNode(entityId) {
    const state = G.state || {};
    const picks = state.cityMapPickMeshes || [];
    const mesh = picks.find(m => m?.userData?.entity_id === entityId) || null;
    return {
      entity_id: entityId || null,
      found: Boolean(mesh),
      city_id: mesh?.userData?.city_id || null,
      lat: mesh?.userData?.lat ?? null,
      lon: mesh?.userData?.lon ?? null,
      x: mesh?.userData?.x ?? null,
      y: mesh?.userData?.y ?? null,
      industry_id: mesh?.userData?.industry_id || null
    };
  }
  G.validateCityMapState = validateCityMapState;
  G.validateProjectedNode = validateProjectedNode;
})();
