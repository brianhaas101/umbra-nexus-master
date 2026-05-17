(function () {
  const Pass = window.Pass;

  function RenderPass(scene, camera, overrideMaterial, clearColor, clearAlpha) {
    Pass.call(this);

    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;

    this.clearColor = clearColor;
    this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;

    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
  }

  RenderPass.prototype = Object.assign(Object.create(Pass.prototype), {
    constructor: RenderPass,

    render: function (renderer, writeBuffer, readBuffer) {
      const oldAutoClear = renderer.autoClear;
      renderer.autoClear = false;

      let oldClearColor, oldClearAlpha;
      if (this.clearColor !== undefined && this.clearColor !== null) {
        oldClearColor = renderer.getClearColor(new THREE.Color()).clone();
        oldClearAlpha = renderer.getClearAlpha();
        renderer.setClearColor(this.clearColor, this.clearAlpha);
      }

      const oldOverrideMaterial = this.scene.overrideMaterial;
      if (this.overrideMaterial !== undefined) {
        this.scene.overrideMaterial = this.overrideMaterial;
      }

      if (this.clearDepth) renderer.clearDepth();

      renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
      if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
      renderer.render(this.scene, this.camera);

      if (this.overrideMaterial !== undefined) {
        this.scene.overrideMaterial = oldOverrideMaterial;
      }

      if (this.clearColor !== undefined && this.clearColor !== null) {
        renderer.setClearColor(oldClearColor, oldClearAlpha);
      }

      renderer.autoClear = oldAutoClear;
    }
  });

  window.RenderPass = RenderPass;
})();