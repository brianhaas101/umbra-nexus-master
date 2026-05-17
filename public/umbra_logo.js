// public/globe/umbra_logo.js
(function () {
  const ROOT_ID = "umbraLogoMount";

  function createLogo() {
    if (document.getElementById(ROOT_ID)) return;

    const mount = document.createElement("div");
    mount.id = ROOT_ID;
    mount.className = "umbra-logo-shell";

    mount.innerHTML = `
      <svg class="umbra-logo" viewBox="0 0 100 200">

        <!-- OUTER SHELL -->
        <path class="logo-shell"
          d="M50 5 Q90 100 50 195 Q10 100 50 5 Z"
        />

        <!-- ENERGY CHANNEL -->
        <rect class="logo-channel"
          x="48" y="20" width="4" height="160" rx="2"
        />

        <!-- CORE -->
        <ellipse class="logo-core"
          cx="50" cy="100" rx="6" ry="14"
        />

        <defs>
          <linearGradient id="umbraChannelGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(255,180,92,0)" />
            <stop offset="50%" stop-color="rgba(255,180,92,1)" />
            <stop offset="100%" stop-color="rgba(255,180,92,0)" />
          </linearGradient>
        </defs>

      </svg>
    `;

    document.body.appendChild(mount);
  }

  function setState(state) {
    const el = document.querySelector(".umbra-logo");
    if (!el) return;

    el.dataset.state = state;

    switch (state) {
      case "idle":
        el.style.opacity = "0.65";
        el.style.transform = "scale(1)";
        break;

      case "active":
        el.style.opacity = "1";
        el.style.transform = "scale(1)";
        break;

      case "focus":
        el.style.opacity = "1";
        el.style.transform = "scale(1.08)";
        break;

      case "alert":
        el.style.opacity = "1";
        el.style.transform = "scale(1.12)";
        el.style.filter = "drop-shadow(0 0 14px rgba(255,100,60,0.8))";
        break;
    }
  }

  window.UmbraLogo = {
    init: createLogo,
    setState
  };

  document.addEventListener("DOMContentLoaded", () => {
    createLogo();
    setState("idle");
  });

})();