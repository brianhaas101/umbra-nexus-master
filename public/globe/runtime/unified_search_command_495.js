(function(){

"use strict";

const MODULE_ID =
"NEXUS_UNIFIED_SEARCH_COMMAND_495";

const state = {

  module:
  MODULE_ID,

  batch:
  495,

  status:
  "ACTIVE",

  mode:
  "SAFE_COMMAND_RESOLUTION",

  contextSwitchingAvailable:
  false,

  operatorFlowAvailable:
  false,

  persistenceAvailable:
  false,

  lastQuery:
  null,

  lastCommand:
  null,

  commandHistory:
  [],

  searchHistory:
  [],

  resolvedCommands:
  [],

  registeredCommands:
  {},

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
      "umbra:unified-search-command:event",
      {
        detail:
        event
      }
    )
  );

  return event;

}

function getContextSwitching(){
  return window.UmbraContextSwitchingEngine || null;
}

function getOperatorFlow(){
  return window.UmbraOperatorFlowEngine || null;
}

function getPersistence(){
  return window.UmbraWorkspacePersistence || null;
}

function refreshDependencies(){

  state.contextSwitchingAvailable =
  !!getContextSwitching();

  state.operatorFlowAvailable =
  !!getOperatorFlow();

  state.persistenceAvailable =
  !!getPersistence();

  emit(
    "DEPENDENCIES_REFRESHED",
    {
      contextSwitchingAvailable:
      state.contextSwitchingAvailable,

      operatorFlowAvailable:
      state.operatorFlowAvailable,

      persistenceAvailable:
      state.persistenceAvailable
    }
  );

  return {
    contextSwitchingAvailable:
    state.contextSwitchingAvailable,

    operatorFlowAvailable:
    state.operatorFlowAvailable,

    persistenceAvailable:
    state.persistenceAvailable
  };

}

function normalizeQuery(input){

  if(input === null || input === undefined){
    return "";
  }

  return String(input).trim();

}

function tokenize(query){

  return normalizeQuery(query)
    .split(/\s+/)
    .filter(Boolean);

}

function inferCenter(query){

  const q =
  normalizeQuery(query).toLowerCase();

  if(
    q.indexOf("intelligence") >= 0 ||
    q.indexOf("intel") >= 0 ||
    q.indexOf("brain") >= 0
  ){
    return "INTELLIGENCE_CENTER";
  }

  if(
    q.indexOf("dossier") >= 0 ||
    q.indexOf("file") >= 0 ||
    q.indexOf("profile") >= 0 ||
    q.indexOf("record") >= 0
  ){
    return "DOSSIER_CENTER";
  }

  if(
    q.indexOf("operation") >= 0 ||
    q.indexOf("ops") >= 0 ||
    q.indexOf("automation") >= 0 ||
    q.indexOf("task") >= 0
  ){
    return "OPERATIONS_CENTER";
  }

  if(
    q.indexOf("command") >= 0 ||
    q.indexOf("control") >= 0 ||
    q.indexOf("console") >= 0
  ){
    return "COMMAND_CENTER";
  }

  if(
    q.indexOf("home") >= 0 ||
    q.indexOf("hub") >= 0 ||
    q.indexOf("main") >= 0
  ){
    return "HOME_CENTER";
  }

  return null;

}

function inferCommandType(query){

  const q =
  normalizeQuery(query).toLowerCase();

  if(
    q.indexOf("go ") === 0 ||
    q.indexOf("open ") === 0 ||
    q.indexOf("switch ") === 0 ||
    q.indexOf("route ") === 0 ||
    q.indexOf("show ") === 0
  ){
    return "SWITCH_CONTEXT";
  }

  if(
    q.indexOf("save") >= 0 ||
    q.indexOf("persist") >= 0 ||
    q.indexOf("snapshot") >= 0
  ){
    return "SAVE_WORKSPACE";
  }

  if(
    q.indexOf("restore") >= 0 ||
    q.indexOf("reload workspace") >= 0
  ){
    return "RESTORE_WORKSPACE";
  }

  if(
    q.indexOf("inspect") >= 0 ||
    q.indexOf("check") >= 0 ||
    q.indexOf("audit") >= 0
  ){
    return "INSPECT_CONTEXT";
  }

  if(
    q.indexOf("search") >= 0 ||
    q.indexOf("find") >= 0 ||
    q.indexOf("?") >= 0
  ){
    return "SEARCH";
  }

  const center =
  inferCenter(query);

  if(center){
    return "SWITCH_CONTEXT";
  }

  return "SEARCH";

}

