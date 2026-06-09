(function(){

"use strict";

const MODULE_ID = "NEXUS_HOME_WORKSPACE_MOUNT_D4C";

const state = {
  module: MODULE_ID,
  phase: "UX_D4C",
  status: "ACTIVE",
  mode: "HOME_WORKSPACE_MOUNT_ZONE",
  mounted: false,
  mountId: "umbra-home-workspace",
  createdAt: new Date().toISOString()
};

function clone(value){
  return JSON.parse(JSON.stringify(value));
}

function ensureMount(){

  let mount =
    document.getElementById(state.mountId);

  if(mount){
    state.mounted = true;
    return mount;
  }

  const centerStage =
    document.getElementById("centerStage");

  if(!centerStage){
    return null;
  }

  mount =
    document.createElement("section");

  mount.id =
    state.mountId;

  mount.className =
    "umbra-home-workspace d4c-home-workspace";

  mount.innerHTML =
    '<article class="home-workspace-card" data-home-panel="reviewQueue">' +
      '<div class="home-card-kicker">REVIEW QUEUE</div>' +
      '<div class="home-card-title">Priority Review</div>' +
      '<div class="home-card-line">No urgent review blockers</div>' +
    '</article>' +

    '<article class="home-workspace-card" data-home-panel="recentActivity">' +
      '<div class="home-card-kicker">RECENT ACTIVITY</div>' +
      '<div class="home-card-title">Runtime Activity</div>' +
      '<div class="home-card-line">Executive surface mounted · Intelligence stable</div>' +
    '</article>' +

    '<article class="home-workspace-card" data-home-panel="topTargets">' +
      '<div class="home-card-kicker">TOP TARGETS</div>' +
      '<div class="home-card-title">Current Lead Cluster</div>' +
      '<div class="home-card-line">Luxury Auto Cluster · Score 43 · LOW</div>' +
    '</article>' +

    '<article class="home-workspace-card" data-home-panel="quickActions">' +
      '<div class="home-card-kicker">QUICK ACTIONS</div>' +
      '<div class="home-action-row">' +
        '<button type="button" data-action="openDossier">Open Dossier</button>' +
        '<button type="button" data-action="runReview">Run Review</button>' +
        '<button type="button" data-action="launchAnalysis">Launch Analysis</button>' +
      '</div>' +
    '</article>';

  centerStage.appendChild(mount);

  state.mounted = true;

  window.dispatchEvent(
    new CustomEvent(
      "umbra:home-workspace-mounted",
      {
        detail: clone(state)
      }
    )
  );

  return mount;

}

function bindActions(){

  const mount =
    ensureMount();

  if(!mount){
    return false;
  }

  mount.addEventListener("click",function(event){

    const button =
      event.target.closest("button[data-action]");

    if(!button){
      return;
    }

    const action =
      button.getAttribute("data-action");

    if(action === "openDossier"){
      window.UmbraContextSwitchingEngine?.switchContext?.("DOSSIER_CENTER");
      window.UmbraUnifiedSearchCommand?.command?.("open dossier");
    }

    if(action === "runReview"){
      window.UmbraOperatorFlowEngine?.dispatch?.("RUN_REVIEW");
    }

    if(action === "launchAnalysis"){
      window.UmbraContextSwitchingEngine?.switchContext?.("INTELLIGENCE_CENTER");
      window.UmbraUnifiedSearchCommand?.command?.("open intelligence");
    }

    window.dispatchEvent(
      new CustomEvent(
        "umbra:home-workspace-action",
        {
          detail: {
            action,
            timestamp: new Date().toISOString()
          }
        }
      )
    );

  },{ once:false });

  return true;

}

function refresh(){

  const mount =
    ensureMount();

  if(!mount){
    return {
      ok:false,
      reason:"CENTER_STAGE_NOT_FOUND"
    };
  }

  return {
    ok:true,
    mounted:true,
    mountId:state.mountId
  };

}

function getState(){
  return clone(state);
}

ensureMount();
bindActions();

window.UmbraHomeWorkspaceMountD4C = {
  id: MODULE_ID,
  phase: "UX_D4C",
  ensureMount,
  bindActions,
  refresh,
  getState
};

console.log(MODULE_ID,getState());

})();
