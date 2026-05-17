window.UmbraGlobe.makeDeterministicEarthFallbackTexture = function makeDeterministicEarthFallbackTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  g.addColorStop(0, "#071426");
  g.addColorStop(0.5, "#0d2f4f");
  g.addColorStop(1, "#071426");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(34, 92, 58, 0.95)";
  for (let i = 0; i < 42; i++) {
    const x = ((i * 313) % canvas.width);
    const y = ((i * 197) % canvas.height);
    ctx.beginPath();
    ctx.ellipse(x, y, 90 + (i % 7) * 18, 28 + (i % 5) * 14, (i % 6) * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1;
  for (let lon = 0; lon < canvas.width; lon += 128) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, canvas.height);
    ctx.stroke();
  }
  for (let lat = 0; lat < canvas.height; lat += 128) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(canvas.width, lat);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.userData = { __umbraOwned: true, __umbraUrl: "deterministic-earth-fallback" };
  tex.needsUpdate = true;
  return tex;
};
// public/globe/layers.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[layers] window.UmbraGlobe missing.");
  if (!window.THREE) return console.error("[layers] window.THREE missing.");

  console.log("[SIGNATURE] globe/layers.js LOADED", new Date().toISOString());

  function safeRemove(obj) {
    if (!obj) return;
    try {
      try { obj.parent?.remove?.(obj); } catch {}
      try { G.disposeObject?.(obj); } catch {}
    } catch (e) {
      console.warn("[layers] safeRemove error:", e);
      try { obj.parent?.remove?.(obj); } catch {}
    }
  }

  function tuneTexture(tex, renderer, { color = true } = {}) {
    if (!tex) return;
    try {
      const maxAniso = renderer?.capabilities?.getMaxAnisotropy?.() || 1;
      tex.anisotropy = Math.min(16, maxAniso);

      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;

      if (tex.colorSpace !== undefined) {
        if (color && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        else if (THREE.NoColorSpace !== undefined) tex.colorSpace = THREE.NoColorSpace;
      } else if (tex.encoding !== undefined) {
        if (color && THREE.sRGBEncoding !== undefined) tex.encoding = THREE.sRGBEncoding;
        else if (THREE.LinearEncoding !== undefined) tex.encoding = THREE.LinearEncoding;
      }

      tex.needsUpdate = true;
    } catch (e) {
      console.warn("[layers] tuneTexture error:", e);
    }
  }

  function requireWorldGroup() {
    try { G.ensureWorldWeld?.(); } catch (e) { console.warn("[layers] ensureWorldWeld threw:", e); }
    const wg = G.state?.worldGroup || null;
    if (!wg) {
      console.error("[layers] worldGroup missing.");
      return null;
    }
    return wg;
  }

  function markNonPickable(obj, label) {
    if (!obj) return;
    obj.userData = obj.userData || {};
    if (!obj.userData.type) obj.userData.type = label || "nonPickable";
    obj.userData.nonPickable = true;
    obj.raycast = function () {};
  }

  function degToU(deg) {
    const d = Number(deg);
    if (!Number.isFinite(d)) return 0;
    let u = d / 360;
    u = ((u % 1) + 1) % 1;
    return u;
  }

  function applyTexLonOffsetToTexture(tex, deg) {
    if (!tex) return;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.matrixAutoUpdate = true;
    tex.offset.x = degToU(deg);
    try { tex.updateMatrix?.(); } catch {}
    tex.needsUpdate = true;
  }

  function applyTexLonOffsetNow(degOverride) {
    const st = G.state || {};
    const m = st?.globeMesh?.material;
    const deg = Number.isFinite(Number(degOverride))
      ? Number(degOverride)
      : Number.isFinite(Number(st.textureLonOffsetDeg))
        ? Number(st.textureLonOffsetDeg)
        : 0;

    if (m?.map) applyTexLonOffsetToTexture(m.map, deg);
    if (m?.emissiveMap) applyTexLonOffsetToTexture(m.emissiveMap, deg);
    if (m?.normalMap && m.normalMap.image) applyTexLonOffsetToTexture(m.normalMap, deg);
    if (m?.metalnessMap && m.metalnessMap.image) applyTexLonOffsetToTexture(m.metalnessMap, deg);
    if (m?.roughnessMap && m.roughnessMap.image) applyTexLonOffsetToTexture(m.roughnessMap, deg);

    if (st.__lastBaseTex) applyTexLonOffsetToTexture(st.__lastBaseTex, deg);
    if (st.__lastNightTex) applyTexLonOffsetToTexture(st.__lastNightTex, deg);

    return deg;
  }

  function ensureVec(v, fallback) {
    if (v && typeof v.x === "number" && typeof v.y === "number" && typeof v.z === "number") {
      return v.clone ? v.clone() : new THREE.Vector3(v.x, v.y, v.z);
    }
    return fallback.clone();
  }

  function safeNormalize(v, fallback) {
    const out = ensureVec(v, fallback);
    if (out.lengthSq() <= 1e-12) return fallback.clone();
    return out.normalize();
  }

  function getCityBasis(cityLat, cityLon) {
    const up = safeNormalize(
      G.latLonToDir(cityLat, cityLon),
      new THREE.Vector3(0, 0, 1)
    );

    const worldNorth = new THREE.Vector3(0, 1, 0);
    const fallbackAxis = new THREE.Vector3(1, 0, 0);

    let east = new THREE.Vector3().crossVectors(worldNorth, up);
    if (east.lengthSq() <= 1e-10) {
      east = new THREE.Vector3().crossVectors(fallbackAxis, up);
    }
    east.normalize();

    const north = new THREE.Vector3().crossVectors(up, east).normalize();

    return { east, north, up };
  }

  function collectCityEntities(cityId) {
    const st = G.state || {};
    const cid = String(cityId || "").trim();
    if (!cid) return [];

    if (st.entitiesListByCity instanceof Map && st.entitiesListByCity.has(cid)) {
      const arr = st.entitiesListByCity.get(cid);
      return Array.isArray(arr) ? arr.filter(Boolean) : [];
    }

    if (st.entitiesById instanceof Map) {
      const out = [];
      for (const ent of st.entitiesById.values()) {
        const entCityId = String(ent?.city_id || ent?.cityId || "").trim();
        if (entCityId === cid) out.push(ent);
      }
      return out;
    }

    return [];
  }

  function buildProjectionMarker(entityId) {
    const geo = new THREE.CircleGeometry(0.012, 18);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `cityProjection_${entityId}`;
    mesh.renderOrder = 8;
    markNonPickable(mesh, "cityProjection");
    mesh.userData.entity_id = entityId;
    return mesh;
  }

  function buildCityCenterMarker() {
    const geo = new THREE.RingGeometry(0.018, 0.028, 24);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x4fc3ff,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "citySurfaceCenterMarker";
    mesh.renderOrder = 9;
    markNonPickable(mesh, "cityCenterMarker");
    return mesh;
  }

  function buildGridLineSegments(size, divisions) {
    const half = size / 2;
    const step = size / divisions;
    const positions = [];

    for (let i = 0; i <= divisions; i++) {
      const p = -half + i * step;

      positions.push(p, -half, 0);
      positions.push(p,  half, 0);

      positions.push(-half, p, 0);
      positions.push( half, p, 0);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x4fc3ff,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });

    const lines = new THREE.LineSegments(geo, mat);
    lines.name = "citySurfaceGridLines";
    lines.renderOrder = 7;
    markNonPickable(lines, "cityGridLines");
    return lines;
  }

  function rebuildCityProjection(cityId) {
    const st = G.state || {};
    const group = st.cityProjectionGroup;
    if (!group) return;

    while (group.children.length) {
      safeRemove(group.children[0]);
    }

    const cid = String(cityId || "").trim();
    if (!cid) return;

    const city = st.citiesById instanceof Map ? st.citiesById.get(cid) : null;
    if (!city || city.lat == null || city.lon == null) return;

    const entities = collectCityEntities(cid);
    const basis = getCityBasis(city.lat, city.lon);
    const radius = Number(st.earthRadius || 1);

    const cityDir = safeNormalize(
      G.latLonToDir(city.lat, city.lon),
      new THREE.Vector3(0, 0, 1)
    );
    const cityPos = cityDir.clone().multiplyScalar(radius);

    const raw = [];
    let maxAbs = 0;

    for (const ent of entities) {
      const lat = Number(ent?.lat);
      const lon = Number(ent?.lon);
      const entityId = String(ent?.entity_id || ent?.entityId || "").trim();
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !entityId) continue;

      const entDir = safeNormalize(
        G.latLonToDir(lat, lon),
        cityDir
      );
      const entPos = entDir.clone().multiplyScalar(radius);

      const delta = entPos.sub(cityPos);
      const x = delta.dot(basis.east);
      const y = delta.dot(basis.north);

      maxAbs = Math.max(maxAbs, Math.abs(x), Math.abs(y));

      raw.push({
        entityId,
        x,
        y
      });
    }

    const planeSize = Number(st.citySurfaceSize || 0.9);
    const halfUsable = planeSize * 0.40;
    const denom = Math.max(maxAbs, 1e-6);
    const scale = halfUsable / denom;

    const centerMarker = buildCityCenterMarker();
    centerMarker.position.set(0, 0, 0.0035);
    group.add(centerMarker);

    for (const item of raw) {
      const marker = buildProjectionMarker(item.entityId);
      marker.position.set(item.x * scale, item.y * scale, 0.0045);
      group.add(marker);
    }

    st.__cityProjectionScale = scale;
    st.__cityProjectionCount = raw.length;

    console.log("[layers] cityProjection REBUILT", {
      cityId: cid,
      entities: raw.length,
      scale: Number(scale.toFixed(6))
    });
  }

  if (typeof G.applyTextureLonOffsetNow !== "function") {
    G.applyTextureLonOffsetNow = function applyTextureLonOffsetNow() {
      const used = applyTexLonOffsetNow(undefined);
      console.log("[layers] applyTextureLonOffsetNow ->", used);
      return used;
    };
  }

  G.syncWorldVisualMode = function syncWorldVisualMode() {
    const st = G.state || {};
    const mode = String(st.mode || "").toUpperCase();
    const worldVisible = mode !== "CITY_MAP";

    if (st.globeMesh) st.globeMesh.visible = worldVisible;
    if (st.edgeGlowMesh) st.edgeGlowMesh.visible = worldVisible;
    if (st.outerHaloMesh) st.outerHaloMesh.visible = worldVisible;
    if (st.atmoMesh) st.atmoMesh.visible = worldVisible;
    if (st.veinsMesh) st.veinsMesh.visible = worldVisible;
    if (st.starfieldMesh) st.starfieldMesh.visible = worldVisible;

    console.log("[layers] WORLD VISUAL SYNC", {
      mode,
      worldVisible,
      globe: !!st.globeMesh && st.globeMesh.visible,
      edgeGlow: !!st.edgeGlowMesh && st.edgeGlowMesh.visible,
      starfield: !!st.starfieldMesh && st.starfieldMesh.visible
    });
  };

  G.buildLayers = function buildLayers(tex = {}) {
    try {
      const st = G.state || {};
      const scene = st.scene;
      const renderer = st.renderer;
      if (!scene || !renderer) {
        console.error("[layers] Missing scene/renderer.");
        return;
      }

      const worldGroup = requireWorldGroup();
      if (!worldGroup) return;

      safeRemove(st.atmoMesh); st.atmoMesh = null;
      safeRemove(st.globeMesh); st.globeMesh = null;
      safeRemove(st.veinsMesh); st.veinsMesh = null;
      safeRemove(st.edgeGlowMesh); st.edgeGlowMesh = null;
      safeRemove(st.outerHaloMesh); st.outerHaloMesh = null;
      safeRemove(st.starfieldMesh); st.starfieldMesh = null;
      safeRemove(st.citySurfaceGroup); st.citySurfaceGroup = null;
      st.citySurfaceMesh = null;
      st.cityProjectionGroup = null;

      const baseTex = tex.base || null;
      const nightTex = tex.night || null;
      const starTex = tex.starfield || null;

      st.__lastBaseTex = baseTex;
      st.__lastNightTex = nightTex;

      tuneTexture(baseTex, renderer, { color: true });
      tuneTexture(nightTex, renderer, { color: true });
      tuneTexture(starTex, renderer, { color: true });

      const seamDeg = Number.isFinite(Number(st.textureLonOffsetDeg)) ? Number(st.textureLonOffsetDeg) : 0;
      applyTexLonOffsetToTexture(baseTex, seamDeg);
      applyTexLonOffsetToTexture(nightTex, seamDeg);

      const radius = 1;
      st.earthRadius = radius;

      const loader = new THREE.TextureLoader();

      let normalMap = null;
      let specularMap = null;

      normalMap = loader.load(
        "./assets/earth_normal_4k.jpg",
        (texLoaded) => {
          tuneTexture(texLoaded, renderer, { color: false });
          applyTexLonOffsetToTexture(texLoaded, seamDeg);
        }
      );

      specularMap = loader.load(
        "./assets/earth_specular_4k.jpg",
        (texLoaded) => {
          tuneTexture(texLoaded, renderer, { color: false });
          applyTexLonOffsetToTexture(texLoaded, seamDeg);
        }
      );

      const globeGeo = new THREE.SphereGeometry(radius, 144, 144);

      const globeMat = new THREE.MeshStandardMaterial({
        map: baseTex,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(0.58, 0.58),
        metalnessMap: specularMap,
        roughnessMap: specularMap,
        metalness: 0.10,
        roughness: 0.78,
        emissive: new THREE.Color(0xff7a1a),
        emissiveMap: nightTex,
        emissiveIntensity: 1.14
      });

      globeMat.onBeforeCompile = (shader) => {
        shader.uniforms.uAtmosGlowColor = {
          value: new THREE.Color(0xff8a2a)
        };
        shader.uniforms.uAtmosWrapStrength = { value: 0.14 };
        shader.uniforms.uAtmosWrapFalloff = { value: 2.8 };

        shader.vertexShader = shader.vertexShader
          .replace(
            "#include <common>",
            `
              #include <common>
              varying vec3 vAtmosWorldNormal;
            `
          )
          .replace(
            "#include <beginnormal_vertex>",
            `
              #include <beginnormal_vertex>
              vAtmosWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
            `
          );

        shader.fragmentShader = shader.fragmentShader
          .replace(
            "#include <common>",
            `
              #include <common>
              uniform vec3 uAtmosGlowColor;
              uniform float uAtmosWrapStrength;
              uniform float uAtmosWrapFalloff;
              varying vec3 vAtmosWorldNormal;
            `
          )
          .replace(
            "#include <output_fragment>",
            `
              vec3 atmosN = normalize(vAtmosWorldNormal);
              vec3 atmosV = normalize(cameraPosition - vWorldPosition);

              float atmosFacing = clamp(dot(atmosN, atmosV), 0.0, 1.0);
              float atmosRim = pow(1.0 - atmosFacing, uAtmosWrapFalloff);
              float atmosWrap = atmosRim * uAtmosWrapStrength;

              outgoingLight += uAtmosGlowColor * atmosWrap * vec3(1.0, 0.5, 0.18);

              #include <output_fragment>
            `
          );
      };

      globeMat.customProgramCacheKey = function customProgramCacheKey() {
        return "umbra_globe_surface_wrap_v2";
      };

      const globeMesh = new THREE.Mesh(globeGeo, globeMat);
      globeMesh.name = "globeMesh";
      globeMesh.renderOrder = 0;
      globeMesh.frustumCulled = false;
      markNonPickable(globeMesh, "globe");
      worldGroup.add(globeMesh);
      st.globeMesh = globeMesh;

      st.veinsMesh = null;

      applyTexLonOffsetNow(seamDeg);

      st.outerHaloMesh = null;
      st.atmoMesh = null;

      if (typeof G.makeEdgeGlowMaterial === "function") {
        const edgeGlowGeo = new THREE.SphereGeometry(radius * 1.006, 128, 128);
        const edgeGlowMat = G.makeEdgeGlowMaterial({
          glowColor: 0xff8a2a,
          intensity: 0.68,
          power: 1.72,
          opacity: 0.44
        });

        const edgeGlowMesh = new THREE.Mesh(edgeGlowGeo, edgeGlowMat);
        edgeGlowMesh.name = "edgeGlowMesh";
        edgeGlowMesh.renderOrder = 3;
        edgeGlowMesh.frustumCulled = false;
        markNonPickable(edgeGlowMesh, "edgeGlow");
        worldGroup.add(edgeGlowMesh);
        st.edgeGlowMesh = edgeGlowMesh;
      }

      if (starTex) {
        const starGeo = new THREE.SphereGeometry(40, 64, 64);
        const starMat = new THREE.MeshBasicMaterial({
          map: starTex,
          side: THREE.BackSide,
          transparent: true,
          opacity: 0.012,
          depthWrite: false
        });

        const starfieldMesh = new THREE.Mesh(starGeo, starMat);
        starfieldMesh.name = "starfieldMesh";
        scene.add(starfieldMesh);
        st.starfieldMesh = starfieldMesh;
      }

      G.buildCitySurface?.();
      G.syncWorldVisualMode?.();

      console.log("[layers] BUILD COMPLETE", {
        globe: !!st.globeMesh,
        veins: !!st.veinsMesh,
        edgeGlow: !!st.edgeGlowMesh,
        outerHalo: false,
        atmosphere: false,
        globeSurfaceWrap: true
      });
    } catch (e) {
      console.error("[layers] buildLayers fatal:", e);
    }
  };

  G.buildCitySurface = function buildCitySurface() {
    const st = G.state || {};
    const worldGroup = requireWorldGroup();
    if (!worldGroup) return;

    if (st.citySurfaceGroup) return;

    const size = 0.9;
    st.citySurfaceSize = size;

    const group = new THREE.Group();
    group.name = "citySurfaceGroup";
    group.visible = false;
    markNonPickable(group, "citySurfaceGroup");

    const planeGeo = new THREE.PlaneGeometry(size, size, 1, 1);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: false,
      opacity: 1.0,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.name = "citySurfaceMesh";
    plane.renderOrder = 6;
    markNonPickable(plane, "citySurface");
    group.add(plane);

    const gridLines = buildGridLineSegments(size, 12);
    group.add(gridLines);

    const projectionGroup = new THREE.Group();
    projectionGroup.name = "cityProjectionGroup";
    markNonPickable(projectionGroup, "cityProjectionGroup");
    group.add(projectionGroup);

    worldGroup.add(group);

    st.citySurfaceGroup = group;
    st.citySurfaceMesh = plane;
    st.cityProjectionGroup = projectionGroup;
    st.__lastCitySurfaceId = "";
    st.__cityProjectionScale = 1;
    st.__cityProjectionCount = 0;

    console.log("[layers] citySurfaceGroup CREATED");
  };

  G.updateCitySurface = function updateCitySurface() {
    const st = G.state || {};
    const group = st.citySurfaceGroup;
    const plane = st.citySurfaceMesh;

    G.syncWorldVisualMode?.();

    if (!group || !plane) return;

    const mode = String(st.mode || "").toUpperCase();
    const cityId = String(st.activeCityId || "").trim();

    if (mode !== "CITY_MAP" || !cityId) {
      group.visible = false;
      return;
    }

    if (!(st.citiesById instanceof Map)) {
      group.visible = false;
      return;
    }

    const city = st.citiesById.get(cityId);
    if (!city || city.lat == null || city.lon == null) {
      group.visible = false;
      return;
    }

    if (typeof G.latLonToDir !== "function") {
      group.visible = false;
      return;
    }

    const basis = getCityBasis(city.lat, city.lon);
    const radius = Number(st.earthRadius || 1);
    const pos = basis.up.clone().multiplyScalar(radius * 1.08);

    group.position.copy(pos);

    const basisMat = new THREE.Matrix4().makeBasis(
      basis.east.clone(),
      basis.north.clone(),
      basis.up.clone()
    );
    group.quaternion.setFromRotationMatrix(basisMat);

    group.visible = true;

    if (st.__lastCitySurfaceId !== cityId) {
      st.__lastCitySurfaceId = cityId;
      rebuildCityProjection(cityId);

      console.log("[layers] citySurfaceGroup VISIBLE", {
        cityId,
        mode,
        projectionCount: st.__cityProjectionCount,
        projectionScale: Number((st.__cityProjectionScale || 0).toFixed(6)),
        pos: {
          x: Number(group.position.x.toFixed(4)),
          y: Number(group.position.y.toFixed(4)),
          z: Number(group.position.z.toFixed(4))
        }
      });
    }
  };
})();



