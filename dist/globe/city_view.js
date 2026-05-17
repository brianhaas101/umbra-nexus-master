// public/globe/city_view.js
(function () {
  const G = window.UmbraGlobe;
  if (!G || !window.THREE) {
    console.error("[city_view] missing dependencies");
    return;
  }

  function requireWorldGroup() {
    const wg = G.state?.worldGroup;
    if (!wg) {
      console.error("[city_view] worldGroup missing");
      return null;
    }
    return wg;
  }

  function clearGroup(group) {
    if (!group) return;
    while (group.children.length) {
      const child = group.children[0];
      try { child.parent?.remove?.(child); } catch {}
      try { G.disposeObject?.(child); } catch {}
    }
  }

  function buildCityView() {
    const st = G.state || {};
    const wg = requireWorldGroup();
    if (!wg) return;

    if (st.cityViewGroup) return;

    const group = new THREE.Group();
    group.name = "cityViewGroup";
    group.visible = false;

    const planeGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
    const planeMat = new THREE.MeshBasicMaterial({
      map: null,
      transparent: false,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.name = "cityMapPlane";
    plane.renderOrder = 10;
    plane.userData.type = "cityMapPlane";
    plane.userData.nonPickable = true;
    plane.raycast = function () {};

    group.add(plane);

    const entityGroup = new THREE.Group();
    entityGroup.name = "cityEntityProjectionGroup";
    entityGroup.userData.type = "cityEntityProjectionGroup";
    entityGroup.userData.nonPickable = true;
    entityGroup.raycast = function () {};

    group.add(entityGroup);

    wg.add(group);

    st.cityViewGroup = group;
    st.cityMapPlane = plane;
    st.cityEntityProjectionGroup = entityGroup;

    console.log("[city_view] BUILT");
  }

  function getBasis(lat, lon) {
    const up = G.latLonToDir(lat, lon).clone().normalize();
    const northRef = new THREE.Vector3(0, 1, 0);

    let east = new THREE.Vector3().crossVectors(northRef, up);
    if (east.lengthSq() < 1e-8) {
      east = new THREE.Vector3(1, 0, 0).cross(up);
    }
    east.normalize();

    const north = new THREE.Vector3().crossVectors(up, east).normalize();

    return { east, north, up };
  }

  function projectEntities(meta) {
    const st = G.state || {};
    const group = st.cityEntityProjectionGroup;
    if (!group) return;

    clearGroup(group);

    if (!(st.entitiesById instanceof Map)) return;
    const city = st.citiesById instanceof Map ? st.citiesById.get(meta.city_id) : null;
    if (!city) return;

    const basis = getBasis(meta.center_lat, meta.center_lon);
    const R = Number(st.earthRadius || 1);

    const cityDir = G.latLonToDir(meta.center_lat, meta.center_lon).clone().normalize();
    const cityPos = cityDir.clone().multiplyScalar(R);

    const rot = (Number(meta.rotation_deg || 0) * Math.PI) / 180;
    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);

    for (const ent of st.entitiesById.values()) {
      const entCityId = String(ent?.city_id || ent?.cityId || "").trim();
      if (entCityId !== meta.city_id) continue;

      const lat = Number(ent?.lat);
      const lon = Number(ent?.lon);
      const entityId = String(ent?.entity_id || ent?.entityId || "").trim();
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || !entityId) continue;

      const dir = G.latLonToDir(lat, lon).clone().normalize();
      const pos = dir.clone().multiplyScalar(R);
      const delta = pos.sub(cityPos);

      const x = delta.dot(basis.east);
      const y = delta.dot(basis.north);

      const rx = x * cosR - y * sinR;
      const ry = x * sinR + y * cosR;

      const nx = rx / (Number(meta.width_m) / 2);
      const ny = ry / (Number(meta.height_m) / 2);

      const marker = new THREE.Mesh(
        new THREE.CircleGeometry(0.01, 16),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.98,
          depthWrite: false,
          side: THREE.DoubleSide
        })
      );

      marker.position.set(nx, ny, 0.01);
      marker.userData.type = "cityProjectedEntity";
      marker.userData.entity_id = entityId;
      marker.userData.city_id = meta.city_id;

      group.add(marker);
    }

    console.log("[city_view] entities projected", {
      city_id: meta.city_id,
      count: group.children.length
    });
  }

  G.enterCityView = async function enterCityView(city_id) {
    const st = G.state || {};
    buildCityView();

    const loaded = await G.loadCityAsset(city_id);
    if (!loaded) return;

    const { meta, tex } = loaded;
    const group = st.cityViewGroup;
    const plane = st.cityMapPlane;

    if (!group || !plane) return;

    plane.material.map = tex;
    plane.material.needsUpdate = true;

    const aspect = Number(meta.width_m) / Math.max(1, Number(meta.height_m));
    plane.scale.set(aspect, 1, 1);

    const basis = getBasis(meta.center_lat, meta.center_lon);
    const radius = Number(st.earthRadius || 1);
    const planePos = basis.up.clone().multiplyScalar(radius * 1.10);

    group.position.copy(planePos);

    const basisMat = new THREE.Matrix4().makeBasis(
      basis.east.clone(),
      basis.north.clone(),
      basis.up.clone()
    );
    group.quaternion.setFromRotationMatrix(basisMat);

    group.visible = true;

    projectEntities(meta);

    st.mode = "CITY";
    st.activeCityId = meta.city_id;

    console.log("[city_view] ENTER", meta.city_id);
  };

  G.exitCityView = function exitCityView() {
    const st = G.state || {};
    if (st.cityViewGroup) st.cityViewGroup.visible = false;
    st.mode = "WORLD";
    console.log("[city_view] EXIT");
  };
})();