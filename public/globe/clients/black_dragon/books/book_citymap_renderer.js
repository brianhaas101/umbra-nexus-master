(function () {
  "use strict";

  const G = window.BlackDragonBooksCityMapRenderer =
    window.BlackDragonBooksCityMapRenderer || {};

  let state = {

  optimization: {
    world_node_limit: 180,
    world_pulses_enabled: false,
    world_halos_enabled: false,
    citymap_full_detail: true,
    current_mode: "UNKNOWN"
  },
    mounted: false,
    nodeMeshes: [],
    pulseMeshes: [],
    haloMeshes: [],
    nodeGroup: null,
    selectedMesh: null,
    selectedEntityId: null,
    pulseTick: 0,
    pulseTimer: null,
    last_error: null,
    rendered_nodes: 0,
    scene_path: null,
    last_pick: null
  };

  function getThree() {
    return window.THREE || null;
  }

  function getNodeDataset() {
    return (
      window.UMBRA_DATA &&
      window.UMBRA_DATA.client_layers &&
      Array.isArray(window.UMBRA_DATA.client_layers.black_dragon_books_map_nodes)
    )
      ? window.UMBRA_DATA.client_layers.black_dragon_books_map_nodes
      : [];
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
      ["window.UMBRA_RUNTIME", window.UMBRA_RUNTIME],
      ["window.UMBRA_DATA", window.UMBRA_DATA]
    ];

    for (const [label, obj] of roots) {
      const scene = findSceneRecursive(obj, 8);
      if (scene) {
        state.scene_path = label;
        return scene;
      }
    }

    const fallbackNames = Object.keys(window)
      .filter(k => /umbra|nexus|globe|city|scene|runtime/i.test(k))
      .slice(0, 120);

    for (const key of fallbackNames) {
      try {
        const scene = findSceneRecursive(window[key], 7);
        if (scene) {
          state.scene_path = "window." + key;
          return scene;
        }
      } catch (err) {}
    }

    return null;
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

  function scaleHint(node) {
    const s =
      node &&
      node.render &&
      typeof node.render.scale_hint === "number"
        ? node.render.scale_hint
        : 1;

    return Math.max(0.6, s);
  }

  
  function resolveMode() {
    try {
      const mode =
        window.UmbraGlobe &&
        window.UmbraGlobe.state &&
        window.UmbraGlobe.state.mode;

      if (typeof mode === "string") {
        state.optimization.current_mode = mode;
        return mode;
      }
    } catch (err) {}

    return "WORLD";
  }

  function worldModeActive() {
    return resolveMode() !== "CITY_MAP";
  }

  function shouldRenderDetailedNode(index) {
    if (!worldModeActive()) {
      return true;
    }

    return index < state.optimization.world_node_limit;
  }

  function shouldRenderPulse() {
    if (!worldModeActive()) {
      return true;
    }

    return !!state.optimization.world_pulses_enabled;
  }

  function shouldRenderHalo() {
    if (!worldModeActive()) {
      return true;
    }

    return !!state.optimization.world_halos_enabled;
  }


function buildNode(node) {
    const THREE = getThree();
    const scale = scaleHint(node);
    const color = intensityColor(node.visual_intensity);

    const baseMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.75 * scale, 18, 18),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.98,
        depthWrite: false
      })
    );

    const haloMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.55 * scale, 18, 18),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide,
        depthWrite: false
      })
    );

    const pulseMesh = new THREE.Mesh(
      new THREE.RingGeometry(1.2 * scale, 1.8 * scale, 32),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );

    const pos = latLonToVector3(Number(node.lat), Number(node.lon), 104);

    baseMesh.position.copy(pos);
    haloMesh.position.copy(pos);
    pulseMesh.position.copy(pos);
    pulseMesh.lookAt(0, 0, 0);

    const meta = {
      node_id: node.node_id,
      entity_id: node.entity_id,
      client_id: node.client_id,
      module: node.module,
      organization_name: node.organization_name,
      label: node.label,
      leader_role: node.leader_role,
      organization_type: node.organization_type,
      visual_score: node.visual_score,
      visual_intensity: node.visual_intensity,
      queue_status: node.queue_status,
      recommended_action: node.recommended_action,
      response_status: node.response_status,
      response_classification: node.response_classification,
      black_dragon_book_target: true
    };

    baseMesh.userData = meta;
    haloMesh.userData = meta;
    pulseMesh.userData = meta;

    return {

      optimization: state.optimization,
      world_mode_active: worldModeActive(),
 baseMesh, haloMesh, pulseMesh };
  }

  function clearExisting() {
    const scene = resolveScene();

    if (state.pulseTimer) {
      clearInterval(state.pulseTimer);
      state.pulseTimer = null;
    }

    if (state.nodeGroup && scene) {
      try {
        scene.remove(state.nodeGroup);
      } catch (err) {}
    }

    state.nodeMeshes = [];
    state.pulseMeshes = [];
    state.haloMeshes = [];
    state.nodeGroup = null;
    state.rendered_nodes = 0;
    state.selectedMesh = null;
    state.selectedEntityId = null;
  }

  function startPulseLoop() {
    if (state.pulseTimer) {
      clearInterval(state.pulseTimer);
    }

    state.pulseTimer = setInterval(() => {
      state.pulseTick += 0.045;

      const t = state.pulseTick;

      for (const mesh of state.pulseMeshes) {
        mesh.scale.setScalar(1 + Math.sin(t) * 0.16);

        if (mesh.material) {
          mesh.material.opacity = 0.16 + ((Math.sin(t) + 1) * 0.16);
        }
      }

      for (const mesh of state.haloMeshes) {
        if (mesh.material) {
          mesh.material.opacity = 0.10 + ((Math.sin(t) + 1) * 0.05);
        }
      }
    }, 33);
  }

  function emphasizeSelected(mesh) {
    for (const node of state.nodeMeshes) {
      if (node.material) node.material.opacity = 0.82;
      node.scale.setScalar(1);
    }

    if (mesh && mesh.material) {
      mesh.material.opacity = 1;
      mesh.scale.setScalar(1.55);
    }
  }

  function syncSelection(mesh) {
    if (!mesh || !mesh.userData) return false;

    const data = mesh.userData;

    state.selectedMesh = mesh;
    state.selectedEntityId = data.entity_id;
    state.last_pick = {
      entity_id: data.entity_id,
      organization_name: data.organization_name,
      visual_score: data.visual_score,
      visual_intensity: data.visual_intensity,
      picked_at: new Date().toISOString()
    };

    emphasizeSelected(mesh);

    window.UMBRA_SELECTED_CLIENT_TARGET = {
      source: "BLACK_DRAGON_BOOK_TARGET",
      ...data
    };

    window.dispatchEvent(
      new CustomEvent("umbra:blackDragonBookTargetSelected", {
        detail: window.UMBRA_SELECTED_CLIENT_TARGET
      })
    );

    console.info("[BlackDragonBooksCityMapRenderer] selected", state.last_pick);

    return true;
  }

  function mount() {
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

      const nodes = getNodeDataset();

      if (!nodes.length) {
        state.last_error = "No Black Dragon map nodes available";
        return false;
      }

      clearExisting();

      const group = new THREE.Group();
      group.name = "BLACK_DRAGON_BOOK_NODE_GROUP";

      const rendered = [];
      const pulseMeshes = [];
      const haloMeshes = [];

      for (const [index, node] of nodes.entries()) {

        if (!shouldRenderDetailedNode(index)) {
          continue;
        }
        const built = buildNode(node);

        if (shouldRenderHalo()) {
          group.add(built.haloMesh);
          haloMeshes.push(built.haloMesh);
        }

        if (shouldRenderPulse()) {
          group.add(built.pulseMesh);
          pulseMeshes.push(built.pulseMesh);
        }

        group.add(built.baseMesh);

        rendered.push(built.baseMesh);
        
      }

      scene.add(group);

      state.nodeGroup = group;
      state.nodeMeshes = rendered;
      state.pulseMeshes = pulseMeshes;
      state.haloMeshes = haloMeshes;
      state.mounted = true;
      state.rendered_nodes = rendered.length;
      state.last_error = null;

      startPulseLoop();

      console.info("[BlackDragonBooksCityMapRenderer] mounted", {
        rendered_nodes: rendered.length,
        scene_path: state.scene_path
      });

      return true;
    } catch (err) {
      state.last_error = String(err && err.message ? err.message : err);
      console.error("[BlackDragonBooksCityMapRenderer] mount failed", err);
      return false;
    }
  }

  function mountWithRetry(attempt) {
    attempt = attempt || 1;

    const ok = mount();

    if (!ok && attempt < 15) {
      setTimeout(() => mountWithRetry(attempt + 1), 1000);
    }
  }

  function selectByEntityId(entityId) {
    const mesh = state.nodeMeshes.find(m =>
      m.userData &&
      String(m.userData.entity_id) === String(entityId)
    );

    if (!mesh) return false;

    return syncSelection(mesh);
  }

  function getRenderedNodes() {
    return state.nodeMeshes.slice();
  }

  function getDebugState() {
    return {

      optimization: state.optimization,
      world_mode_active: worldModeActive(),

      version: "black_dragon_books_citymap_renderer_v1_batch_048",
      mounted: state.mounted,
      rendered_nodes: state.rendered_nodes,
      pulse_meshes: state.pulseMeshes.length,
      halo_meshes: state.haloMeshes.length,
      has_group: !!state.nodeGroup,
      selected_entity_id: state.selectedEntityId,
      scene_path: state.scene_path,
      last_pick: state.last_pick,
      last_error: state.last_error
    };
  }

  G.mount = mount;
  G.clearExisting = clearExisting;
  G.getRenderedNodes = getRenderedNodes;
  G.getDebugState = getDebugState;
  G.resolveScene = resolveScene;
  G.selectByEntityId = selectByEntityId;
  G.syncSelection = syncSelection;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(() => mountWithRetry(1), 3500);
  });

  if (document.readyState !== "loading") {
    setTimeout(() => mountWithRetry(1), 3500);
  }
})();








