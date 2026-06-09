(function(){

"use strict";

const MODULE_ID =
"NEXUS_WORKSPACE_PERSISTENCE_493";

const STORAGE_KEY =
"umbra.nexus.workspace.persistence.v493";

const SNAPSHOT_KEY =
"umbra.nexus.workspace.snapshot.latest";

const state = {

  module:
  MODULE_ID,

  batch:
  493,

  status:
  "ACTIVE",

  mode:
  "SAFE_LOCAL_PERSISTENCE",

  operatorFlowAvailable:
  false,

  orchestratorAvailable:
  false,

  mountManagerAvailable:
  false,

  lastSaved:
  null,

  lastRestored:
  null,

  latestSnapshot:
  null,

  saveHistory:
  [],

  restoreHistory:
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

  if(state.events.length > 300){
    state.events.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:workspace-persistence:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getOperatorFlow(){
  return window.UmbraOperatorFlowEngine || null;
}

function getOrchestrator(){
  return window.UmbraSurfaceOrchestrator || null;
}

function getMountManager(){
  return window.UmbraWorkspaceMountManager || null;
}

function refreshDependencies(){

  state.operatorFlowAvailable =
  !!getOperatorFlow();

  state.orchestratorAvailable =
  !!getOrchestrator();

  state.mountManagerAvailable =
  !!getMountManager();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      operatorFlowAvailable:
      state.operatorFlowAvailable,

      orchestratorAvailable:
      state.orchestratorAvailable,

      mountManagerAvailable:
      state.mountManagerAvailable
    }
  );

  return {
    operatorFlowAvailable:
    state.operatorFlowAvailable,

    orchestratorAvailable:
    state.orchestratorAvailable,

    mountManagerAvailable:
    state.mountManagerAvailable
  };

}

function safeLocalStorageAvailable(){

  try{

    const testKey =
    "__umbra_persistence_test__";

    window.localStorage.setItem(testKey,"1");
    window.localStorage.removeItem(testKey);

    return true;

  }catch(error){
    return false;
  }

}

function readStorage(key){

  if(!safeLocalStorageAvailable()){
    return null;
  }

  try{

    const value =
    window.localStorage.getItem(key);

    return value
      ? JSON.parse(value)
      : null;

  }catch(error){

    emit(
      "STORAGE_READ_FAILED",
      {
        key,
        message:
        error && error.message
          ? error.message
          : String(error)
      }
    );

    return null;

  }

}

function writeStorage(key,value){

  if(!safeLocalStorageAvailable()){

    emit(
      "STORAGE_WRITE_FAILED",
      {
        key,
        reason:
        "LOCAL_STORAGE_UNAVAILABLE"
      }
    );

    return false;

  }

  try{

    window.localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  }catch(error){

    emit(
      "STORAGE_WRITE_FAILED",
      {
        key,
        message:
        error && error.message
          ? error.message
          : String(error)
      }
    );

    return false;

  }

}

function getActiveCenter(){

  const operatorFlow =
  getOperatorFlow();

  if(
    operatorFlow &&
    typeof operatorFlow.getState === "function"
  ){

    const flowState =
    operatorFlow.getState();

    if(flowState && flowState.activeCenter){
      return flowState.activeCenter;
    }

  }

  const orchestrator =
  getOrchestrator();

  if(
    orchestrator &&
    typeof orchestrator.getActiveCenter === "function"
  ){
    return orchestrator.getActiveCenter();
  }

  return null;

}

function collectSnapshot(reason){

  refreshDependencies();

  const operatorFlow =
  getOperatorFlow();

  const orchestrator =
  getOrchestrator();

  const mountManager =
  getMountManager();

  const operatorState =
  operatorFlow &&
  typeof operatorFlow.getState === "function"
    ? operatorFlow.getState()
    : null;

  const activeFlow =
  operatorFlow &&
  typeof operatorFlow.getActiveFlow === "function"
    ? operatorFlow.getActiveFlow()
    : null;

  const activeSurfaces =
  orchestrator &&
  typeof orchestrator.getActiveSurfaces === "function"
    ? orchestrator.getActiveSurfaces()
    : [];

  const mountTargets =
  mountManager &&
  typeof mountManager.getMountTargets === "function"
    ? mountManager.getMountTargets()
    : [];

  const missingMountTargets =
  mountManager &&
  typeof mountManager.getMissingMountTargets === "function"
    ? mountManager.getMissingMountTargets()
    : [];

  const snapshot = {

    module:
    MODULE_ID,

    batch:
    493,

    version:
    1,

    reason:
    reason || "MANUAL",

    activeCenter:
    getActiveCenter(),

    operatorState:
    operatorState,

    activeFlow:
    activeFlow,

    activeSurfaces:
    activeSurfaces,

    mountTargets:
    mountTargets,

    missingMountTargets:
    missingMountTargets,

    surfaceCount:
    Array.isArray(activeSurfaces) ? activeSurfaces.length : 0,

    mountTargetCount:
    Array.isArray(mountTargets) ? mountTargets.length : 0,

    missingMountTargetCount:
    Array.isArray(missingMountTargets) ? missingMountTargets.length : 0,

    dependencies:
    {
      operatorFlowAvailable:
      state.operatorFlowAvailable,

      orchestratorAvailable:
      state.orchestratorAvailable,

      mountManagerAvailable:
      state.mountManagerAvailable
    },

    timestamp:
    new Date().toISOString()

  };

  state.latestSnapshot =
  clone(snapshot);

  emit(
    "WORKSPACE_SNAPSHOT_COLLECTED",
    snapshot
  );

  return snapshot;

}

function saveWorkspace(reason){

  const snapshot =
  collectSnapshot(reason || "SAVE_WORKSPACE");

  const ok =
  writeStorage(
    STORAGE_KEY,
    snapshot
  );

  writeStorage(
    SNAPSHOT_KEY,
    snapshot
  );

  const record = {
    ok:
    !!ok,

    reason:
    snapshot.reason,

    activeCenter:
    snapshot.activeCenter,

    surfaceCount:
    snapshot.surfaceCount,

    mountTargetCount:
    snapshot.mountTargetCount,

    timestamp:
    new Date().toISOString()
  };

  state.lastSaved =
  record;

  state.saveHistory.push(record);

  if(state.saveHistory.length > 100){
    state.saveHistory.shift();
  }

  emit(
    ok
      ? "WORKSPACE_PERSISTED"
      : "WORKSPACE_PERSIST_FAILED",
    record
  );

  return !!ok;

}

function loadSnapshot(){

  const snapshot =
  readStorage(STORAGE_KEY) ||
  readStorage(SNAPSHOT_KEY);

  if(!snapshot){

    emit(
      "WORKSPACE_SNAPSHOT_NOT_FOUND",
      {
        storageKey:
        STORAGE_KEY
      }
    );

    return null;

  }

  state.latestSnapshot =
  clone(snapshot);

  emit(
    "WORKSPACE_SNAPSHOT_LOADED",
    snapshot
  );

  return clone(snapshot);

}

function restoreWorkspace(){

  refreshDependencies();

  const snapshot =
  loadSnapshot();

  if(!snapshot){

    const failed = {
      ok:
      false,

      reason:
      "NO_SNAPSHOT_AVAILABLE",

      timestamp:
      new Date().toISOString()
    };

    state.lastRestored =
    failed;

    state.restoreHistory.push(failed);

    emit(
      "WORKSPACE_RESTORE_FAILED",
      failed
    );

    return false;

  }

  const operatorFlow =
  getOperatorFlow();

  let routed = false;

  if(
    snapshot.activeCenter &&
    operatorFlow &&
    typeof operatorFlow.routeTo === "function"
  ){
    routed =
    operatorFlow.routeTo(snapshot.activeCenter);
  }

  const restored = {
    ok:
    true,

    activeCenter:
    snapshot.activeCenter || null,

    routed:
    !!routed,

    snapshotTimestamp:
    snapshot.timestamp,

    timestamp:
    new Date().toISOString()
  };

  state.lastRestored =
  restored;

  state.restoreHistory.push(restored);

  if(state.restoreHistory.length > 100){
    state.restoreHistory.shift();
  }

  emit(
    "WORKSPACE_RESTORED",
    restored
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:workspace-restored",
      {
        detail:
        restored
      }
    )
  );

  return !!restored.ok;

}

function clearWorkspacePersistence(){

  if(safeLocalStorageAvailable()){

    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(SNAPSHOT_KEY);

  }

  state.latestSnapshot =
  null;

  emit(
    "WORKSPACE_PERSISTENCE_CLEARED",
    {
      storageKey:
      STORAGE_KEY,

      snapshotKey:
      SNAPSHOT_KEY
    }
  );

  return true;

}

function bindAutoSave(){

  window.addEventListener(
    "umbra:operator-flow-resolved",
    function(event){

      saveWorkspace(
        "AUTO_OPERATOR_FLOW_RESOLVED"
      );

    }
  );

  window.addEventListener(
    "umbra:workspace-mounts-inspected",
    function(event){

      saveWorkspace(
        "AUTO_MOUNTS_INSPECTED"
      );

    }
  );

  emit(
    "AUTO_SAVE_BOUND",
    {
      operatorFlowResolved:
      true,

      workspaceMountsInspected:
      true
    }
  );

  return true;

}

function getLatestSnapshot(){
  return clone(state.latestSnapshot);
}

function getSaveHistory(){
  return clone(state.saveHistory);
}

function getRestoreHistory(){
  return clone(state.restoreHistory);
}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    493,

    status:
    state.status,

    mode:
    state.mode,

    operatorFlowAvailable:
    state.operatorFlowAvailable,

    orchestratorAvailable:
    state.orchestratorAvailable,

    mountManagerAvailable:
    state.mountManagerAvailable,

    storageAvailable:
    safeLocalStorageAvailable(),

    storageKey:
    STORAGE_KEY,

    snapshotKey:
    SNAPSHOT_KEY,

    lastSaved:
    state.lastSaved,

    lastRestored:
    state.lastRestored,

    latestSnapshot:
    state.latestSnapshot,

    hasSnapshot:
    !!state.latestSnapshot,

    saveHistory:
    state.saveHistory,

    saveHistoryCount:
    state.saveHistory.length,

    restoreHistory:
    state.restoreHistory,

    restoreHistoryCount:
    state.restoreHistory.length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraWorkspacePersistence = {

  id:
  MODULE_ID,

  batch:
  493,

  refreshDependencies,

  collectSnapshot,

  saveWorkspace,

  loadSnapshot,

  restoreWorkspace,

  clearWorkspacePersistence,

  bindAutoSave,

  getLatestSnapshot,

  getSaveHistory,

  getRestoreHistory,

  getState

};

refreshDependencies();

bindAutoSave();

saveWorkspace(
  "INITIAL_BOOTSTRAP"
);

console.log(
  MODULE_ID,
  getState()
);

})();
