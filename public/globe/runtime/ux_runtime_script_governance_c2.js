(function(){

"use strict";

const MODULE_ID = "NEXUS_UX_RUNTIME_SCRIPT_GOVERNANCE_C2";

const state = {
  module: MODULE_ID,
  phase: "UX_C2",
  status: "ACTIVE",
  mode: "RUNTIME_SCRIPT_GOVERNANCE_AUDIT",
  lastAudit: null,
  history: [],
  createdAt: new Date().toISOString()
};

function clone(v){
  return JSON.parse(JSON.stringify(v));
}

function classifyScript(src){

  const name =
    (src || "").split("/").pop() || "inline";

  const lower =
    src.toLowerCase();

  const phaseMatch =
    lower.match(/phase\d+/);

  if(lower.includes("vendor")){
    return "VENDOR";
  }

  if(lower.includes("@vite")){
    return "DEV_RUNTIME";
  }

  if(lower.includes("/runtime/")){
    return "RUNTIME";
  }

  if(lower.includes("core.js") || lower.includes("scene.js")){
    return "CORE";
  }

  if(lower.includes("founder_dashboard_runtime")){
    return "FOUNDER_DASHBOARD";
  }

  if(lower.includes("command_deck_runtime")){
    return "COMMAND_DECK";
  }

  if(lower.includes("city_map") || lower.includes("city_")){
    return "CITY";
  }

  if(lower.includes("dossier")){
    return "DOSSIER";
  }

  if(lower.includes("intel") || lower.includes("intelligence") || lower.includes("scoring")){
    return "INTELLIGENCE";
  }

  if(lower.includes("phase8") || lower.includes("automation") || lower.includes("autonomous")){
    return "AUTOMATION";
  }

  if(lower.includes("phase7") || lower.includes("mission") || lower.includes("task") || lower.includes("watchlist")){
    return "OPERATIONS";
  }

  if(lower.includes("phase9") || lower.includes("governance") || lower.includes("continuity")){
    return "GOVERNANCE";
  }

  if(phaseMatch){
    return phaseMatch[0].toUpperCase();
  }

  return "UNCLASSIFIED";

}

function inferHubNeed(category,src){

  if(
    category === "VENDOR" ||
    category === "DEV_RUNTIME" ||
    category === "CORE" ||
    category === "RUNTIME"
  ){
    return "REQUIRED_FOR_BOOT";
  }

  if(
    category === "FOUNDER_DASHBOARD" ||
    category === "COMMAND_DECK" ||
    category === "CITY" ||
    category === "INTELLIGENCE"
  ){
    return "HUB_RELEVANT_REVIEW";
  }

  if(
    category === "DOSSIER" ||
    category === "OPERATIONS" ||
    category === "AUTOMATION" ||
    category === "GOVERNANCE"
  ){
    return "WORKSPACE_SCOPED_CANDIDATE";
  }

  if(src.includes("phase")){
    return "LEGACY_PHASE_REVIEW";
  }

  return "UNKNOWN_REVIEW";

}

function auditScripts(){

  const scripts =
    Array.from(document.scripts)
      .map(function(script,index){

        const src =
          script.src || "";

        const category =
          classifyScript(src);

        const hubNeed =
          inferHubNeed(category,src);

        return {
          index,
          src,
          name:
            src.split("/").pop() || "inline",
          category,
          hubNeed,
          isUX:
            src.includes("ux_"),
          isRuntime:
            src.includes("/runtime/"),
          isPhase:
            /phase\d+/i.test(src),
          async:
            !!script.async,
          defer:
            !!script.defer
        };

      });

  const summary =
    scripts.reduce(function(acc,item){

      acc.byCategory[item.category] =
        acc.byCategory[item.category] || 0;

      acc.byCategory[item.category] += 1;

      acc.byHubNeed[item.hubNeed] =
        acc.byHubNeed[item.hubNeed] || 0;

      acc.byHubNeed[item.hubNeed] += 1;

      if(item.isPhase){
        acc.phaseScriptCount += 1;
      }

      if(item.isRuntime){
        acc.runtimeScriptCount += 1;
      }

      if(item.isUX){
        acc.uxScriptCount += 1;
      }

      return acc;

    },{
      totalScripts:
      scripts.length,

      phaseScriptCount:
      0,

      runtimeScriptCount:
      0,

      uxScriptCount:
      0,

      byCategory:
      {},

      byHubNeed:
      {}
    });

  const candidates =
    scripts.filter(function(item){
      return (
        item.hubNeed === "WORKSPACE_SCOPED_CANDIDATE" ||
        item.hubNeed === "LEGACY_PHASE_REVIEW" ||
        item.hubNeed === "UNKNOWN_REVIEW"
      );
    });

  const report = {
    module: MODULE_ID,
    phase: "UX_C2",
    timestamp: new Date().toISOString(),
    summary,
    candidates,
    scripts,
    diagnosis: {
      tooManyScripts:
        summary.totalScripts > 120,
      phaseScriptsDominant:
        summary.phaseScriptCount > 40,
      uxScriptsLoaded:
        summary.uxScriptCount > 0,
      needsGovernance:
        summary.totalScripts > 120 ||
        summary.phaseScriptCount > 40
    }
  };

  state.lastAudit =
    clone(report);

  state.history.push(
    clone(report)
  );

  if(state.history.length > 20){
    state.history.shift();
  }

  console.group("NEXUS UX RUNTIME SCRIPT GOVERNANCE C2");
  console.log("Summary:", report.summary);
  console.log("Diagnosis:", report.diagnosis);
  console.table(candidates.slice(0,80));
  console.groupEnd();

  return clone(report);

}

function getState(){
  return clone({
    module: MODULE_ID,
    phase: "UX_C2",
    status: state.status,
    mode: state.mode,
    hasLastAudit: !!state.lastAudit,
    historyCount: state.history.length,
    lastDiagnosis:
      state.lastAudit
        ? state.lastAudit.diagnosis
        : null,
    createdAt: state.createdAt
  });
}

window.UmbraUXRuntimeScriptGovernanceC2 = {
  id: MODULE_ID,
  phase: "UX_C2",
  auditScripts,
  getState
};

console.log(MODULE_ID,getState());

})();
