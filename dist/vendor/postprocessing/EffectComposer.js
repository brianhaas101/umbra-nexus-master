(function () {
  const ShaderPass = window.ShaderPass;
  const CopyShader = window.CopyShader;

  function EffectComposer(renderer, renderTarget) {
    this.renderer = renderer;

    const size = renderer.getSize(new THREE.Vector2());
    const pixelRatio = renderer.getPixelRatio();

    if (renderTarget === undefined) {
      renderTarget = new THREE.WebGLRenderTarget(size.x * pixelRatio, size.y * pixelRatio, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
      renderTarget.texture.name = "EffectComposer.rt1";
    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = "EffectComposer.rt2";

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.renderToScreen = true;
    this.passes = [];

    this.copyPass = new ShaderPass(CopyShader);
  }

  Object.assign(EffectComposer.prototype, {
    swapBuffers: function () {
      const tmp = this.readBuffer;
      this.readBuffer = this.writeBuffer;
      this.writeBuffer = tmp;
    },

    addPass: function (pass) {
      this.passes.push(pass);
      const size = this.renderer.getSize(new THREE.Vector2());
      const pixelRatio = this.renderer.getPixelRatio();
      pass.setSize(size.x * pixelRatio, size.y * pixelRatio);
    },

    render: function (deltaTime) {
      let maskActive = false;
      const currentRenderTarget = this.renderer.getRenderTarget();

      for (let i = 0; i < this.passes.length; i++) {
        const pass = this.passes[i];
        if (pass.enabled === false) continue;

        pass.renderToScreen = (this.renderToScreen && i === this.passes.length - 1);
        pass.render(this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive);

        if (pass.needsSwap) {
          this.swapBuffers();
        }
      }

      this.renderer.setRenderTarget(currentRenderTarget);
    },

    setSize: function (width, height) {
      this.renderTarget1.setSize(width, height);
      this.renderTarget2.setSize(width, height);

      for (let i = 0; i < this.passes.length; i++) {
        this.passes[i].setSize(width, height);
      }
    }
  });

  window.EffectComposer = EffectComposer;
})();