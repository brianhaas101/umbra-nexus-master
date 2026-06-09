(function(){

"use strict";

const MODULE_ID = "NEXUS_BASELINE_RUNTIME_LAYOUT_COMPOSITOR_D5D";

const state = {
  module: MODULE_ID,
  phase: "UX_D5D",
  status: "ACTIVE",
  mode: "BASELINE_RUNTIME_LAYOUT_COMPOSITOR",
  applied: 0,
  createdAt: new Date().toISOString()
};

function set(el, prop, value){
  if(!el) return;
  el.style.setProperty(prop,value,"important");
}

function place(){

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const leftNav = document.getElementById("leftNav");
  const center = document.getElementById("centerStage");
  const globe = document.getElementById("globeContainer");
  const exec = document.getElementById("executiveSurfaceV6");
  const workspace = document.getElementById("umbra-home-workspace");
  const right = document.getElementById("rightIntel");
  const dock = document.getElementById("umbra-unified-navigation-ui-488");
  const top = document.querySelector(".top-bar");
  const topCenter = document.querySelector(".top-center");

  const leftW = 220;
  const rightW = 300;
  const gap = 24;
  const headerH = 78;
  const dockH = 78;

  const centerLeft = leftW + gap + 18;
  const centerRight = rightW + gap + 18;
  const centerW = vw - centerLeft - centerRight;

  document.body.setAttribute("data-umbra-center","HOME_CENTER");

  set(document.body,"overflow","hidden");

  set(top,"position","fixed");
  set(top,"top","0px");
  set(top,"left","0px");
  set(top,"right","0px");
  set(top,"height",headerH + "px");
  set(top,"z-index","200");

  set(topCenter,"position","fixed");
  set(topCenter,"top","26px");
  set(topCenter,"left","50%");
  set(topCenter,"transform","translateX(-50%)");
  set(topCenter,"z-index","220");

  set(leftNav,"position","fixed");
  set(leftNav,"left","18px");
  set(leftNav,"top","92px");
  set(leftNav,"width",leftW + "px");
  set(leftNav,"height",(vh - 118) + "px");
  set(leftNav,"z-index","90");
  set(leftNav,"overflow","hidden");

  set(right,"position","fixed");
  set(right,"right","18px");
  set(right,"top","92px");
  set(right,"width",rightW + "px");
  set(right,"height",(vh - 118) + "px");
  set(right,"z-index","90");
  set(right,"overflow","hidden");

  set(center,"position","fixed");
  set(center,"left",centerLeft + "px");
  set(center,"top","92px");
  set(center,"width",centerW + "px");
  set(center,"height",(vh - 250) + "px");
  set(center,"right","auto");
  set(center,"bottom","auto");
  set(center,"z-index","50");
  set(center,"overflow","hidden");

  set(globe,"position","absolute");
  set(globe,"top","-12px");
  set(globe,"left","50%");
  set(globe,"width","520px");
  set(globe,"height","520px");
  set(globe,"min-width","520px");
  set(globe,"min-height","520px");
  set(globe,"max-width","520px");
  set(globe,"max-height","520px");
  set(globe,"transform","translateX(-50%) scale(0.88)");
  set(globe,"transform-origin","center center");
  set(globe,"z-index","10");

  set(exec,"position","fixed");
  set(exec,"left",(centerLeft + 18) + "px");
  set(exec,"top","390px");
  set(exec,"width","410px");
  set(exec,"height","220px");
  set(exec,"max-width","410px");
  set(exec,"max-height","220px");
  set(exec,"z-index","80");

  set(workspace,"position","fixed");
  set(workspace,"left",centerLeft + "px");
  set(workspace,"right",centerRight + "px");
  set(workspace,"bottom","108px");
  set(workspace,"width","auto");
  set(workspace,"height","150px");
  set(workspace,"display","grid");
  set(workspace,"grid-template-columns","1fr 1fr 1.15fr 1.15fr");
  set(workspace,"gap","12px");
  set(workspace,"z-index","85");

  set(dock,"position","fixed");
  set(dock,"left",(centerLeft + 40) + "px");
  set(dock,"right",(centerRight + 40) + "px");
  set(dock,"bottom","20px");
  set(dock,"top","auto");
  set(dock,"width","auto");
  set(dock,"height",dockH + "px");
  set(dock,"z-index","160");

  state.applied += 1;

  return {
    ok:true,
    applied:state.applied,
    viewport:{ width:vw, height:vh },
    center:{ left:centerLeft, width:centerW, right:centerRight }
  };

}

function getState(){
  return JSON.parse(JSON.stringify(state));
}

window.UmbraBaselineRuntimeLayoutCompositorD5D = {
  id: MODULE_ID,
  phase: "UX_D5D",
  place,
  getState
};

place();

window.addEventListener("resize",place);

setTimeout(place,250);
setTimeout(place,750);
setTimeout(place,1500);

console.log(MODULE_ID,getState());

})();