function resolveCommand(input){

  refreshDependencies();

  const query =
  normalizeQuery(input);

  const center =
  inferCenter(query);

  const type =
  inferCommandType(query);

  const command = {

    id:
    [
      "CMD",
      Date.now(),
      Math.random().toString(36).slice(2,8)
    ].join("_"),

    module:
    MODULE_ID,

    batch:
    495,

    query:
    query,

    tokens:
    tokenize(query),

    type:
    type,

    center:
    center,

    confidence:
    center || type !== "SEARCH"
      ? "HIGH"
      : "LOW",

    timestamp:
    new Date().toISOString()

  };

  state.lastQuery =
  query;

  state.lastCommand =
  clone(command);

  state.resolvedCommands.push(clone(command));

  if(state.resolvedCommands.length > 150){
    state.resolvedCommands.shift();
  }

  emit(
    "COMMAND_RESOLVED",
    command
  );

  return clone(command);

}

function rememberCommand(command,result){

  const record = {

    command:
    clone(command),

    result:
    clone(result),

    timestamp:
    new Date().toISOString()

  };

  state.commandHistory.push(record);

  if(state.commandHistory.length > 150){
    state.commandHistory.shift();
  }

  return record;

}

function rememberSearch(query,results){

  const record = {

    query:
    query,

    results:
    clone(results || []),

    resultCount:
    Array.isArray(results) ? results.length : 0,

    timestamp:
    new Date().toISOString()

  };

  state.searchHistory.push(record);

  if(state.searchHistory.length > 150){
    state.searchHistory.shift();
  }

  return record;

}

function search(query){

  refreshDependencies();

  const normalized =
  normalizeQuery(query);

  const contextSwitching =
  getContextSwitching();

  const operatorFlow =
  getOperatorFlow();

  const persistence =
  getPersistence();

  const results = [];

  if(contextSwitching && typeof contextSwitching.getState === "function"){

    const contextState =
    contextSwitching.getState();

    results.push({
      type:
      "CONTEXT_STATE",

      title:
      "Current Context",

      value:
      contextState.activeContext || null,

      data:
      contextState
    });

  }

  if(operatorFlow && typeof operatorFlow.getState === "function"){

    const flowState =
    operatorFlow.getState();

    results.push({
      type:
      "OPERATOR_FLOW_STATE",

      title:
      "Operator Flow",

      value:
      flowState.activeCenter || null,

      data:
      flowState
    });

  }

  if(persistence && typeof persistence.getState === "function"){

    const persistenceState =
    persistence.getState();

    results.push({
      type:
      "PERSISTENCE_STATE",

      title:
      "Workspace Persistence",

      value:
      persistenceState.hasSnapshot,

      data:
      persistenceState
    });

  }

  const inferredCenter =
  inferCenter(normalized);

  if(inferredCenter){

    results.unshift({
      type:
      "CENTER_MATCH",

      title:
      inferredCenter,

      value:
      inferredCenter,

      action:
      {
        type:
        "SWITCH_CONTEXT",

        center:
        inferredCenter
      }
    });

  }

  const record =
  rememberSearch(
    normalized,
    results
  );

  emit(
    "SEARCH_COMPLETED",
    {
      query:
      normalized,

      resultCount:
      results.length,

      record:
      record
    }
  );

  return clone(results);

}

