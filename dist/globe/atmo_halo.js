// public/globe/atmo_halo.js
(function () {
  const G = window.UmbraGlobe;
  if (!G || !window.THREE) {
    console.error("[atmo_halo] UmbraGlobe or THREE missing.");
    return;
  }

  const THREE = window.THREE;

  const DEFAULTS = {
    radiusScale: 1.014,
    color: 0xffb45c,
    opacity: 0.16,
    fresnelPower: 2.15,
    falloff: 1.08,
    lightWrap: 0.44,
    renderOrder: 13
  };

  function getMode() {
    return String(G.state?.mode || "WORLD").toUpperCase();
  }

  function isCityMapMode() {
    return getMode() === "CITY_MAP";
  }

  function detachHaloMesh(mesh) {
    if (!mesh) return;
    try { mesh.parent?.remove?.(mesh); } catch {}
    try { mesh.visible = false; } catch {}
  }

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
      side: THREE.BackSide,
      toneMapped: false,
      uniforms: {
        uColor: { value: new THREE.Color(DEFAULTS.color) },
        uOpacity: { value: DEFAULTS.opacity },
        uCameraPos: { value: new THREE.Vector3() },
        uLightDir: { value: new THREE.Vector3(-0.92, 0.18, 0.34).normalize() },
        uFresnelPower: { value: DEFAULTS.fresnelPower },
        uFalloff: { value: DEFAULTS.falloff },
        uLightWrap: { value: DEFAULTS.lightWrap }
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
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform vec3 uCameraPos;
        uniform vec3 uLightDir;
        uniform float uFresnelPower;
        uniform float uFalloff;
        uniform float uLightWrap;

        varying vec3 vWorldPos;
        varying vec3 vWorldNormal;

        void main() {
          vec3 N = normalize(vWorldNormal);
          vec3 V = normalize(uCameraPos - vWorldPos);
          vec3 L = normalize(uLightDir);

          float fresnel = pow(1.0 - max(dot(N, V), 0.0), uFresnelPower);

          float NdotL = max(dot(N, L), 0.0);
          float lightMask = smoothstep(0.04, uLightWrap, NdotL);

          float halo = fresnel * (lightMask + 0.02);
          halo = pow(halo, uFalloff);
          halo = clamp(halo, 0.0, 1.0);

          if (halo <= 0.001) discard;

          gl_FragColor = vec4(uColor, halo * uOpacity);
        }
      `
    });
  }

  function buildMesh() {
    const radius = getGlobeRadius() * DEFAULTS.radiusScale;
    const geo = new THREE.SphereGeometry(radius, 96, 64);
    const mat = makeMaterial();
    const mesh = new THREE.Mesh(geo, mat);

    mesh.name = "atmoHaloMesh";
    mesh.renderOrder = DEFAULTS.renderOrder;
    mesh.frustumCulled = false;
    mesh.userData = mesh.userData || {};
    mesh.userData.type = "atmoHalo";
    mesh.userData.nonPickable = true;
    mesh.raycast = function () {};

    return mesh;
  }

  G.ensureAtmoHalo = function ensureAtmoHalo() {
    const st = G.state || {};

    if (isCityMapMode()) {
      if (st.atmoHaloMesh) {
        detachHaloMesh(st.atmoHaloMesh);
      }
      return st.atmoHaloMesh || null;
    }

    const wg = typeof G.ensureWorldGroup === "function" ? G.ensureWorldGroup(st.scene) : null;
    if (!wg) return null;

    if (st.atmoHaloMesh && st.atmoHaloMesh.parent === wg) {
      return st.atmoHaloMesh;
    }

    if (st.atmoHaloMesh) {
      try { st.atmoHaloMesh.parent?.remove?.(st.atmoHaloMesh); } catch {}
      try { G.disposeObject?.(st.atmoHaloMesh); } catch {}
    }

    const mesh = buildMesh();
    wg.add(mesh);
    st.atmoHaloMesh = mesh;
    return mesh;
  };

  G.updateAtmoHalo = function updateAtmoHalo() {
    const st = G.state || {};
    const mode = getMode();

    if (mode === "CITY_MAP") {
      if (st.atmoHaloMesh) {
        detachHaloMesh(st.atmoHaloMesh);
      }
      return;
    }

    const mesh = st.atmoHaloMesh || G.ensureAtmoHalo?.();
    if (!mesh) return;

    mesh.visible = mode === "WORLD";

    if (!mesh.visible) return;

    const wg = st.worldGroup || null;
    if (wg && mesh.parent !== wg) {
      try { wg.add(mesh); } catch {}
    }

    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.scale.set(1, 1, 1);

    const camPos = st.camera?.position;
    if (camPos && mesh.material?.uniforms?.uCameraPos) {
      mesh.material.uniforms.uCameraPos.value.copy(camPos);
    }

    const lightDir = mesh.material?.uniforms?.uLightDir?.value;
    if (lightDir && st.sunLight?.position) {
      lightDir.copy(st.sunLight.position).normalize();
    }
  };

  G.setAtmoHalo = function setAtmoHalo(partial = {}) {
    const mesh = G.ensureAtmoHalo?.();
    const u = mesh?.material?.uniforms;
    if (!u) return;

    if (partial.color != null) u.uColor.value.set(partial.color);
    if (partial.opacity != null) u.uOpacity.value = Number(partial.opacity);
    if (partial.fresnelPower != null) u.uFresnelPower.value = Number(partial.fresnelPower);
    if (partial.falloff != null) u.uFalloff.value = Number(partial.falloff);
    if (partial.lightWrap != null) u.uLightWrap.value = Number(partial.lightWrap);
  };

  G.clearAtmoHalo = function clearAtmoHalo() {
    const st = G.state || {};
    const mesh = st.atmoHaloMesh;
    if (!mesh) return;
    try { mesh.parent?.remove?.(mesh); } catch {}
    try { G.disposeObject?.(mesh); } catch {}
    st.atmoHaloMesh = null;
  };
})();