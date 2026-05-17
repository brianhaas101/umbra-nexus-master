/* =======================================
   Umbra Nexus — Heatmap Renderer v3
   Goal: subtle ember veins under UI
   ======================================= */

const canvas = document.getElementById("heatmap-canvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

/*
 We keep a set of "anchor zones" so we always have visible structure,
 and then add soft drift zones around them for motion.
*/

function makeZone(x, y, rx, ry, intensity) {
  return {
    x,
    y,
    radiusX: rx,
    radiusY: ry,
    intensity,
    driftX: (Math.random() - 0.5) * 0.02, // very slow drift
    driftY: (Math.random() - 0.5) * 0.02,
    wobbleSeed: Math.random() * 10000
  };
}

// anchored zones (guaranteed placement so UI doesn't look empty)
const zones = [
  makeZone(width * 0.35, height * 0.4, 220, 120, 0.35),
  makeZone(width * 0.6,  height * 0.45, 260, 150, 0.4),
  makeZone(width * 0.5,  height * 0.7,  180, 90,  0.28),
  makeZone(width * 0.2,  height * 0.25, 140, 70,  0.22),
];

// filler zones (ambient drift, lower intensity)
for (let i = 0; i < 14; i++) {
  zones.push(
    makeZone(
      Math.random() * width,
      Math.random() * height,
      120 + Math.random() * 200,
      60 + Math.random() * 140,
      0.15 + Math.random() * 0.2
    )
  );
}

/*
 Drawing logic:
 - not circles, but stretched embers
 - dark molten center, soft gold bleed edge
 - NO hard rings, no blinking
*/
function drawZone(z, t) {
  // subtle wobble so it's alive, not static
  const wobble = Math.sin(t * 0.00012 + z.wobbleSeed) * 0.05;
  const rx = z.radiusX * (1 + wobble);
  const ry = z.radiusY * (1 - wobble * 0.4);

  // multi-stop gradient that feels like ember core bleeding outwards
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0.0, `rgba(60,15,0,${z.intensity * 1.2})`);    // very dark core
  grad.addColorStop(0.3, `rgba(160,60,10,${z.intensity * 0.6})`);  // warm inner ember
  grad.addColorStop(0.6, `rgba(255,140,40,${z.intensity * 0.25})`);// golden bleed
  grad.addColorStop(1.0, `rgba(255,180,70,0)`);                    // fade to nothing

  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.scale(rx / ry, 1); // stretch to create that "vein / plume" look
  ctx.beginPath();
  ctx.arc(0, 0, ry, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();
}

/*
 Frame render:
 - deep blue background wash
 - faint cyan overlay to tie into Umbra's cool palette
 - then layer ember zones
*/
function render() {
  const t = Date.now();

  // deep radial base
  const bg = ctx.createRadialGradient(
    width * 0.5, height * 0.45, width * 0.1,
    width * 0.5, height * 0.45, width * 0.9
  );
  bg.addColorStop(0, "#050a18");
  bg.addColorStop(1, "#000000");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // cool wash so it still feels Umbra / Forerunner, not just fire
  ctx.fillStyle = "rgba(0,60,120,0.18)";
  ctx.fillRect(0, 0, width, height);

  // draw each zone
  zones.forEach(z => {
    drawZone(z, t);

    // slow drift
    z.x += z.driftX;
    z.y += z.driftY;

    // wrap so they never "stick" half offscreen like a crescent
    if (z.x < -300) z.x = width + 300;
    if (z.x > width + 300) z.x = -300;
    if (z.y < -300) z.y = height + 300;
    if (z.y > height + 300) z.y = -300;
  });

  requestAnimationFrame(render);
}
render();

/* Keep canvas responsive */
window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});