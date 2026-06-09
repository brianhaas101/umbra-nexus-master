(function(){

"use strict";

const MODULE_ID =
"NEXUS_SURFACE_ORCHESTRATOR_490";

const state = {

  module:
  MODULE_ID,

  batch:
  490,

  status:
  "ACTIVE",

  routerAvailable:
  false,

  activeCenter:
  null,

  activeRoute:
  null,

  activeSurfaces:
  [],

  surfaceHistory:
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
      "umbra:surface-orchestrator:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getRouter(){

  return window.UmbraWorkspaceRouter || null;

}

function refreshDependencies(){

  state.routerAvailable =
  !!getRouter();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      routerAvailable:
      state.routerAvailable
    }
  );

  return {
    routerAvailable:
    state.routerAvailable
  };

}

function normalizeSurface(mount, index){

  return {

    id:
    [
      mount.module || "unknown_module",
      mount.type || "UNKNOWN",
      index
    ].join(":"),

    module:
    mount.module || null,

    mount:
    mount.mount || null,

    type:
    mount.type || "UNKNOWN",

    active:
    true,

    visible:
    false,

    managed:
    false

  };

}

function resolveSurfacesFromRoute(route){

  if(
    !route ||
    !Array.isArray(route.mounts)
  ){
    return [];
  }

  return route.mounts.map(function(mount,index){
    return normalizeSurface(mount,index);
  });

}

function orchestrateRoute(center){

  refreshDependencies();

  const router =
  getRouter();

  if(
    !router ||
    typeof router.routeTo !== "function"
  ){

    emit(
      "SURFACE_ORCHESTRATION_FAILED",
      {
        center,
        reason:
        "WORKSPACE_ROUTER_UNAVAILABLE"
      }
    );

    return false;

  }

  const routed =
  router.routeTo(center);

  if(!routed){

    emit(
      "SURFACE_ORCHESTRATION_FAILED",
      {
        center,
        reason:
        "WORKSPACE_ROUTER_REJECTED"
      }
    );

    return false;

  }

  const route =
  typeof router.getActiveRoute === "function"
    ? router.getActiveRoute()
    : null;

  const surfaces =
  resolveSurfacesFromRoute(route);

  state.activeCenter =
  center;

  state.activeRoute =
  route;

  state.activeSurfaces =
  surfaces;

  const snapshot = {

    center,

    route,

    surfaces:
    clone(surfaces),

    surfaceCount:
    surfaces.length,

    timestamp:
    new Date().toISOString()

  };

  state.surfaceHistory.push(snapshot);

  if(state.surfaceHistory.length > 100){
    state.surfaceHistory.shift();
  }

  emit(
    "SURFACES_ORCHESTRATED",
    snapshot
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:surfaces-orchestrated",
      {
        detail:
        snapshot
      }
    )
  );

  return true;

}

function orchestrateCurrent(){

  refreshDependencies();

  const router =
  getRouter();

  let center =
  "COMMAND_CENTER";

  if(
    router &&
    typeof router.getActiveCenter === "function" &&
    router.getActiveCenter()
  ){

    center =
    router.getActiveCenter();

  }

  return orchestrateRoute(center);

}

function getActiveCenter(){

  return state.activeCenter;

}

function getActiveRoute(){

  return clone(
    state.activeRoute
  );

}

function getActiveSurfaces(){

  return clone(
    state.activeSurfaces
  );

}

function getSurfaceHistory(){

  return clone(
    state.surfaceHistory
  );

}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    490,

    status:
    state.status,

    routerAvailable:
    state.routerAvailable,

    activeCenter:
    state.activeCenter,

    activeRoute:
    state.activeRoute,

    activeSurfaces:
    state.activeSurfaces,

    activeSurfaceCount:
    state.activeSurfaces.length,

    surfaceHistory:
    state.surfaceHistory,

    historyCount:
    state.surfaceHistory.length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraSurfaceOrchestrator = {

  id:
  MODULE_ID,

  batch:
  490,

  refreshDependencies,

  orchestrateRoute,

  orchestrateCurrent,

  resolveSurfacesFromRoute,

  getActiveCenter,

  getActiveRoute,

  getActiveSurfaces,

  getSurfaceHistory,

  getState

};

orchestrateCurrent();

console.log(
  MODULE_ID,
  getState()
);

})();
