// public/globe/shader_veins.js
(function () {
  const G = window.UmbraGlobe;
  if (!G || !window.THREE) {
    console.error("[shader_veins] UmbraGlobe or THREE missing.");
    return;
  }

  console.log("[SIGNATURE] globe/shader_veins.js LOADED", new Date().toISOString());

  G.makeVeinMaterial = function makeVeinMaterial(opts) {
    const o = (opts && typeof opts === "object") ? opts : {};

    const uniforms = {
      time: { value: 0.0 },

      veinColor: { value: new THREE.Color(o.veinColor ?? 0x4b7cff) },
      intensity: { value: Number.isFinite(o.intensity) ? o.intensity : 0.72 },
      pulseStrength: { value: Number.isFinite(o.pulseStrength) ? o.pulseStrength : 0.28 },
      pulseSpeed: { value: Number.isFinite(o.pulseSpeed) ? o.pulseSpeed : 1.05 },

      flowSpeedA: { value: Number.isFinite(o.flowSpeedA) ? o.flowSpeedA : 0.16 },
      flowSpeedB: { value: Number.isFinite(o.flowSpeedB) ? o.flowSpeedB : 0.08 },
      veinScale: { value: Number.isFinite(o.veinScale) ? o.veinScale : 5.25 },
      detailScale: { value: Number.isFinite(o.detailScale) ? o.detailScale : 18.0 },

      bandSoftness: { value: Number.isFinite(o.bandSoftness) ? o.bandSoftness : 0.65 },
      edgeBoost: { value: Number.isFinite(o.edgeBoost) ? o.edgeBoost : 0.55 },

      alphaFloor: { value: Number.isFinite(o.alphaFloor) ? o.alphaFloor : 0.01 },
    };

    const vertexShader = `
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(normalMatrix * normal);

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);

        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform float time;
      uniform vec3 veinColor;
      uniform float intensity;
      uniform float pulseStrength;
      uniform float pulseSpeed;
      uniform float flowSpeedA;
      uniform float flowSpeedB;
      uniform float veinScale;
      uniform float detailScale;
      uniform float bandSoftness;
      uniform float edgeBoost;
      uniform float alphaFloor;

      varying vec3 vWorldPos;
      varying vec3 vNormal;
      varying vec3 vViewDir;

      float hash(vec3 p) {
        p = vec3(
          dot(p, vec3(127.1, 311.7, 74.7)),
          dot(p, vec3(269.5, 183.3, 246.1)),
          dot(p, vec3(113.5, 271.9, 124.6))
        );
        return fract(sin(p.x + p.y + p.z) * 43758.5453123);
      }

      float valueNoise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, u.x);
        float nx10 = mix(n010, n110, u.x);
        float nx01 = mix(n001, n101, u.x);
        float nx11 = mix(n011, n111, u.x);

        float nxy0 = mix(nx00, nx10, u.y);
        float nxy1 = mix(nx01, nx11, u.y);

        return mix(nxy0, nxy1, u.z);
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * valueNoise(p);
          p *= 2.15;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 dir = normalize(vWorldPos);
        vec3 nrm = normalize(vNormal);
        vec3 vdir = normalize(vViewDir);

        vec3 flowA = vec3(0.0, time * flowSpeedA, time * flowSpeedB);
        vec3 flowB = vec3(time * 0.03, 0.0, -time * 0.02);

        vec3 p = dir * veinScale + flowA;
        float n1 = fbm(p);
        float n2 = fbm(dir * (veinScale * 1.85) + flowB);

        float ridge = 1.0 - abs(2.0 * n1 - 1.0);
        float veins = smoothstep(0.88, 0.985, ridge);
        veins = pow(veins, 3.5);

        float detail = valueNoise(dir * detailScale + vec3(0.0, time * 0.05, 0.0));
        float detailMask = smoothstep(0.36, 0.88, detail);
        veins *= detailMask;

        veins *= smoothstep(0.22, 0.92, n2);

        float lat = dir.y;
        float bandCore = 1.0 - smoothstep(0.58, 1.0, abs(lat));
        float bandWide = smoothstep(-0.95, 0.95, lat + 0.95);
        float band = mix(1.0, bandCore * bandWide, bandSoftness);
        veins *= band;

        float fresnel = pow(1.0 - max(dot(nrm, vdir), 0.0), 2.15);

        float pulse = 0.5 + 0.5 * sin(time * pulseSpeed + lat * 6.0 + n1 * 8.0);

        float surfaceGlow = veins * intensity * (0.78 + pulseStrength * pulse);
        float edgeGlow = fresnel * edgeBoost * intensity * 0.42;

        float glow = surfaceGlow + edgeGlow;
        if (glow < alphaFloor) discard;

        vec3 edgeTint = mix(veinColor, vec3(0.82, 0.9, 1.0), clamp(fresnel * 0.55, 0.0, 1.0));
        vec3 color = mix(veinColor, edgeTint, clamp(edgeGlow, 0.0, 1.0));

        float alpha = clamp(glow, 0.0, 0.78);
        vec3 finalColor = color * glow;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    });
  };

  G.makeEdgeGlowMaterial = function makeEdgeGlowMaterial(opts) {
    const o = (opts && typeof opts === "object") ? opts : {};

    const uniforms = {
      glowColor: { value: new THREE.Color(o.glowColor ?? 0xff8a2a) },
      hotColor: { value: new THREE.Color(0xffc166) },

      intensity: { value: Number.isFinite(o.intensity) ? o.intensity : 0.92 },

      rimPower: { value: 2.9 },
      rimStrength: { value: 1.0 },

      wrapStrength: { value: 0.62 },
      wrapFalloff: { value: 1.05 },
      wrapWidth: { value: 0.68 },

      hotspotStrength: { value: 0.18 },
      hotspotTightness: { value: 7.5 },

      opacity: { value: Number.isFinite(o.opacity) ? o.opacity : 0.62 },

      lightDir: { value: new THREE.Vector3(-1.0, 0.18, 0.42).normalize() }
    };

    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform vec3 glowColor;
      uniform vec3 hotColor;

      uniform float intensity;

      uniform float rimPower;
      uniform float rimStrength;

      uniform float wrapStrength;
      uniform float wrapFalloff;
      uniform float wrapWidth;

      uniform float hotspotStrength;
      uniform float hotspotTightness;

      uniform float opacity;

      uniform vec3 lightDir;

      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vViewDir);
        vec3 l = normalize(lightDir);

        float facing = clamp(dot(n, v), 0.0, 1.0);
        float fresnel = 1.0 - facing;

        float rim = pow(fresnel, rimPower) * rimStrength;

        float lightFactor = clamp(dot(n, l), 0.0, 1.0);
        float wrapBand = smoothstep(0.0, wrapWidth, fresnel);
        float wrap = pow(lightFactor, wrapFalloff) * wrapBand * wrapStrength;

        float hotspot = pow(lightFactor, hotspotTightness);
        hotspot *= pow(fresnel, 1.6) * hotspotStrength;

        float glow = rim + wrap + hotspot;
        glow *= intensity;

        vec3 color = mix(glowColor, hotColor, clamp(hotspot * 3.0 + wrap * 0.55, 0.0, 1.0));

        float alpha = clamp(glow * opacity, 0.0, 1.0);
        vec3 finalColor = color * glow;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      toneMapped: false
    });
  };

  G.makeOuterHaloMaterial = function makeOuterHaloMaterial(opts) {
    const o = (opts && typeof opts === "object") ? opts : {};

    const uniforms = {
      glowColor: { value: new THREE.Color(o.glowColor ?? 0xff8a2a) },
      intensity: { value: Number.isFinite(o.intensity) ? o.intensity : 0.28 },
      power: { value: Number.isFinite(o.power) ? o.power : 0.72 },
      opacity: { value: Number.isFinite(o.opacity) ? o.opacity : 0.12 }
    };

    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform vec3 glowColor;
      uniform float intensity;
      uniform float power;
      uniform float opacity;

      varying vec3 vNormal;
      varying vec3 vViewDir;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vViewDir);

        float facing = clamp(dot(n, v), 0.0, 1.0);
        float f = 1.0 - facing;

        float broad = pow(f, power);
        float haze = pow(f, max(0.45, power * 0.62));

        float glow = broad * 0.46 + haze * 0.74;
        glow *= intensity;

        float alpha = clamp(glow * opacity, 0.0, 1.0);
        vec3 color = glowColor * glow;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      toneMapped: false
    });
  };
})();