(function () {
  window.LuminosityHighPassShader = {
    shaderID: "luminosityHighPass",

    uniforms: {
      tDiffuse: { value: null },
      luminosityThreshold: { value: 1.0 },
      smoothWidth: { value: 0.01 },
      defaultColor: { value: new THREE.Color(0x000000) },
      defaultOpacity: { value: 0.0 }
    },

    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform vec3 defaultColor;
      uniform float defaultOpacity;
      uniform float luminosityThreshold;
      uniform float smoothWidth;
      varying vec2 vUv;

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float v = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
        float alpha = smoothstep(luminosityThreshold, luminosityThreshold + smoothWidth, v);
        gl_FragColor = mix(vec4(defaultColor, defaultOpacity), texel, alpha);
      }
    `
  };
})();