/* =======================================
   Umbra Nexus — UI Panel Dynamics
   ======================================= */

/* ---- Simulated intel events ---- */
const intelFeed = document.getElementById("intel-feed");
const intelSamples = [
  "High-Value Owner Ping — Los Angeles, CA",
  "Exotic Lead Verified — Miami, FL",
  "Collector Garage Inquiry — Dallas, TX",
  "Fleet Contract Interest — Seattle, WA",
  "Shop Owner Matched — Eugene, OR",
  "Vehicle Acquisition Signal — Austin, TX",
  "Restoration Specialist Found — Denver, CO"
];

function addIntelItem() {
  const msg = intelSamples[Math.floor(Math.random() * intelSamples.length)];
  const li = document.createElement("li");
  li.textContent = msg;
  li.style.opacity = "0.2";
  li.style.transition = "opacity 1s ease, color 1s ease";

  intelFeed.prepend(li);
  setTimeout(() => {
    li.style.opacity = "1";
    li.style.color = "#d3af5a";  // gold highlight
  }, 50);

  // Fade older entries
  const children = intelFeed.querySelectorAll("li");
  children.forEach((item, idx) => {
    if (idx > 6) item.remove();
    else if (idx > 2) item.style.color = "#b8d8ff";
  });
}

/* ---- Activity cycle ---- */
setInterval(addIntelItem, 7000);
addIntelItem();

/* ---- Left panel hover sound simulation (visual only) ---- */
const loadoutList = document.getElementById("loadouts-list");
loadoutList.querySelectorAll("li").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    item.style.color = "#d3af5a";
    item.style.textShadow = "0 0 6px rgba(211,175,90,0.6)";
  });
  item.addEventListener("mouseleave", () => {
    item.style.color = "";
    item.style.textShadow = "";
  });
});

/* ---- Future hooks ----
   • Replace intelSamples with live data from enrichment engine
   • Emit events: window.dispatchEvent(new CustomEvent('intelUpdate', {...}))
   • Sync left-panel loadout clicks to map focus via heatmap.js
-------------------------------------------- */