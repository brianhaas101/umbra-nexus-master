(function(){

"use strict";

const MODULE_ID =
"NEXUS_INTELLIGENCE_INTEGRATION_497";

const state = {

  module:
  MODULE_ID,

  batch:
  497,

  status:
  "ACTIVE",

  mode:
  "SAFE_INTELLIGENCE_INTEGRATION",

  commandCenterAvailable:
  false,

  searchLayerAvailable:
  false,

  contextSwitchingAvailable:
  false,

  operatorFlowAvailable:
  false,

  active:
  false,

  activeContext:
  null,

  queryHistory:
  [],

  intelligenceEvents:
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

  state.intelligenceEvents.push(event);

  if(state.intelligenceEvents.length > 300){
    state.intelligenceEvents.shift();
  }

  window.dispatchEvent(
    new CustomEvent(
      "umbra:intelligence:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getCommandCenter(){
  return window.UmbraCommandCenterIntegration || null;
}

function getSearchLayer(){
  return window.UmbraUnifiedSearchCommand || null;
}

function getContextSwitching(){
  return window.UmbraContextSwitchingEngine || null;
}

function getOperatorFlow(){
  return window.UmbraOperatorFlowEngine || null;
}

function refreshDependencies(){

  state.commandCenterAvailable =
  !!getCommandCenter();

  state.searchLayerAvailable =
  !!getSearchLayer();

  state.contextSwitchingAvailable =
  !!getContextSwitching();

  state.operatorFlowAvailable =
  !!getOperatorFlow();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      commandCenterAvailable:
      state.commandCenterAvailable,

      searchLayerAvailable:
      state.searchLayerAvailable,

      contextSwitchingAvailable:
      state.contextSwitchingAvailable,

      operatorFlowAvailable:
      state.operatorFlowAvailable
    }
  );

  return {
    commandCenterAvailable:
    state.commandCenterAvailable,

    searchLayerAvailable:
    state.searchLayerAvailable,

    contextSwitchingAvailable:
    state.contextSwitchingAvailable,

    operatorFlowAvailable:
    state.operatorFlowAvailable
  };

}

function activate(){

  refreshDependencies();

  const context =
  getContextSwitching();

  if(
    context &&
    typeof context.switchContext === "function"
  ){

    context.switchContext(
      "INTELLIGENCE_CENTER",
      "INTELLIGENCE_INTEGRATION"
    );

  }

  state.active =
  true;

  state.activeContext =
  "INTELLIGENCE_CENTER";

  emit(
    "INTELLIGENCE_ACTIVATED",
    {
      center:
      state.activeContext
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:intelligence-activated",
      {
        detail:
        getState()
      }
    )
  );

  return true;

}

function deactivate(){

  state.active =
  false;

  emit(
    "INTELLIGENCE_DEACTIVATED",
    {}
  );

  return true;

}

function processQuery(query){

  refreshDependencies();

  const search =
  getSearchLayer();

  const results =
  (
    search &&
    typeof search.search === "function"
  )
    ? search.search(query)
    : [];

  const record = {

    query:
    String(query || ""),

    resultCount:
    Array.isArray(results)
      ? results.length
      : 0,

    timestamp:
    new Date().toISOString()

  };

  state.queryHistory.push(record);

  if(state.queryHistory.length > 200){
    state.queryHistory.shift();
  }

  emit(
    "QUERY_PROCESSED",
    record
  );

  return clone(results);

}

function search(query){

  return processQuery(query);

}

function inspect(){

  return {

    active:
    state.active,

    activeContext:
    state.activeContext,

    queryCount:
    state.queryHistory.length,

    dependencies:
    {

      commandCenter:
      state.commandCenterAvailable,

      searchLayer:
      state.searchLayerAvailable,

      contextSwitching:
      state.contextSwitchingAvailable,

      operatorFlow:
      state.operatorFlowAvailable

    }

  };

}

function getQueryHistory(){

  return clone(
    state.queryHistory
  );

}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    497,

    status:
    state.status,

    mode:
    state.mode,

    commandCenterAvailable:
    state.commandCenterAvailable,

    searchLayerAvailable:
    state.searchLayerAvailable,

    contextSwitchingAvailable:
    state.contextSwitchingAvailable,

    operatorFlowAvailable:
    state.operatorFlowAvailable,

    active:
    state.active,

    activeContext:
    state.activeContext,

    queryHistory:
    state.queryHistory,

    queryHistoryCount:
    state.queryHistory.length,

    intelligenceEvents:
    state.intelligenceEvents,

    intelligenceEventCount:
    state.intelligenceEvents.length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraIntelligenceIntegration = {

  id:
  MODULE_ID,

  batch:
  497,

  refreshDependencies,

  activate,

  deactivate,

  inspect,

  search,

  processQuery,

  getQueryHistory,

  getState

};

refreshDependencies();

console.log(
  MODULE_ID,
  getState()
);

})();
