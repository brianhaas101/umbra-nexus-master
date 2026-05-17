// public/globe/umbra_logo.js
(function () {
  const ROOT_ID = "umbraLogoMount";

  function applyMountPlacement(mount) {
    if (!mount) return;

    mount.style.position = "absolute";
    mount.style.left = "50%";
    mount.style.top = "20px";
    mount.style.right = "auto";
    mount.style.bottom = "auto";
    mount.style.width = "28px";
    mount.style.height = "auto";
    mount.style.transform = "translateX(-50%)";
    mount.style.pointerEvents = "none";
    mount.style.zIndex = "60";
    mount.style.opacity = "0.82";
  }

  function createLogo() {
    const existing = document.getElementById(ROOT_ID);
    if (existing) {
      applyMountPlacement(existing);
      return;
    }

    const mount = document.createElement("div");
    mount.id = ROOT_ID;
    mount.className = "umbra-logo-shell";

    applyMountPlacement(mount);

    mount.innerHTML = `
      <svg class="umbra-logo umbra-logo-gold" viewBox="0 0 100 200" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="umbraAxisGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255, 120, 28, 0)" />
            <stop offset="42%" stop-color="rgba(255, 80, 28, 0.58)" />
            <stop offset="50%" stop-color="rgba(255, 226, 150, 1)" />
            <stop offset="58%" stop-color="rgba(255, 72, 22, 0.64)" />
            <stop offset="100%" stop-color="rgba(255, 120, 28, 0)" />
          </linearGradient>

          <radialGradient id="umbraCoreGradient" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stop-color="rgba(255, 248, 205, 1)" />
            <stop offset="28%" stop-color="rgba(255, 190, 86, 0.98)" />
            <stop offset="58%" stop-color="rgba(255, 72, 24, 0.78)" />
            <stop offset="100%" stop-color="rgba(255, 50, 18, 0)" />
          </radialGradient>

          <linearGradient id="umbraFrameGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="rgba(255, 230, 160, 0.92)" />
            <stop offset="38%" stop-color="rgba(255, 158, 54, 0.88)" />
            <stop offset="50%" stop-color="rgba(255, 245, 190, 1)" />
            <stop offset="68%" stop-color="rgba(255, 112, 32, 0.88)" />
            <stop offset="100%" stop-color="rgba(255, 205, 116, 0.92)" />
          </linearGradient>
        </defs>

        <path class="logo-frame logo-frame-shadow"
          d="M50 6 L88 100 L50 194 L12 100 Z"
        />

        <path class="logo-frame logo-frame-energy"
          d="M50 6 L88 100 L50 194 L12 100 Z"
        />

        <path class="logo-axis"
          d="M50 18 L50 182"
        />

        <path class="logo-core-diamond"
          d="M50 92 L58 100 L50 108 L42 100 Z"
        />

        <circle class="logo-core"
          cx="50" cy="100" r="4.2"
        />
      </svg>
    `;

    const center = document.querySelector(".top-center") || document.body;
    center.appendChild(mount);
  }

  function setState(state) {
    const el = document.querySelector(".umbra-logo");
    if (!el) return false;

    const safeState = ["idle", "active", "focus", "alert"].includes(state)
      ? state
      : "idle";

    el.dataset.state = safeState;
    return true;
  }

  function getState() {
    return document.querySelector(".umbra-logo")?.dataset?.state || null;
  }

  window.UmbraLogo = {
    init: createLogo,
    setState,
    getState
  };

  document.addEventListener("DOMContentLoaded", () => {
    createLogo();
    setState("idle");
  });
})();