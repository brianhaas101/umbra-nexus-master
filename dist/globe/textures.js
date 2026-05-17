// public/globe/textures.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) return console.error("[textures] window.UmbraGlobe missing.");

  console.log("[SIGNATURE] globe/textures.js LOADED", new Date().toISOString());

  // ---- STATE (NO REASSIGN) ----
  try { G.hardenState?.(); } catch {}
  const st = (G.state && typeof G.state === "object") ? G.state : null;
  if (!st) return console.error("[textures] G.state missing/unusable (core must load first).");

  if (!window.THREE || !THREE.TextureLoader) {
    console.error("[textures] THREE missing (TextureLoader unavailable).");
  }

  function ensureTextureCache() {
    if (!st._textureCache || typeof st._textureCache.get !== "function") {
      st._textureCache = new Map();
    }
    if (typeof st._texLoadToken !== "number") st._texLoadToken = 0;
    return st._textureCache;
  }

  function markOwned(tex, url) {
    if (!tex) return;
    tex.userData = tex.userData || {};
    tex.userData.__umbraOwned = true;
    tex.userData.__umbraUrl = String(url || "");
  }

  function sortedKeysFrom(paths) {
    const p = (paths && typeof paths === "object") ? paths : {};
    return Object.keys(p).sort();
  }

  function nullFilledOut(paths) {
    const out = {};
    const keys = sortedKeysFrom(paths);
    for (const k of keys) out[k] = null;
    return out;
  }

  function getRendererMaxAnisotropy() {
    try {
      const r = G.renderer || st.renderer || null;
      const cap = r?.capabilities?.getMaxAnisotropy?.();
      return Number.isFinite(cap) && cap > 0 ? cap : 1;
    } catch {
      return 1;
    }
  }

  function isColorTextureKey(key) {
    const k = String(key || "").toLowerCase();
    return (
      k.includes("day") ||
      k.includes("diffuse") ||
      k.includes("albedo") ||
      k.includes("basecolor") ||
      k.includes("base_color") ||
      k.includes("color") ||
      k.includes("map")
    );
  }

  function isLinearTextureKey(key) {
    const k = String(key || "").toLowerCase();
    return (
      k.includes("normal") ||
      k.includes("rough") ||
      k.includes("metal") ||
      k.includes("bump") ||
      k.includes("height") ||
      k.includes("ao") ||
      k.includes("alpha") ||
      k.includes("mask") ||
      k.includes("displace") ||
      k.includes("spec")
    );
  }

  function applyTextureQuality(tex, key) {
    if (!tex || !window.THREE) return tex;

    const maxAniso = getRendererMaxAnisotropy();
    const hasMipmaps = tex.generateMipmaps !== false;

    try {
      tex.anisotropy = Math.max(1, Math.min(8, maxAniso));
    } catch {}

    try {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    } catch {}

    try {
      tex.flipY = true;
    } catch {}

    try {
      tex.generateMipmaps = true;
    } catch {}

    try {
      tex.minFilter = hasMipmaps ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
    } catch {}

    try {
      if ("colorSpace" in tex) {
        if (isColorTextureKey(key)) {
          tex.colorSpace = THREE.SRGBColorSpace;
        } else if (isLinearTextureKey(key)) {
          tex.colorSpace = THREE.NoColorSpace;
        }
      } else if ("encoding" in tex) {
        if (isColorTextureKey(key)) {
          tex.encoding = THREE.sRGBEncoding;
        } else if (isLinearTextureKey(key)) {
          tex.encoding = THREE.LinearEncoding;
        }
      }
    } catch {}

    try {
      tex.needsUpdate = true;
    } catch {}

    return tex;
  }

  G.loadTextures = function loadTextures(paths, onDone) {
    if (typeof onDone !== "function") {
      console.warn("[textures] onDone missing");
      return;
    }

    const keys = sortedKeysFrom(paths);
    if (!keys.length) {
      try { onDone({}); } catch {}
      return;
    }

    if (!window.THREE || !THREE.TextureLoader) {
      try { onDone(nullFilledOut(paths)); } catch {}
      return;
    }

    const p = (paths && typeof paths === "object") ? paths : {};
    const cache = ensureTextureCache();

    const myToken = ++st._texLoadToken;

    const loader = new THREE.TextureLoader();
    try { loader.crossOrigin = "anonymous"; } catch {}

    const out = {};
    let finished = 0;
    let doneCalled = false;

    const timers = new Map();
    const TIMEOUT_MS = 90000;

    function safeDoneOnce() {
      if (doneCalled) return;
      doneCalled = true;

      try {
        for (const t of timers.values()) clearTimeout(t);
        timers.clear();
      } catch {}

      for (const k of keys) {
        if (!(k in out)) out[k] = null;
      }

      try { onDone(out); }
      catch (e) { console.error("[textures] onDone threw:", e); }
    }

    function finishOne(k, texOrNull) {
      if (st._texLoadToken !== myToken) return;

      out[k] = texOrNull ?? null;
      finished++;

      const t = timers.get(k);
      if (t) {
        clearTimeout(t);
        timers.delete(k);
      }

      if (finished >= keys.length) safeDoneOnce();
    }

    try {
      for (const k of keys) {
        const url = String(p[k] || "").trim();

        if (!url) {
          finishOne(k, null);
          continue;
        }

        const cached = cache.get(url) || null;
        if (cached && cached.isTexture) {
          applyTextureQuality(cached, k);
          finishOne(k, cached);
          continue;
        }

        const timer = setTimeout(() => {
          if (st._texLoadToken !== myToken) return;
          try { G.util?.err?.("[textures] TIMEOUT:", url); } catch {}
          finishOne(k, null);
        }, TIMEOUT_MS);
        timers.set(k, timer);

        loader.load(
          url,
          (tex) => {
            if (st._texLoadToken !== myToken) return;

            const t = tex || null;
            if (t) {
              markOwned(t, url);
              applyTextureQuality(t, k);
              cache.set(url, t);
            }

            finishOne(k, t);
          },
          undefined,
          (err) => {
            if (st._texLoadToken !== myToken) return;
            try { G.util?.err?.("[textures] Failed:", url, err); }
            catch { console.error("[textures] Failed:", url, err); }
            finishOne(k, null);
          }
        );
      }
    } catch (e) {
      console.error("[textures] fatal:", e);
      safeDoneOnce();
    }
  };
})();






