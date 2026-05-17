(function () {
  "use strict";

  const G = window.UmbraPostFXResizeThrottle =
    window.UmbraPostFXResizeThrottle || {};

  let state = {
    installed: false,
    resizeCalls: 0,
    blockedCalls: 0,
    allowedCalls: 0,
    minIntervalMs: 250,
    lastResizeAt: 0,
    last_error: null
  };

  function install() {
    try {
      const U = window.UmbraGlobe;

      if (!U || typeof U.resizePostFX !== "function") {
        state.last_error = "UmbraGlobe.resizePostFX missing";
        return false;
      }

      if (U.__resizePostFXOriginal) {
        state.installed = true;
        return true;
      }

      U.__resizePostFXOriginal = U.resizePostFX;

      U.resizePostFX = function throttledResizePostFX() {
        state.resizeCalls++;

        const now = performance.now();

        if (now - state.lastResizeAt < state.minIntervalMs) {
          state.blockedCalls++;
          return false;
        }

        state.lastResizeAt = now;
        state.allowedCalls++;

        return U.__resizePostFXOriginal.apply(this, arguments);
      };

      state.installed = true;
      state.last_error = null;

      console.info("[UmbraPostFXResizeThrottle] installed", {
        minIntervalMs: state.minIntervalMs
      });

      return true;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      return false;
    }
  }

  function setIntervalMs(ms) {
    const n = Number(ms);

    if (Number.isFinite(n) && n >= 50) {
      state.minIntervalMs = n;
    }

    return state.minIntervalMs;
  }

  function getDebugState() {
    return {
      version: "umbra_postfx_resize_throttle_v1",
      installed: state.installed,
      resize_calls: state.resizeCalls,
      allowed_calls: state.allowedCalls,
      blocked_calls: state.blockedCalls,
      min_interval_ms: state.minIntervalMs,
      last_error: state.last_error
    };
  }

  G.install = install;
  G.setIntervalMs = setIntervalMs;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(install, 1200);
  });

  if (document.readyState !== "loading") {
    setTimeout(install, 1200);
  }
})();
