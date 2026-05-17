/* =======================================
   Umbra Nexus — Main Script
   ======================================= */

/* ---- 1. Initialize system clock ---- */
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", { hour12: false });
  document.getElementById("system-time").textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

/* ---- 2. Startup message animation ---- */
const log = document.getElementById("system-log");
let bootStage = 0;
const bootLines = [
  "Initializing Systems...",
  "Establishing Neural Link...",
  "Calibrating Network Map...",
  "Monitoring Lead Feeds...",
  "System Online."
];

function bootSequence() {
  if (bootStage < bootLines.length) {
    log.textContent = bootLines[bootStage];
    bootStage++;
    setTimeout(bootSequence, 900);
  } else {
    log.textContent = "Umbra Nexus Active";
    document.getElementById("system-status").textContent = "API: OK | Cycle: ACTIVE";
  }
}
bootSequence();

/* ---- 3. Subtle panel glow animation ---- */
function panelPulse() {
  const panels = document.querySelectorAll(".glass-panel");
  panels.forEach((panel) => {
    const glow = Math.random() * 0.25 + 0.15;
    panel.style.boxShadow = `0 0 20px rgba(0,170,255,${glow})`;
  });
}
setInterval(panelPulse, 1500);

/* ---- 4. Placeholder map fade-in ---- */
window.addEventListener("load", () => {
  const mapCanvas = document.getElementById("heatmap-canvas");
  mapCanvas.style.opacity = 0;
  setTimeout(() => {
    mapCanvas.style.transition = "opacity 2s ease";
    mapCanvas.style.opacity = 1;
  }, 400);
});

/* ---- 5. Global resize listener ---- */
window.addEventListener("resize", () => {
  // Future: re-render map based on canvas size.
});