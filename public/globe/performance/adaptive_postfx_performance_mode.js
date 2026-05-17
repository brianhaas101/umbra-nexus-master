(function () {
  "use strict";

  const G = window.UmbraPerformanceMode =
    window.UmbraPerformanceMode || {};

  let state = {
    enabled: true,
    interacting: false,
    restoreTimer: null,
    lastPostFXState: null,
    idleRestoreMs: 850,
    eventsBound: false,
    last_error: null
  };

  function getUmbra() {
    return window.UmbraGlobe || null;
  }

  function getPostFXEnabled() {
    try {
      const U = getUmbra();

      if (
        U &&
        typeof U.getPostFXDebug === "function"
      ) {
        return !!U.getPostFXDebug().enabled;
      }
    } catch (err) {}

    return null;
  }

  function setPostFX(value) {
    try {
      const U = getUmbra();

      if (
        U &&
        typeof U.setPostFXEnabled === "function"
      ) {
        U.setPostFXEnabled(!!value);
        return true;
      }
    } catch (err) {
      state.last_error =
        String(err && err.message ? err.message : err);
    }

    return false;
  }

  function beginInteraction() {
    if (!state.enabled) return;

    state.interacting = true;

    if (state.restoreTimer) {
      clearTimeout(state.restoreTimer);
      state.restoreTimer = null;
    }

    const current = getPostFXEnabled();

    if (state.lastPostFXState === null) {
      state.lastPostFXState = current;
    }

    if (current === true) {
      setPostFX(false);
    }
  }

  function endInteractionSoon() {
    if (!state.enabled) return;

    if (state.restoreTimer) {
      clearTimeout(state.restoreTimer);
    }

    state.restoreTimer = setTimeout(() => {
      state.interacting = false;

      if (state.lastPostFXState === true) {
        setPostFX(true);
      }

      state.lastPostFXState = null;
    }, state.idleRestoreMs);
  }

  function bindEvents() {
    if (state.eventsBound) return true;

    const target =
      document.querySelector("canvas") ||
      document.body;

    const startEvents = [
      "pointerdown",
      "mousedown",
      "touchstart",
      "wheel"
    ];

    const moveEvents = [
      "pointermove",
      "mousemove",
      "touchmove"
    ];

    const endEvents = [
      "pointerup",
      "mouseup",
      "touchend",
      "mouseleave"
    ];

    startEvents.forEach(ev => {
      target.addEventListener(ev, beginInteraction, {
        passive: true
      });
    });

    moveEvents.forEach(ev => {
      target.addEventListener(ev, () => {
        if (state.interacting) {
          beginInteraction();
          endInteractionSoon();
        }
      }, {
        passive: true
      });
    });

    endEvents.forEach(ev => {
      target.addEventListener(ev, endInteractionSoon, {
        passive: true
      });
    });

    window.addEventListener("blur", endInteractionSoon);

    state.eventsBound = true;

    return true;
  }

  function setEnabled(value) {
    state.enabled = !!value;

    if (!state.enabled && state.lastPostFXState === true) {
      setPostFX(true);
      state.lastPostFXState = null;
    }

    return state.enabled;
  }

  function getDebugState() {
    return {
      version: "umbra_adaptive_postfx_performance_mode_v1",
      enabled: state.enabled,
      interacting: state.interacting,
      events_bound: state.eventsBound,
      idle_restore_ms: state.idleRestoreMs,
      postfx_enabled_now: getPostFXEnabled(),
      last_postfx_state: state.lastPostFXState,
      last_error: state.last_error
    };
  }

  G.bindEvents = bindEvents;
  G.beginInteraction = beginInteraction;
  G.endInteractionSoon = endInteractionSoon;
  G.setEnabled = setEnabled;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(bindEvents, 1500);
  });

  if (document.readyState !== "loading") {
    setTimeout(bindEvents, 1500);
  }
})();
