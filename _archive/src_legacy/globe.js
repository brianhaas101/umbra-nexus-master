// UMBRA NEXUS — EMBER pass (molten grid + pulsing veins + atmosphere)
// Continents optional: add white-on-black landmask at assets/earth_mask_2048.jpg

const container = document.getElementById('globeContainer');
const debugBox = document.getElementById('debugMsg');

let scene, camera, renderer, globe, atmo, rafId;

const THEME = getComputedStyle(document.documentElement);
const COLOR_CORE = new THREE.Color(THEME.getPropertyValue('--heat-core').trim() || '#ff3c00');
const COLOR_GLOW = new THREE.Color(THEME.getPropertyValue('--heat-glow').trim() || '#ffb347');

// ---- Tunables (quick art direction) ----
const PARAMS = {
spin: 0.0022, // auto rotation
gridDensityLat: 18.0,
gridDensityLon: 24.0,
baseVein: 0.85, // base intensity for veins
baseGrid: 0.85, // base intensity for grid
pulseAmp: 0.45, // how strong pulses get
pulseSpeed: 0.85, // main pulse speed
microFlicker: 2.7, // subtle shimmer frequency
flarePeriod: 11.0, // seconds between soft flares
flareBoost: 0.35 // how much a flare adds
};

init();
animate();

function debug(msg){ if(debugBox) debugBox.textContent = msg; }

function init(){
scene = new THREE.Scene();

const aspect = container.clientWidth / container.clientHeight || 1;
camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 1000);
camera.position.set(0, 0, 6.2);

renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
resizeRenderer();
container.appendChild(renderer.domElement);

// Optional continents landmask
new THREE.TextureLoader().load(
'assets/earth_mask_2048.jpg',
(tex)=>{ tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; buildGlobe(tex); },
undefined,
()=>{ buildGlobe(null); }
);

// Atmosphere glow
const atmoGeo = new THREE.SphereGeometry(2.03, 96, 96);
const atmoMat = new THREE.ShaderMaterial({
transparent: true,
depthWrite: false,
blending: THREE.AdditiveBlending,
uniforms:{
uColor:{ value: COLOR_GLOW },
uStrength:{ value: 1.0 }
},
vertexShader:`
varying vec3 vNormal;
void main(){
vNormal = normalize(normalMatrix * normal);
gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`,
fragmentShader:`
varying vec3 vNormal;
uniform vec3 uColor;
uniform float uStrength;
void main(){
float rim = pow(1.0 - max(dot(vNormal, vec3(0.0,0.0,1.0)), 0.0), 2.2);
gl_FragColor = vec4(uColor, rim * 0.6 * uStrength);
}
`
});
atmo = new THREE.Mesh(atmoGeo, atmoMat);
scene.add(atmo);

// Lights (subtle)
const rim = new THREE.DirectionalLight(0xffffff, 0.55);
rim.position.set(-2, 1, 2);
scene.add(rim);
const key = new THREE.DirectionalLight(0xffffff, 0.22);
key.position.set(2, -1, -2);
scene.add(key);

// Drag rotate
let isDown = false, lastX = 0, lastY = 0;
container.addEventListener('pointerdown', e => { isDown = true; lastX=e.clientX; lastY=e.clientY; });
window.addEventListener('pointerup', ()=> isDown=false);
window.addEventListener('pointermove', e => {
if(!isDown) return;
const dx = (e.clientX - lastX)*0.005;
const dy = (e.clientY - lastY)*0.005;
globe.rotation.y += dx;
globe.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, globe.rotation.x + dy));
lastX = e.clientX; lastY=e.clientY;
}, { passive:true });

window.addEventListener('resize', resizeRenderer);
debug('EMBER initialized.');
}

