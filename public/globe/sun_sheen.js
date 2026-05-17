// public/globe/sun_sheen.js
(function () {
  const G = window.UmbraGlobe;
  if (!G || !window.THREE) {
    console.error("[sun_sheen] UmbraGlobe or THREE missing.");
    return;
  }

  const THREE = window.THREE;

  const DEFAULTS = {
    radiusScale: 1.010,
    opacity: 0.46,
    glowColor: 0xffa24a,
    rimPower: 1.95,
    specPower: 86.0,
    specStrength: 0.18,
    hemisphereClamp: 0.16,
    renderOrder: 14
  };

  function getGlobeRadius() {
    const r = Number(G.state?.earthRadius);
    return Number.isFinite(r) && r > 0 ? r : 1.0;
  }

  function makeMaterial() {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      toneMapped: false,
      uniforms: {
        uGlowColor: { value: new THREE.Color(DEFAULTS.glowColor) },
        uOpacity: { value: DEFAULTS.opacity },
        uLightDir: { value: new THREE.Vector3(-0.92, 0.18, 0.34).normalize() },
        uCameraPos: { value: new THREE.Vector3() },
        uRimPower: { value: DEFAULTS.rimPower },
        uSpecPower: { value: DEFAULTS.specPower },
        uSpecStrength: { value: DEFAULTS.specStrength },
        uHemisphereClamp: { value: DEFAULTS.hemisphereClamp }
      },
      vertexShader: `
        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;

        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          vWorldNormal = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uGlowColor;
        uniform float uOpacity;
        uniform vec3 uLightDir;
        uniform vec3 uCameraPos;
        uniform float uRimPower;
        uniform float uSpecPower;
        uniform float uSpecStrength;
        uniform float uHemisphereClamp;

        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(uCameraPos - vWorldPos);
          vec3 L = normalize(uLightDir);
          vec3 H = normalize(L + V);

          float NdotL = max(dot(N, L), 0.0);
          float NdotV = max(dot(N, V), 0.0);

          // Broad atmospheric crescent on the light-facing edge
          float rim = pow(1.0 - NdotV, uRimPower);

          // Tight highlight, deliberately restrained
          float spec = pow(max(dot(N, H), 0.0), uSpecPower) * uSpecStrength;

          // Allow less of the lit hemisphere to participate
          float hemiMask = smoothstep(uHemisphereClamp, 1.0, NdotL);

          // Prefer the edge/terminator zone over the center of the lit hemisphere
          float edgeBias = smoothstep(0.22, 0.90, rim);

          // Much weaker interior warmth
          float interiorWarmth = pow(NdotL, 1.75) * 0.045;

          // Final balance:
          // - stronger edge preference
          // - weaker spec
          // - much weaker interior fill
          float intensity =
            ((rim * 1.16 * edgeBias) + (spec * 0.16) + interiorWarmth) * hemiMask;

          intensity = clamp(intensity, 0.0, 1.0);

          if (intensity <= 0.001) discard;

          gl_FragColor = vec4(uGlowColor, intensity * uOpacity);
        }
      `
    });
  }

  function buildMesh() {
    const radius = getGlobeRadius() * DEFAULTS.radiusScale;
    const geo = new THREE.SphereGeometry(radius, 96, 64);
    const mat = makeMaterial();
    const mesh = new THREE.Mesh(geo, mat);

    mesh.name = "sunSheenMesh";
    mesh.renderOrder = DEFAULTS.renderOrder;
    mesh.frustumCulled = false;
    mesh.userData = mesh.userData || {};
    mesh.userData.type = "sunSheen";
    mesh.userData.nonPickable = true;

    mesh.raycast = function () {};
    return mesh;
  }

  G.ensureSunSheen = function ensureSunSheen() {
    const st = G.state || {};
    const wg = typeof G.ensureWorldGroup === "function" ? G.ensureWorldGroup(st.scene) : null;
    if (!wg) return null;

    if (st.sunSheenMesh && st.sunSheenMesh.parent === wg) {
      return st.sunSheenMesh;
    }

    if (st.sunSheenMesh) {
      try { st.sunSheenMesh.parent?.remove?.(st.sunSheenMesh); } catch {}
      try { G.disposeObject?.(st.sunSheenMesh); } catch {}
    }

    const mesh = buildMesh();
    wg.add(mesh);
    st.sunSheenMesh = mesh;
    return mesh;
  };

  G.updateSunSheen = function updateSunSheen() {
    const st = G.state || {};
    const mesh = st.sunSheenMesh || G.ensureSunSheen?.();
    if (!mesh) return;

    const mode = String(st.mode || "WORLD").toUpperCase();
    mesh.visible = mode === "WORLD";

    if (!mesh.visible) return;

    // follow globe exactly
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);

    const camPos = st.camera?.position;
    if (camPos && mesh.material?.uniforms?.uCameraPos) {
      mesh.material.uniforms.uCameraPos.value.copy(camPos);
    }

    // Reuse sun light direction when available
    const lightDir = mesh.material?.uniforms?.uLightDir?.value;
    if (lightDir && st.sunLight?.position) {
      lightDir.copy(st.sunLight.position).normalize();
    }
  };

  G.setSunSheen = function setSunSheen(partial = {}) {
    const mesh = G.ensureSunSheen?.();
    const u = mesh?.material?.uniforms;
    if (!u) return;

    if (partial.color != null) u.uGlowColor.value.set(partial.color);
    if (partial.opacity != null) u.uOpacity.value = Number(partial.opacity);
    if (partial.rimPower != null) u.uRimPower.value = Number(partial.rimPower);
    if (partial.specPower != null) u.uSpecPower.value = Number(partial.specPower);
    if (partial.specStrength != null) u.uSpecStrength.value = Number(partial.specStrength);
    if (partial.hemisphereClamp != null) u.uHemisphereClamp.value = Number(partial.hemisphereClamp);
  };

  G.clearSunSheen = function clearSunSheen() {
    const st = G.state || {};
    const mesh = st.sunSheenMesh;
    if (!mesh) return;
    try { mesh.parent?.remove?.(mesh); } catch {}
    try { G.disposeObject?.(mesh); } catch {}
    st.sunSheenMesh = null;
  };
})();