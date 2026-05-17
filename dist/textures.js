// public/globe/textures.js
(function () {
  const G = window.UmbraGlobe;
  if (!G) {
    console.error("[textures] window.UmbraGlobe missing (load core.js first).");
    return;
  }

  /**
   * TEXTURE LOADER CONTRACT (FOUNDER v1)
   * - textures.js ONLY loads textures and returns them in { key: texture }
   * - NO colorSpace/encoding decisions here (layers.js owns it per texture role)
   * - Minimal safe tuning only (wrap/filter/aniso), but avoid role-based changes
   */

  G.loadTextures = function loadTextures(paths, onDone) {
    const cb = (typeof onDone === "function") ? onDone : function () {};
    const loader = new THREE.TextureLoader();
    const out = {};

    const p = (paths && typeof paths === "object") ? paths : {};
    const keys = Object.keys(p);
    if (!keys.length) return cb(out);

    let finished = 0;
    let called = false;

    function finishOnce() {
      if (called) return;
      called = true;
      cb(out);
    }

    function doneOne() {
      finished++;
      if (finished >= keys.length) finishOnce();
    }

    // NOTE: renderer may or may not exist yet; keep it safe.
    function getMaxAniso() {
      try {
        return G.state?.renderer?.capabilities?.getMaxAnisotropy?.() || 1;
      } catch {
        return 1;
      }
    }

    keys.forEach((k) => {
      const url = p[k];
      if (!url) {
        out[k] = null;
        return doneOne();
      }

      loader.load(
        url,
        (tex) => {
          try {
            // Minimal safe tuning ONLY. Role-based tuning happens in layers.js.
            const maxAniso = getMaxAniso();
            tex.anisotropy = Math.min(16, maxAniso);

            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;

            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;

            // IMPORTANT:
            // Do NOT set tex.colorSpace / tex.encoding here.
            // layers.js decides:
            //   - base/starfield => sRGB
            //   - night/emissive => linear

            tex.needsUpdate = true;
            out[k] = tex;

            G.util?.log?.(`[textures] loaded: ${k} (${url})`);
          } catch (e) {
            console.warn("[textures] tune error:", k, e);
            out[k] = tex || null;
          }
          doneOne();
        },
        undefined,
        (err) => {
          console.error(`[textures] FAILED: ${k} -> ${url}`, err);
          out[k] = null;
          doneOne();
        }
      );
    });
  };
})();
