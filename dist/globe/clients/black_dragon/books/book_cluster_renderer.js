(function () {
  "use strict";

  const G = window.BlackDragonBooksClusterRenderer =
    window.BlackDragonBooksClusterRenderer || {};

  const CLUSTER_URL =
    "/data/clients/black_dragon/books/map/clusters/book_regional_influence_clusters.v1.json";

  let state = {
    payload: null,
    clusters: [],
    clusterMeshes: [],
    clusterGroup: null,
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

  function intensityColor(intensity) {
    switch (intensity) {
      case "CRITICAL": return 0xff5533;
      case "HIGH": return 0xff8844;
      case "MEDIUM": return 0xffbb66;
      default: return 0xffdd99;
    }
  }

  function clearExisting() {
    const scene = resolveScene();

    if (state.clusterGroup && scene) {
      try {
        scene.remove(state.clusterGroup);
      } catch (err) {}
    }

    state.clusterMeshes = [];
    state.clusterGroup = null;
    state.mounted = false;
  }

  function buildClusterMesh(cluster) {
    const THREE = getThree();
    const color = intensityColor(cluster.cluster_intensity);
    const radius = Number(cluster.render && cluster.render.radius_hint ? cluster.render.radius_hint : 2.5);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius, radius + 0.22, 48),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(0.8, radius * 0.22), 16, 16),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.62,
        depthWrite: false
      })
    );

    const pos = latLonToVector3(
      Number(cluster.lat),
      Number(cluster.lon),
      106
    );

    ring.position.copy(pos);
    core.position.copy(pos);
    ring.lookAt(0,0,0);

    const group = new THREE.Group();
    group.name = "BD_BOOK_CLUSTER_" + cluster.region;
    group.add(ring);
    group.add(core);

    group.userData = {
      cluster_id: cluster.cluster_id,
      client_id: cluster.client_id,
      module: cluster.module,
      region: cluster.region,
      target_count: cluster.target_count,
      max_visual_score: cluster.max_visual_score,
      avg_visual_score: cluster.avg_visual_score,
      cluster_intensity: cluster.cluster_intensity,
      entity_ids: cluster.entity_ids,
      black_dragon_book_cluster: true
    };

    return group;
  }

  async function load() {
    try {
      state.payload = await safeFetchJson(CLUSTER_URL);
      state.clusters = Array.isArray(state.payload.clusters)
        ? state.payload.clusters
        : [];
      state.last_error = null;
      return state.payload;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      return null;
    }
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

      if (!state.clusters.length) {
        await load();
      }

      if (!state.clusters.length) {
        state.last_error = "No cluster data available";
        return false;
      }

      clearExisting();

      const group = new THREE.Group();
      group.name = "BLACK_DRAGON_BOOK_CLUSTER_GROUP";

      const meshes = [];

      for (const cluster of state.clusters) {
        const mesh = buildClusterMesh(cluster);
        group.add(mesh);
        meshes.push(mesh);
      }

      scene.add(group);

      state.clusterGroup = group;
      state.clusterMeshes = meshes;
      state.mounted = true;
      state.last_error = null;

      console.info("[BlackDragonBooksClusterRenderer] mounted", {
        clusters: meshes.length,
        scene_path: state.scene_path
      });

      return true;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      console.error("[BlackDragonBooksClusterRenderer] mount failed", err);
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

  function getClusters() {
    return state.clusters.slice();
  }

  function getRenderedClusters() {
    return state.clusterMeshes.slice();
  }

  function getDebugState() {
    return {
      version: "black_dragon_books_cluster_renderer_v1",
      mounted: state.mounted,
      clusters: state.clusters.length,
      rendered_clusters: state.clusterMeshes.length,
      has_group: !!state.clusterGroup,
      scene_path: state.scene_path,
      last_error: state.last_error
    };
  }

  G.load = load;
  G.mount = mount;
  G.clearExisting = clearExisting;
  G.getClusters = getClusters;
  G.getRenderedClusters = getRenderedClusters;
  G.getDebugState = getDebugState;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => mountWithRetry(1), 4500);
  });

  if (document.readyState !== "loading") {
    setTimeout(() => mountWithRetry(1), 4500);
  }
})();



