(function () {
  "use strict";

  const G = window.BlackDragonBooksPathRenderer =
    window.BlackDragonBooksPathRenderer || {};

  const PATH_URL =
    "/data/clients/black_dragon/books/map/paths/book_propagation_paths.v1.json";

  let state = {
    payload: null,
    paths: [],
    pathMeshes: [],
    pathGroup: null,
    pulseTick: 0,
    pulseTimer: null,
    mounted: false,
    last_error: null,
    scene_path: null
  };

  function getThree() {
    return window.THREE || null;
  }

  function looksLikeScene(obj) {
    return !!(
      obj &&
      obj.isScene === true &&
      typeof obj.add === "function" &&
      typeof obj.remove === "function"
    );
  }

  function findSceneRecursive(root, depth, seen) {
    if (!root || depth < 0) return null;
    if (looksLikeScene(root)) return root;
    if (typeof root !== "object" && typeof root !== "function") return null;

    seen = seen || new WeakSet();

    try {
      if (seen.has(root)) return null;
      seen.add(root);
    } catch (err) {
      return null;
    }

    const preferred = [
      "scene", "_scene", "mainScene", "globeScene", "threeScene",
      "worldScene", "cityScene", "cityMapScene", "renderScene",
      "rootScene", "state", "runtime", "renderer", "view", "globe", "cityMap"
    ];

    for (const key of preferred) {
      try {
        const found = findSceneRecursive(root[key], depth - 1, seen);
        if (found) return found;
      } catch (err) {}
    }

    let keys = [];

    try {
      keys = Object.keys(root).slice(0, 120);
    } catch (err) {
      return null;
    }

    for (const key of keys) {
      if (preferred.includes(key)) continue;

      try {
        const found = findSceneRecursive(root[key], depth - 1, seen);
        if (found) return found;
      } catch (err) {}
    }

    return null;
  }

  function resolveScene() {
    const roots = [
      ["window.UmbraGlobe", window.UmbraGlobe],
      ["window.UMBRA_GLOBE", window.UMBRA_GLOBE],
      ["window.Umbra", window.Umbra],
      ["window.UMBRA", window.UMBRA],
      ["window.Nexus", window.Nexus],
      ["window.UMBRA_RUNTIME", window.UMBRA_RUNTIME]
    ];

    for (const [label, obj] of roots) {
      const scene = findSceneRecursive(obj, 8);

      if (scene) {
        state.scene_path = label;
        return scene;
      }
    }

    return null;
  }

  function getDatasetSecurity() {
    return window.UmbraDatasetSecurity || null;
  }

  async function safeFetchJson(url) {
    const sec = getDatasetSecurity();
    const relativePath = url.replace(/^\//, "public/");

    if (sec && typeof sec.guardedFetch === "function") {
      const res = await sec.guardedFetch(relativePath);
      if (!res.ok) throw new Error("Failed to fetch " + url);
      return await res.json();
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch " + url);
    return await res.json();
  }

  function latLonToVector3(lat, lon, radius) {
    const THREE = getThree();

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  function colorFor(intensity) {
    switch (intensity) {
      case "CRITICAL": return 0xff5533;
      case "HIGH": return 0xff8844;
      case "MEDIUM": return 0xffbb66;
      default: return 0xffdd99;
    }
  }

  function buildCurve(path) {
    const THREE = getThree();

    const start = latLonToVector3(path.source_lat, path.source_lon, 107);
    const end = latLonToVector3(path.target_lat, path.target_lon, 107);

    const mid = start.clone().add(end).multiplyScalar(0.5);
    const lift = Math.max(10, Math.min(32, Number(path.path_strength || 50) / 3));
    mid.normalize().multiplyScalar(107 + lift);

    return new THREE.CatmullRomCurve3([start, mid, end]);
  }

  function buildPathMesh(path) {
    const THREE = getThree();

    const curve = buildCurve(path);
    const points = curve.getPoints(36);

    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const material = new THREE.LineBasicMaterial({
      color: colorFor(path.path_intensity),
      transparent: true,
      opacity: 0.26,
      linewidth: 1
    });

    const line = new THREE.Line(geometry, material);

    line.userData = {
      path_id: path.path_id,
      client_id: path.client_id,
      module: path.module,
      source_region: path.source_region,
      target_region: path.target_region,
      path_strength: path.path_strength,
      path_intensity: path.path_intensity,
      black_dragon_book_propagation_path: true
    };

    return line;
  }

  async function load() {
    try {
      state.payload = await safeFetchJson(PATH_URL);
      state.paths = Array.isArray(state.payload.paths)
        ? state.payload.paths
        : [];
      state.last_error = null;
      return state.payload;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      return null;
    }
  }

  function clearExisting() {
    const scene = resolveScene();

    if (state.pulseTimer) {
      clearInterval(state.pulseTimer);
      state.pulseTimer = null;
    }

    if (state.pathGroup && scene) {
      try {
        scene.remove(state.pathGroup);
      } catch (err) {}
    }

    state.pathMeshes = [];
    state.pathGroup = null;
    state.mounted = false;
  }

  function startPulseLoop() {
    if (state.pulseTimer) {
      clearInterval(state.pulseTimer);
    }

    state.pulseTimer = setInterval(() => {
      state.pulseTick += 0.035;

      const t = state.pulseTick;

      for (const mesh of state.pathMeshes) {
        if (mesh.material) {
          mesh.material.opacity = 0.16 + ((Math.sin(t) + 1) * 0.11);
        }
      }
    }, 33);
  }

  async function mount() {
    try {
      const THREE = getThree();
      const scene = resolveScene();

      if (!THREE) {
        state.last_error = "THREE missing";
        return false;
      }

      if (!scene) {
        state.last_error = "Three.js scene not resolved";
        return false;
      }

      if (!state.paths.length) {
        await load();
      }

      if (!state.paths.length) {
        state.last_error = "No propagation paths available";
        return false;
      }

      clearExisting();

      const group = new THREE.Group();
      group.name = "BLACK_DRAGON_BOOK_PROPAGATION_PATH_GROUP";

      const meshes = [];

      for (const path of state.paths) {
        const mesh = buildPathMesh(path);
        group.add(mesh);
        meshes.push(mesh);
      }

      scene.add(group);

      state.pathGroup = group;
      state.pathMeshes = meshes;
      state.mounted = true;
      state.last_error = null;

      startPulseLoop();

      console.info("[BlackDragonBooksPathRenderer] mounted", {
        paths: meshes.length,
        scene_path: state.scene_path
      });

      return true;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      console.error("[BlackDragonBooksPathRenderer] mount failed", err);
      return false;
    }
  }

  function mountWithRetry(attempt) {
    attempt = attempt || 1;

    mount().then(ok => {
      if (!ok && attempt < 15) {
        setTimeout(() => mountWithRetry(attempt + 1), 1000);
      }
    });
  }

  function getPaths() {
    return state.paths.slice();
  }

  function getRenderedPaths() {
    return state.pathMeshes.slice();
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_path_renderer_v1",
      mounted: state.mounted,
      paths: state.paths.length,
      rendered_paths: state.pathMeshes.length,
      has_group: !!state.pathGroup,
      scene_path: state.scene_path,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.mount = mount;
  G.clearExisting = clearExisting;
  G.getPaths = getPaths;
  G.getRenderedPaths = getRenderedPaths;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => mountWithRetry(1), 5200);
  });

  if (document.readyState !== "loading") {
    setTimeout(() => mountWithRetry(1), 5200);
  }
})();



