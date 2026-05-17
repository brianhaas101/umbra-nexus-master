(function () {
  function Pass() {
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.renderToScreen = false;
  }

  Pass.prototype = {
    constructor: Pass,

    setSize: function () {},

    render: function () {
      console.error("[Pass] .render() must be implemented in derived pass.");
    }
  };

  Pass.FullScreenQuad = (function () {
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    function FullScreenQuad(material) {
      this._mesh = new THREE.Mesh(geometry, material);
    }

    Object.defineProperty(FullScreenQuad.prototype, "material", {
      get: function () {
        return this._mesh.material;
      },
      set: function (value) {
        this._mesh.material = value;
      }
    });

    Object.assign(FullScreenQuad.prototype, {
      dispose: function () {
        this._mesh.geometry.dispose();
      },

      render: function (renderer) {
        renderer.render(this._mesh, camera);
      }
    });

    return FullScreenQuad;
  })();

  window.Pass = Pass;
})();