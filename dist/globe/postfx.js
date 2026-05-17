// public/globe/postfx.js
(function () {
  const G = window.UmbraGlobe;
  const T = window.THREE;

  if (!G) {
    console.error("[postfx] window.UmbraGlobe missing.");
    return;
  }
  if (!T) {
    console.error("[postfx] window.THREE missing.");
    return;
  }

  console.log("[SIGNATURE] globe/postfx.js LOADED", new Date().toISOString());

  function resolveComposerStack() {
    const EffectComposer =
      T.EffectComposer ||
      window.EffectComposer ||
      window.THREEEffectComposer ||
      null;

    const RenderPass =
      T.RenderPass ||
      window.RenderPass ||
      null;

    const UnrealBloomPass =
      T.UnrealBloomPass ||
      window.UnrealBloomPass ||
      null;

    return {
      EffectComposer,
      RenderPass,
      UnrealBloomPass,
      Vector2: T.Vector2 || null
    };
  }

  function hasComposerStack() {
    const stack = resolveComposerStack();
    return !!(
      stack.EffectComposer &&
      stack.RenderPass &&
      stack.UnrealBloomPass &&
      stack.Vector2
    );
  }

  function safeDisposePass(pass) {
    if (!pass) return;
    try { pass.dispose?.(); } catch {}
  }

  function safeDisposeComposer(composer) {
    if (!composer) return;
    try {
      if (Array.isArray(composer.passes)) {
        for (const pass of composer.passes) safeDisposePass(pass);
      }
    } catch {}
    try { composer.renderTarget1?.dispose?.(); } catch {}
    try { composer.renderTarget2?.dispose?.(); } catch {}
  }

  function getContainerSize() {
    const st = G.state || {};
    const el = st.container || document.getElementById("globeContainer");
    if (!el) return { width: 800, height: 600 };

    const rect = el.getBoundingClientRect();
    return {
      width: Math.max(2, Math.round(rect.width || 800)),
      height: Math.max(2, Math.round(rect.height || 600))
    };
  }

  function ensurePostFXState() {
    const st = G.state || {};
    if (!st.postfx || typeof st.postfx !== "object") {
      st.postfx = {};
    }

    if (!st.postfx.settings || typeof st.postfx.settings !== "object") {
      st.postfx.settings = {
        enabled: true,
        bloomStrength: 0.38,
        bloomRadius: 0.18,
        bloomThreshold: 0.82,
        exposureMultiplier: 1.0
      };
    }

    if (typeof st.postfx.enabled !== "boolean") {
      st.postfx.enabled = true;
    }

    if (!("composer" in st.postfx)) st.postfx.composer = null;
    if (!("renderPass" in st.postfx)) st.postfx.renderPass = null;
    if (!("bloomPass" in st.postfx)) st.postfx.bloomPass = null;
    if (!("ready" in st.postfx)) st.postfx.ready = false;
    if (!("supported" in st.postfx)) st.postfx.supported = false;

    return st.postfx;
  }

  G.disposePostFX = function disposePostFX() {
    const st = G.state || {};
    const fx = ensurePostFXState();

    safeDisposeComposer(fx.composer);

    fx.composer = null;
    fx.renderPass = null;
    fx.bloomPass = null;
    fx.ready = false;
    fx.supported = hasComposerStack();

    if (st.renderer) {
      try { st.renderer.autoClear = true; } catch {}
    }

    console.log("[postfx] DISPOSED");
  };

  G.initPostFX = function initPostFX() {
    const st = G.state || {};
    const fx = ensurePostFXState();
    const stack = resolveComposerStack();

    fx.supported = !!(
      stack.EffectComposer &&
      stack.RenderPass &&
      stack.UnrealBloomPass &&
      stack.Vector2
    );

    if (!st.renderer || !st.scene || !st.camera) {
      console.warn("[postfx] init skipped: renderer/scene/camera missing.");
      fx.ready = false;
      return false;
    }

    if (!fx.supported) {
      console.warn("[postfx] Composer stack unavailable. Falling back to plain renderer.", {
        EffectComposer: !!stack.EffectComposer,
        RenderPass: !!stack.RenderPass,
        UnrealBloomPass: !!stack.UnrealBloomPass,
        Vector2: !!stack.Vector2
      });
      fx.ready = false;
      return false;
    }

    G.disposePostFX();

    const size = getContainerSize();

    try {
      const composer = new stack.EffectComposer(st.renderer);
      composer.setSize(size.width, size.height);

      const renderPass = new stack.RenderPass(st.scene, st.camera);

      const bloomPass = new stack.UnrealBloomPass(
        new stack.Vector2(size.width, size.height),
        fx.settings.bloomStrength,
        fx.settings.bloomRadius,
        fx.settings.bloomThreshold
      );

      composer.addPass(renderPass);
      composer.addPass(bloomPass);

      fx.composer = composer;
      fx.renderPass = renderPass;
      fx.bloomPass = bloomPass;
      fx.ready = true;
      fx.supported = true;

      try { st.renderer.autoClear = true; } catch {}

      console.log("[postfx] READY", {
        width: size.width,
        height: size.height,
        bloomStrength: fx.settings.bloomStrength,
        bloomRadius: fx.settings.bloomRadius,
        bloomThreshold: fx.settings.bloomThreshold
      });

      return true;
    } catch (err) {
      console.error("[postfx] init failed:", err);
      G.disposePostFX();
      return false;
    }
  };

  G.updatePostFXSettings = function updatePostFXSettings(partial) {
    const fx = ensurePostFXState();
    const p = (partial && typeof partial === "object") ? partial : {};

    for (const k of Object.keys(p)) {
      if (k in fx.settings) fx.settings[k] = p[k];
    }

    if (fx.bloomPass) {
      try { fx.bloomPass.strength = Number(fx.settings.bloomStrength) || 0; } catch {}
      try { fx.bloomPass.radius = Number(fx.settings.bloomRadius) || 0; } catch {}
      try { fx.bloomPass.threshold = Number(fx.settings.bloomThreshold) || 0; } catch {}
    }

    console.log("[postfx] SETTINGS UPDATED", {
      bloomStrength: fx.settings.bloomStrength,
      bloomRadius: fx.settings.bloomRadius,
      bloomThreshold: fx.settings.bloomThreshold
    });
  };

  G.resizePostFX = function resizePostFX(width, height) {
    const st = G.state || {};
    const fx = ensurePostFXState();

    const w = Math.max(2, Number(width) || getContainerSize().width);
    const h = Math.max(2, Number(height) || getContainerSize().height);

    if (fx.composer) {
      try { fx.composer.setSize(w, h); } catch {}
    }

    if (fx.bloomPass && fx.bloomPass.resolution) {
      try { fx.bloomPass.resolution.set(w, h); } catch {}
    }

    if (st.renderer) {
      try { st.renderer.setSize(w, h, false); } catch {}
    }

    console.log("[postfx] RESIZED", { width: w, height: h });
  };

  G.setPostFXEnabled = function setPostFXEnabled(enabled) {
    const fx = ensurePostFXState();
    fx.enabled = !!enabled;
    console.log("[postfx] ENABLED =", fx.enabled);
  };

  G.renderScene = function renderScene(deltaTime) {
    const st = G.state || {};
    const fx = ensurePostFXState();

    if (!st.renderer || !st.scene || !st.camera) return;

    const mode = String(st.mode || "").toUpperCase();
    const allowPostFX = mode !== "CITY_MAP";

    if (
      fx.settings &&
      typeof fx.settings.exposureMultiplier === "number" &&
      st.renderer &&
      typeof st.renderer.toneMappingExposure === "number"
    ) {
      // reserved tuning hook
    }

    if (allowPostFX && fx.enabled && fx.ready && fx.composer) {
      try {
        fx.composer.render(deltaTime);
        return;
      } catch (err) {
        console.error("[postfx] composer render failed, falling back:", err);
        fx.ready = false;
      }
    }

    try {
      st.renderer.setRenderTarget(null);

      if (mode === "CITY_MAP") {
        st.renderer.autoClear = true;
        st.renderer.setClearColor(0x000000, 1);
        st.renderer.clear(true, true, true);
      }

      st.renderer.render(st.scene, st.camera);
    } catch (err) {
      console.error("[postfx] renderer render failed:", err);
    }
  };

  G.getPostFXDebug = function getPostFXDebug() {
    const fx = ensurePostFXState();
    const stack = resolveComposerStack();
    const st = G.state || {};
    const mode = String(st.mode || "").toUpperCase();

    return {
      supported: !!fx.supported,
      ready: !!fx.ready,
      enabled: !!fx.enabled,
      mode,
      allowPostFX: mode !== "CITY_MAP",
      bloomStrength: fx.settings?.bloomStrength ?? null,
      bloomRadius: fx.settings?.bloomRadius ?? null,
      bloomThreshold: fx.settings?.bloomThreshold ?? null,
      composerPasses: Array.isArray(fx.composer?.passes)
        ? fx.composer.passes.map((p) => p?.constructor?.name || "UnknownPass")
        : [],
      stack: {
        EffectComposer: !!stack.EffectComposer,
        RenderPass: !!stack.RenderPass,
        UnrealBloomPass: !!stack.UnrealBloomPass,
        Vector2: !!stack.Vector2
      }
    };
  };
})();