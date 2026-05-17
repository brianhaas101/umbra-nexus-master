(function () {
  "use strict";

  const G = window.UmbraRenderStabilityProbe =
    window.UmbraRenderStabilityProbe || {};

  let state = {
    running: false,
    frames: 0,
    startedAt: 0,
    lastAt: 0,
    worstDelta: 0,
    over_20ms: 0,
    over_33ms: 0,
    over_50ms: 0,
    rafId: null
  };

  function tick(now) {
    if (!state.running) return;

    if (state.lastAt) {
      const delta = now - state.lastAt;

      state.worstDelta = Math.max(state.worstDelta, delta);

      if (delta > 20) state.over_20ms++;
      if (delta > 33) state.over_33ms++;
      if (delta > 50) state.over_50ms++;
    }

    state.lastAt = now;
    state.frames++;

    state.rafId = requestAnimationFrame(tick);
  }

  function start() {
    state.running = true;
    state.frames = 0;
    state.startedAt = performance.now();
    state.lastAt = 0;
    state.worstDelta = 0;
    state.over_20ms = 0;
    state.over_33ms = 0;
    state.over_50ms = 0;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
    }

    state.rafId = requestAnimationFrame(tick);

    return true;
  }

  function stop() {
    state.running = false;

    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }

    return getDebugState();
  }

  function getDebugState() {
    const elapsed = state.startedAt
      ? (performance.now() - state.startedAt)
      : 0;

    const fps = elapsed > 0
      ? Number(((state.frames / elapsed) * 1000).toFixed(1))
      : 0;

    return {
      version: "umbra_render_stability_probe_v1",
      running: state.running,
      frames: state.frames,
      elapsed_ms: Math.round(elapsed),
      estimated_fps: fps,
      worst_frame_delta_ms: Number(state.worstDelta.toFixed(2)),
      frames_over_20ms: state.over_20ms,
      frames_over_33ms: state.over_33ms,
      frames_over_50ms: state.over_50ms
    };
  }

  G.start = start;
  G.stop = stop;
  G.getDebugState = getDebugState;

  start();
})();
