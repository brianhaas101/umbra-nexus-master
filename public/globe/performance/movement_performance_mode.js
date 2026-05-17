(function () {
  "use strict";

  const G = window.UmbraMovementPerformance =
    window.UmbraMovementPerformance || {};

  let state = {
    enabled: true,
    interacting: false,
    idleRestoreMs: 650,
    restoreTimer: null,
    eventsBound: false,
    hardMovementMode: true,
    hiddenDuringMove: false,
    last_error: null
  };

  function getTargetGroup() {
    try {
      return window.BlackDragonBooksCityMapRenderer
        .getRenderedNodes()[0]?.parent || null;
    } catch (err) {
      return null;
    }
  }

  function getClusterGroup() {
    try {
      return window.BlackDragonBooksClusterRenderer
        .getRenderedClusters()[0]?.parent || null;
    } catch (err) {
      return null;
    }
  }

  function getPathGroup() {
    try {
      return window.BlackDragonBooksPathRenderer
        .getRenderedPaths()[0]?.parent || null;
    } catch (err) {
      return null;
    }
  }

  function setPostFX(value) {
    try {
      if (
        window.UmbraGlobe &&
        typeof window.UmbraGlobe.setPostFXEnabled === "function"
      ) {
        window.UmbraGlobe.setPostFXEnabled(!!value);
      }
    } catch (err) {}
  }

  function setMovingVisibility(isMoving) {
    const targetGroup = getTargetGroup();
    const clusterGroup = getClusterGroup();
    const pathGroup = getPathGroup();

    if (targetGroup) targetGroup.visible = !isMoving;
    if (clusterGroup) clusterGroup.visible = !isMoving;
    if (pathGroup) pathGroup.visible = !isMoving;

    setPostFX(!isMoving);

    state.hiddenDuringMove = !!isMoving;
  }

  function beginInteraction() {
    if (!state.enabled) return;

    state.interacting = true;

    if (state.restoreTimer) {
      clearTimeout(state.restoreTimer);
      state.restoreTimer = null;
    }

    setMovingVisibility(true);
  }

  function endInteractionSoon() {
    if (!state.enabled) return;

    if (state.restoreTimer) {
      clearTimeout(state.restoreTimer);
    }

    state.restoreTimer = setTimeout(() => {
      state.interacting = false;
      setMovingVisibility(false);
    }, state.idleRestoreMs);
  }

  function bindEvents() {
    if (state.eventsBound) return true;

    const target =
      document.querySelector("canvas") ||
      document.body;

    ["pointerdown", "mousedown", "touchstart", "wheel"].forEach(ev => {
      target.addEventListener(ev, beginInteraction, { passive: true });
    });

    ["pointermove", "mousemove", "touchmove"].forEach(ev => {
      target.addEventListener(ev, () => {
        if (state.interacting) {
          beginInteraction();
          endInteractionSoon();
        }
      }, { passive: true });
    });

    ["pointerup", "mouseup", "touchend", "mouseleave"].forEach(ev => {
      target.addEventListener(ev, endInteractionSoon, { passive: true });
    });

    window.addEventListener("blur", endInteractionSoon);

    state.eventsBound = true;

    return true;
  }

  function setEnabled(value) {
    state.enabled = !!value;

    if (!state.enabled) {
      setMovingVisibility(false);
    }

    return state.enabled;
  }

  function getDebugState() {
    const targetGroup = getTargetGroup();
    const clusterGroup = getClusterGroup();
    const pathGroup = getPathGroup();

    return {
      version: "umbra_movement_performance_v3_batch_053",
      enabled: state.enabled,
      interacting: state.interacting,
      events_bound: state.eventsBound,
      hard_movement_mode: state.hardMovementMode,
      idle_restore_ms: state.idleRestoreMs,
      hidden_during_move: state.hiddenDuringMove,
      target_visible: targetGroup ? targetGroup.visible : null,
      cluster_visible: clusterGroup ? clusterGroup.visible : null,
      path_visible: pathGroup ? pathGroup.visible : null,
      postfx_enabled: window.UmbraGlobe?.getPostFXDebug?.().enabled ?? null,
      last_error: state.last_error
    };
  }

  G.bindEvents = bindEvents;
  G.beginInteraction = beginInteraction;
  G.endInteractionSoon = endInteractionSoon;
  G.setEnabled = setEnabled;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(bindEvents, 2000);
  });

  if (document.readyState !== "loading") {
    setTimeout(bindEvents, 2000);
  }
})();