function buildGlobe(landmask){
const geo = new THREE.SphereGeometry(2.0, 192, 192);

const mat = new THREE.ShaderMaterial({
transparent: false,
uniforms:{
uTime: { value: 0.0 },
uCore: { value: COLOR_CORE },
uGlow: { value: COLOR_GLOW },
uLandMask: { value: landmask },
uShowContinents: { value: landmask ? 1.0 : 0.0 },
uGridLat: { value: PARAMS.gridDensityLat },
uGridLon: { value: PARAMS.gridDensityLon },
uBaseVein: { value: PARAMS.baseVein },
uBaseGrid: { value: PARAMS.baseGrid },
uPulseAmp: { value: PARAMS.pulseAmp },
uPulseSpeed: { value: PARAMS.pulseSpeed },
uMicroFlicker: { value: PARAMS.microFlicker },
uFlarePeriod: { value: PARAMS.flarePeriod },
uFlareBoost: { value: PARAMS.flareBoost }
},
vertexShader: `
varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;
void main(){
vUv = uv;
vNormal = normalize(normalMatrix * normal);
vPos = position;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
fragmentShader: `
precision highp float;
varying vec3 vPos;
varying vec3 vNormal;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uCore;
uniform vec3 uGlow;
uniform sampler2D uLandMask;
uniform float uShowContinents;
uniform float uGridLat, uGridLon;
uniform float uBaseVein, uBaseGrid;
uniform float uPulseAmp, uPulseSpeed, uMicroFlicker;
uniform float uFlarePeriod, uFlareBoost;

// --- noise helpers (compact) ---
float hash(vec2 p){ p = fract(p*vec2(123.34,345.45)); p += dot(p, p+34.345); return fract(p.x*p.y); }
float n3(vec3 p){
vec3 i = floor(p); vec3 f = fract(p);
float n = dot(i, vec3(1.0,57.0,113.0));
vec3 u = f*f*(3.0-2.0*f);
float a = mix(hash(i.xy + vec2(0.0,0.0)+n), hash(i.xy + vec2(1.0,0.0)+n), u.x);
float b = mix(hash(i.xy + vec2(0.0,1.0)+n), hash(i.xy + vec2(1.0,1.0)+n), u.x);
float c = mix(a, b, u.y);
float d = mix(hash(i.zy + vec2(0.0,0.0)+n), hash(i.zy + vec2(1.0,0.0)+n), u.x);
float e = mix(hash(i.zy + vec2(0.0,1.0)+n), hash(i.zy + vec2(1.0,1.0)+n), u.x);
float fz = mix(d, e, u.y);
return mix(c, fz, u.z);
}

// veins
float veins(vec3 p){
float v = 0.0, amp = 1.0;
vec3 q = p;
for(int i=0;i<4;i++){
v += (0.5-abs(n3(q)-0.5)) * amp;
q = q*2.1 + vec3(0.17, -0.23, 0.31);
amp *= 0.55;
}
return smoothstep(0.55, 0.80, v);
}

// lat/lon grid
float grid(vec2 uv, float latBands, float lonBands){
float lon = uv.x * 6.28318530718 - 3.14159265;
float lat = uv.y * 3.14159265 - 1.5707963;
float gLat = abs(sin(lat * latBands));
float gLon = abs(sin(lon * lonBands));
float g = max(gLat, gLon);
return smoothstep(0.98, 0.995, g);
}

float land(vec2 uv){
if(uShowContinents < 0.5) return 0.0;
vec3 c = texture2D(uLandMask, vec2(1.0-uv.x, uv.y)).rgb; // flip X to align
return dot(c, vec3(0.3333));
}

void main(){
// base lighting
float ndl = clamp(dot(normalize(vNormal), normalize(vec3(-0.4, 0.3, 0.8))), 0.0, 1.0);
float core = pow(1.0 - ndl, 1.5);
vec3 baseCol = mix(vec3(0.015,0.02,0.025), uCore*0.55, core);

// time-driven pulses
float t = uTime;
float mainPulse = 0.5 + 0.5 * sin(t * uPulseSpeed);
float subPulse = 0.5 + 0.5 * sin(t * (uPulseSpeed*0.37) + 2.1);
float micro = 0.5 + 0.5 * sin(t * uMicroFlicker + vPos.y*3.0);
float pulse = 1.0 + uPulseAmp * (0.55*mainPulse + 0.3*subPulse + 0.15*micro);

// soft flare every ~uFlarePeriod seconds
float flarePhase = mod(t, uFlarePeriod) / uFlarePeriod; // 0..1
float flareCurve = smoothstep(0.86, 1.0, flarePhase); // rises at the end
float flare = 1.0 + uFlareBoost * flareCurve;

// grid + veins
float g = grid(vUv, uGridLat, uGridLon);
float v = veins(normalize(vPos)*1.2 + vec3(0.0, t*0.03, 0.0));

vec3 gridCol = uCore * (uBaseGrid * pulse * flare) * mix(0.45, 0.95, core);
vec3 veinCol = uGlow * (uBaseVein * pulse * flare) * (0.35 + 0.65*core);

// continents glow
float landMask = land(vUv);
vec3 landCol = mix(vec3(0.0), uCore*0.85, smoothstep(0.2, 0.8, landMask)) * (0.9 * pulse);

vec3 col = baseCol;
col += gridCol * g * 0.95;
col += veinCol * v * 0.9;
col += landCol;

// ember rim
float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0,0.0,1.0)), 0.0), 3.0);
col += uGlow * rim * 0.42;

gl_FragColor = vec4(col, 1.0);
}
`
});

globe = new THREE.Mesh(geo, mat);
scene.add(globe);
}

function resizeRenderer(){
const w = container.clientWidth || window.innerWidth;
const h = container.clientHeight || window.innerHeight;
renderer.setSize(w, h, false);
camera.aspect = w/h; camera.updateProjectionMatrix();
}

function animate(){
rafId = requestAnimationFrame(animate);
if(globe && globe.material && globe.material.uniforms){
globe.material.uniforms.uTime.value += 1.0/60.0;
}
if(globe){ globe.rotation.y += PARAMS.spin; }
renderer.render(scene, camera);
}