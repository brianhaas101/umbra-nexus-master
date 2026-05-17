(function () {
  const Pass = window.Pass;

  function ShaderPass(shader, textureID) {
    Pass.call(this);

    this.textureID = textureID !== undefined ? textureID : "tDiffuse";

    this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
    this.material = new THREE.ShaderMaterial({
      defines: shader.defines || {},
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    });

    this.fsQuad = new Pass.FullScreenQuad(this.material);
  }

  ShaderPass.prototype = Object.assign(Object.create(Pass.prototype), {
    constructor: ShaderPass,

    render: function (renderer, writeBuffer, readBuffer) {
      if (this.uniforms[this.textureID]) {
        this.uniforms[this.textureID].value = readBuffer.texture;
      }

      this.fsQuad.material = this.material;

      if (this.renderToScreen) {
        renderer.setRenderTarget(null);
        if (this.clear) renderer.clear();
        this.fsQuad.render(renderer);
      } else {
        renderer.setRenderTarget(writeBuffer);
        if (this.clear) renderer.clear();
        this.fsQuad.render(renderer);
      }
    }
  });

  window.ShaderPass = ShaderPass;
})();