function executeCommand(input){

  const command =
  typeof input === "string"
    ? resolveCommand(input)
    : input;

  let result = {
    ok:
    false,

    reason:
    "UNHANDLED_COMMAND"
  };

  const contextSwitching =
  getContextSwitching();

  const operatorFlow =
  getOperatorFlow();

  const persistence =
  getPersistence();

  if(command.type === "SWITCH_CONTEXT"){

    if(
      command.center &&
      contextSwitching &&
      typeof contextSwitching.switchContext === "function"
    ){

      const switched =
      contextSwitching.switchContext(
        command.center,
        "UNIFIED_COMMAND"
      );

      result = {
        ok:
        !!switched,

        type:
        command.type,

        center:
        command.center,

        switched:
        !!switched
      };

    }else{

      result = {
        ok:
        false,

        type:
        command.type,

        reason:
        "CONTEXT_SWITCHING_UNAVAILABLE_OR_CENTER_MISSING"
      };

    }

  }else if(command.type === "SAVE_WORKSPACE"){

    if(
      persistence &&
      typeof persistence.saveWorkspace === "function"
    ){

      const saved =
      persistence.saveWorkspace(
        "UNIFIED_COMMAND_SAVE"
      );

      result = {
        ok:
        !!saved,

        type:
        command.type,

        saved:
        !!saved
      };

    }else{

      result = {
        ok:
        false,

        type:
        command.type,

        reason:
        "PERSISTENCE_UNAVAILABLE"
      };

    }

  }else if(command.type === "RESTORE_WORKSPACE"){

    if(
      persistence &&
      typeof persistence.restoreWorkspace === "function"
    ){

      const restored =
      persistence.restoreWorkspace();

      result = {
        ok:
        !!restored,

        type:
        command.type,

        restored:
        !!restored
      };

    }else{

      result = {
        ok:
        false,

        type:
        command.type,

        reason:
        "PERSISTENCE_UNAVAILABLE"
      };

    }

  }else if(command.type === "INSPECT_CONTEXT"){

    if(
      command.center &&
      operatorFlow &&
      typeof operatorFlow.inspectRoute === "function"
    ){

      const inspected =
      operatorFlow.inspectRoute(command.center);

      result = {
        ok:
        !!inspected,

        type:
        command.type,

        center:
        command.center,

        inspected:
        !!inspected
      };

    }else{

      const results =
      search(command.query);

      result = {
        ok:
        true,

        type:
        command.type,

        inspected:
        false,

        searchFallback:
        true,

        resultCount:
        results.length
      };

    }

  }else if(command.type === "SEARCH"){

    const results =
    search(command.query);

    result = {
      ok:
      true,

      type:
      command.type,

      resultCount:
      results.length,

      results:
      results
    };

  }

  const handler =
  state.registeredCommands[command.type];

  if(
    !result.ok &&
    typeof handler === "function"
  ){

    try{

      const handled =
      handler(
        clone(command),
        {
          search,
          resolveCommand,
          executeCommand,
          getState
        }
      );

      result = {
        ok:
        true,

        type:
        command.type,

        handledBy:
        "REGISTERED_COMMAND",

        value:
        handled || null
      };

    }catch(error){

      result = {
        ok:
        false,

        type:
        command.type,

        reason:
        "REGISTERED_COMMAND_ERROR",

        message:
        error && error.message
          ? error.message
          : String(error)
      };

    }

  }

  const record =
  rememberCommand(
    command,
    result
  );

  emit(
    result.ok
      ? "COMMAND_EXECUTED"
      : "COMMAND_REJECTED",
    {
      command:
      command,

      result:
      result,

      record:
      record
    }
  );

  window.dispatchEvent(
    new CustomEvent(
      "umbra:command-executed",
      {
        detail:
        {
          command:
          command,

          result:
          result,

          record:
          record
        }
      }
    )
  );

  return clone(result);

}

function command(input){
  return executeCommand(input);
}

function registerCommand(type,handler){

  if(
    !type ||
    typeof handler !== "function"
  ){
    return false;
  }

  state.registeredCommands[type] =
  handler;

  emit(
    "COMMAND_HANDLER_REGISTERED",
    {
      type
    }
  );

  return true;

}

function unregisterCommand(type){

  if(!type){
    return false;
  }

  if(state.registeredCommands[type]){

    delete state.registeredCommands[type];

    emit(
      "COMMAND_HANDLER_UNREGISTERED",
      {
        type
      }
    );

    return true;

  }

  return false;

}

function getCommandHistory(){
  return clone(state.commandHistory);
}

function getSearchHistory(){
  return clone(state.searchHistory);
}

function getResolvedCommands(){
  return clone(state.resolvedCommands);
}

function getRegisteredCommands(){
  return Object.keys(state.registeredCommands);
}

function getState(){

  return clone({

    module:
    MODULE_ID,

    batch:
    495,

    status:
    state.status,

    mode:
    state.mode,

    contextSwitchingAvailable:
    state.contextSwitchingAvailable,

    operatorFlowAvailable:
    state.operatorFlowAvailable,

    persistenceAvailable:
    state.persistenceAvailable,

    lastQuery:
    state.lastQuery,

    lastCommand:
    state.lastCommand,

    commandHistory:
    state.commandHistory,

    commandHistoryCount:
    state.commandHistory.length,

    searchHistory:
    state.searchHistory,

    searchHistoryCount:
    state.searchHistory.length,

    resolvedCommands:
    state.resolvedCommands,

    resolvedCommandCount:
    state.resolvedCommands.length,

    registeredCommands:
    getRegisteredCommands(),

    registeredCommandCount:
    getRegisteredCommands().length,

    events:
    state.events,

    createdAt:
    state.createdAt

  });

}

window.UmbraUnifiedSearchCommand = {

  id:
  MODULE_ID,

  batch:
  495,

  refreshDependencies,

  search,

  resolveCommand,

  executeCommand,

  command,

  registerCommand,

  unregisterCommand,

  getCommandHistory,

  getSearchHistory,

  getResolvedCommands,

  getRegisteredCommands,

  getState

};

refreshDependencies();

console.log(
  MODULE_ID,
  getState()
);

})();
