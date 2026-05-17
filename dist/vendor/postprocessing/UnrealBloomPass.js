(function () {
  const Pass = window.Pass;
  const ShaderPass = window.ShaderPass;
  const CopyShader = window.CopyShader;
  const LuminosityHighPassShader = window.LuminosityHighPassShader;

  function UnrealBloomPass(resolution, strength, radius, threshold) {
    Pass.call(this);

    this.strength = strength !== undefined ? strength : 1;
    this.radius = radius || 0;
    this.threshold = threshold || 0;

    this.resolution = resolution ? resolution.clone() : new THREE.Vector2(256, 256);

    this.clearColor = new THREE.Color(0, 0, 0);

    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;

    let resx = Math.round(this.resolution.x / 2);
    let resy = Math.round(this.resolution.y / 2);

    this.renderTargetBright = new THREE.WebGLRenderTarget(resx, resy, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    });
    this.renderTargetBright.texture.name = "UnrealBloomPass.bright";

    for (let i = 0; i < this.nMips; i++) {
      const rtH = new THREE.WebGLRenderTarget(resx, resy, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
      rtH.texture.name = "UnrealBloomPass.h" + i;
      this.renderTargetsHorizontal.push(rtH);

      const rtV = new THREE.WebGLRenderTarget(resx, resy, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat
      });
      rtV.texture.name = "UnrealBloomPass.v" + i;
      this.renderTargetsVertical.push(rtV);

      resx = Math.max(1, Math.round(resx / 2));
      resy = Math.max(1, Math.round(resy / 2));
    }

    const highPassShader = LuminosityHighPassShader;
    this.highPassUniforms = THREE.UniformsUtils.clone(highPassShader.uniforms);
    this.highPassUniforms["luminosityThreshold"].value = threshold;
    this.highPassUniforms["smoothWidth"].value = 0.01;

    this.materialHighPassFilter = new THREE.ShaderMaterial({
      uniforms: this.highPassUniforms,
      vertexShader: highPassShader.vertexShader,
      fragmentShader: highPassShader.fragmentShader
    });

    this.separableBlurMaterials = [];
    const kernelSizes = [3, 5, 7, 9, 11];
    resx = Math.round(this.resolution.x / 2);
    resy = Math.round(this.resolution.y / 2);

    for (let i = 0; i < this.nMips; i++) {
      const material = this.getSeparableBlurMaterial(kernelSizes[i]);
      material.uniforms["invSize"].value = new THREE.Vector2(1 / resx, 1 / resy);
      this.separableBlurMaterials.push(material);

      resx = Math.max(1, Math.round(resx / 2));
      resy = Math.max(1, Math.round(resy / 2));
    }

    this.compositeMaterial = this.getCompositeMaterial(this.nMips);
    this.compositeMaterial.uniforms["blurTexture1"].value = this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms["blurTexture2"].value = this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms["blurTexture3"].value = this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms["blurTexture4"].value = this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms["blurTexture5"].value = this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms["bloomStrength"].value = strength;
    this.compositeMaterial.uniforms["bloomRadius"].value = 0.1;
    this.compositeMaterial.needsUpdate = true;

    this.copyUniforms = THREE.UniformsUtils.clone(CopyShader.uniforms);
    this.copyUniforms["opacity"].value = 1.0;

    this.materialCopy = new THREE.ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });

    this.fsQuad = new Pass.FullScreenQuad(null);
    this.needsSwap = false;
  }

  UnrealBloomPass.prototype = Object.assign(Object.create(Pass.prototype), {
    constructor: UnrealBloomPass,

    dispose: function () {
      for (let i = 0; i < this.renderTargetsHorizontal.length; i++) {
        this.renderTargetsHorizontal[i].dispose();
      }
      for (let i = 0; i < this.renderTargetsVertical.length; i++) {
        this.renderTargetsVertical[i].dispose();
      }
      this.renderTargetBright.dispose();
    },

    setSize: function (width, height) {
      let resx = Math.round(width / 2);
      let resy = Math.round(height / 2);

      this.renderTargetBright.setSize(resx, resy);

      for (let i = 0; i < this.nMips; i++) {
        this.renderTargetsHorizontal[i].setSize(resx, resy);
        this.renderTargetsVertical[i].setSize(resx, resy);

        this.separableBlurMaterials[i].uniforms["invSize"].value = new THREE.Vector2(1 / resx, 1 / resy);

        resx = Math.max(1, Math.round(resx / 2));
        resy = Math.max(1, Math.round(resy / 2));
      }
    },

    render: function (renderer, writeBuffer, readBuffer) {
      const oldClearColor = renderer.getClearColor(new THREE.Color()).clone();
      const oldClearAlpha = renderer.getClearAlpha();
      const oldAutoClear = renderer.autoClear;
      renderer.autoClear = false;

      renderer.setClearColor(this.clearColor, 0);

      this.highPassUniforms["tDiffuse"].value = readBuffer.texture;
      this.highPassUniforms["luminosityThreshold"].value = this.threshold;

      this.fsQuad.material = this.materialHighPassFilter;
      renderer.setRenderTarget(this.renderTargetBright);
      renderer.clear();
      this.fsQuad.render(renderer);

      let inputRenderTarget = this.renderTargetBright;

      for (let i = 0; i < this.nMips; i++) {
        this.fsQuad.material = this.separableBlurMaterials[i];

        this.separableBlurMaterials[i].uniforms["colorTexture"].value = inputRenderTarget.texture;
        this.separableBlurMaterials[i].uniforms["direction"].value = UnrealBloomPass.BlurDirectionX;
        renderer.setRenderTarget(this.renderTargetsHorizontal[i]);
        renderer.clear();
        this.fsQuad.render(renderer);

        this.separableBlurMaterials[i].uniforms["colorTexture"].value = this.renderTargetsHorizontal[i].texture;
        this.separableBlurMaterials[i].uniforms["direction"].value = UnrealBloomPass.BlurDirectionY;
        renderer.setRenderTarget(this.renderTargetsVertical[i]);
        renderer.clear();
        this.fsQuad.render(renderer);

        inputRenderTarget = this.renderTargetsVertical[i];
      }

      this.fsQuad.material = this.compositeMaterial;
      this.compositeMaterial.uniforms["bloomStrength"].value = this.strength;
      this.compositeMaterial.uniforms["bloomRadius"].value = this.radius;
      renderer.setRenderTarget(this.renderTargetsHorizontal[0]);
      renderer.clear();
      this.fsQuad.render(renderer);

      this.fsQuad.material = this.materialCopy;
      this.copyUniforms["tDiffuse"].value = this.renderTargetsHorizontal[0].texture;

      if (this.renderToScreen) {
        renderer.setRenderTarget(null);
        this.fsQuad.render(renderer);
      } else {
        renderer.setRenderTarget(readBuffer);
        this.fsQuad.render(renderer);
      }

      renderer.setClearColor(oldClearColor, oldClearAlpha);
      renderer.autoClear = oldAutoClear;
    },

    getSeparableBlurMaterial: function (kernelRadius) {
      return new THREE.ShaderMaterial({
        defines: {
          KERNEL_RADIUS: kernelRadius,
          SIGMA: kernelRadius
        },
        uniforms: {
          colorTexture: { value: null },
          invSize: { value: new THREE.Vector2(0.5, 0.5) },
          direction: { value: new THREE.Vector2(0.5, 0.5) }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform sampler2D colorTexture;
          uniform vec2 invSize;
          uniform vec2 direction;

          float gaussianPdf(in float x, in float sigma) {
            return 0.39894 * exp(-0.5 * x * x/( sigma * sigma))/sigma;
          }

          void main() {
            float weightSum = gaussianPdf(0.0, float(SIGMA));
            vec3 diffuseSum = texture2D(colorTexture, vUv).rgb * weightSum;

            for (int i = 1; i < KERNEL_RADIUS; i++) {
              float x = float(i);
              float w = gaussianPdf(x, float(SIGMA));
              vec2 uvOffset = direction * invSize * x;
              vec3 sample1 = texture2D(colorTexture, vUv + uvOffset).rgb;
              vec3 sample2 = texture2D(colorTexture, vUv - uvOffset).rgb;
              diffuseSum += (sample1 + sample2) * w;
              weightSum += 2.0 * w;
            }

            gl_FragColor = vec4(diffuseSum / weightSum, 1.0);
          }
        `
      });
    },

    getCompositeMaterial: function (nMips) {
      return new THREE.ShaderMaterial({
        defines: {
          NUM_MIPS: nMips
        },
        uniforms: {
          blurTexture1: { value: null },
          blurTexture2: { value: null },
          blurTexture3: { value: null },
          blurTexture4: { value: null },
          blurTexture5: { value: null },
          bloomStrength: { value: 1.0 },
          bloomRadius: { value: 0.0 },
          bloomFactors: { value: [1.0, 0.8, 0.6, 0.4, 0.2] },
          bloomTintColors: { value: [
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1)
          ] }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          uniform sampler2D blurTexture1;
          uniform sampler2D blurTexture2;
          uniform sampler2D blurTexture3;
          uniform sampler2D blurTexture4;
          uniform sampler2D blurTexture5;
          uniform float bloomStrength;
          uniform float bloomRadius;
          uniform float bloomFactors[NUM_MIPS];
          uniform vec3 bloomTintColors[NUM_MIPS];

          float lerpBloomFactor(const in float factor) {
            float mirrorFactor = 1.2 - factor;
            return mix(factor, mirrorFactor, bloomRadius);
          }

          void main() {
            gl_FragColor = bloomStrength * (
              lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
              lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
              lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
              lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
              lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv)
            );
          }
        `
      });
    }
  });

  UnrealBloomPass.BlurDirectionX = new THREE.Vector2(1.0, 0.0);
  UnrealBloomPass.BlurDirectionY = new THREE.Vector2(0.0, 1.0);

  window.UnrealBloomPass = UnrealBloomPass;
})();