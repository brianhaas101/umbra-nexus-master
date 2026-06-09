(function(){

"use strict";

const MODULE_ID =
"NEXUS_WORKSPACE_MOUNT_MANAGER_491";

const state = {

  module:
  MODULE_ID,

  batch:
  491,

  status:
  "ACTIVE",

  mode:
  "SAFE_DETECTION_ONLY",

  orchestratorAvailable:
  false,

  activeCenter:
  null,

  activeSurfaces:
  [],

  mountTargets:
  [],

  missingMountTargets:
  [],

  detectedMountTargets:
  [],

  mountHistory:
  [],

  events:
  [],

  createdAt:
  new Date().toISOString()

};

function clone(value){

  return JSON.parse(
    JSON.stringify(value)
  );

}

function emit(type,payload = {}){

  const event = {
    type,
    payload,
    timestamp:
    new Date().toISOString()
  };

  state.events.push(event);

  if(state.events.length > 250){
    state.events.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:workspace-mount-manager:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getOrchestrator(){

  return window.UmbraSurfaceOrchestrator || null;

}

function refreshDependencies(){

  state.orchestratorAvailable =
  !!getOrchestrator();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      orchestratorAvailable:
      state.orchestratorAvailable
    }
  );

  return {
    orchestratorAvailable:
    state.orchestratorAvailable
  };

}

function resolveDomTarget(selector){

  if(!selector){
    return null;
  }

  try{
    return document.querySelector(selector);
  }catch(error){
    return null;
  }

}

function inspectSurface(surface){

  const element =
  resolveDomTarget(surface.mount);

  return {

    id:
    surface.id,

    module:
    surface.module,

    mount:
    surface.mount,

    type:
    surface.type,

    exists:
    !!element,

    elementTag:
    element ? element.tagName : null,

    elementId:
    element ? element.id || null : null,

    className:
    element ? String(element.className || "") : "",

    managed:
    false,

    visible:
    element
      ? !!(
          element.offsetWidth ||
          element.offsetHeight ||
          element.getClientRects().length
        )
      : false

  };

}

function inspectCurrent(){

  refreshDependencies();

  const orchestrator =
  getOrchestrator();

  if(
    !orchestrator ||
    typeof orchestrator.getActiveSurfaces !== "function"
  ){

    emit(
      "MOUNT_INSPECTION_FAILED",
      {
        reason:
        "SURFACE_ORCHESTRATOR_UNAVAILABLE"
      }
    );

    return false;

  }

  const surfaces =
  orchestrator.getActiveSurfaces();

  const center =
  typeof orchestrator.getActiveCenter === "function"
    ? orchestrator.getActiveCenter()
    : null;

  const inspected =
  Array.isArray(surfaces)
    ? surfaces.map(inspectSurface)
    : [];

  state.activeCenter =
  center;

  state.activeSurfaces =
  clone(surfaces || []);

  state.mountTargets =
  inspected;

  state.detectedMountTargets =
  inspected.filter(function(item){
    return item.exists;
  });

  state.missingMountTargets =
  inspected.filter(function(item){
    return !item.exists;
  });

  const snapshot = {

    center:
    state.activeCenter,

    surfaceCount:
    state.activeSurfaces.length,

    mountTargetCount:
    state.mountTargets.length,

    detectedCount:
    state.detectedMountTargets.length,

    missingCount:
    state.missingMountTargets.length,

    targets:
    clone(state.mountTargets),

    timestamp:
    new Date().toISOString()

  };

  state.mountHistory.push(snapshot);

  if(state.mountHistory.length > 100){
    state.mountHistory.shift();
  }

  emit(
    "MOUNT_TARGETS_INSPECTED",
    snapshot
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:workspace-mounts-inspected",
      {
        detail:
        snapshot
      }
    )
  );

  return true;

}

function inspectRoute(center){

  refreshDependencies();

  const orchestrator =
  getOrchestrator();

  if(
    !orchestrator ||
    typeof orchestrator.orchestrateRoute !== "function"
  ){

    emit(
      "MOUNT_ROUTE_INSPECTION_FAILED",
      {
        center,
        reason:
        "SURFACE_ORCHESTRATOR_UNAVAILABLE"
      }
    );

    return false;

  }

  const ok =
  orchestrator.orchestrateRoute(center);

  if(!ok){

    emit(
      "MOUNT_ROUTE_INSPECTION_FAILED",
      {
        center,
        reason:
        "SURFACE_ORCHESTRATOR_REJECTED"
      }
    );

    return false;

  }

  return inspectCurrent();

}

function ensurePassiveMount(selector){

  if(!selector){
    return null;
  }

  let node =
  resolveDomTarget(selector);

  if(node){
    return node;
  }

  const id =
  selector.charAt(0) === "#"
    ? selector.slice(1)
    : selector.replace(/[^a-zA-Z0-9_-]/g,"-");

  node =
  document.createElement("div");

  node.id =
  id;

  node.setAttribute(
    "data-umbra-passive-mount",
    "true"
  );

  node.setAttribute(
    "data-created-by",
    MODULE_ID
  );

  node.style.display =
  "none";

  document.body.appendChild(node);

  emit(
    "PASSIVE_MOUNT_CREATED",
    {
      selector,
      id
    }
  );

  return node;

}

function createMissingPassiveMounts(){

  const created = [];

  state.missingMountTargets.forEach(function(target){

    const node =
    ensurePassiveMount(target.mount);

    if(node){
      created.push({
        mount:
        target.mount,

        id:
        node.id
      });
    }

  });

  emit(
    "PASSIVE_MOUNTS_CREATED",
    {
      count:
      created.length,

      created
    }
  );

  inspectCurrent();

  return created;

}

function getMountTargets(){

  return clone(state.mountTargets);

}

function getMissingMountTargets(){

  return clone(state.missingMountTargets);

}

function getDetectedMountTargets(){

  return clone(state.detectedMountTargets);

}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    491,

    status:
    state.status,

    mode:
    state.mode,

    orchestratorAvailable:
    state.orchestratorAvailable,

    activeCenter:
    state.activeCenter,

    activeSurfaces:
    state.activeSurfaces,

    activeSurfaceCount:
    state.activeSurfaces.length,

    mountTargets:
    state.mountTargets,

    mountTargetCount:
    state.mountTargets.length,

    detectedMountTargets:
    state.detectedMountTargets,

    detectedCount:
    state.detectedMountTargets.length,

    missingMountTargets:
    state.missingMountTargets,

    missingCount:
    state.missingMountTargets.length,

    mountHistory:
    state.mountHistory,

    historyCount:
    state.mountHistory.length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraWorkspaceMountManager = {

  id:
  MODULE_ID,

  batch:
  491,

  refreshDependencies,

  inspectCurrent,

  inspectRoute,

  createMissingPassiveMounts,

  getMountTargets,

  getMissingMountTargets,

  getDetectedMountTargets,

  getState

};

refreshDependencies();

inspectCurrent();

console.log(
  MODULE_ID,
  getState()
);

})();
