(function () {
  const G = window.UmbraGlobe;

  G.makeVeinMaterial = function makeVeinMaterial() {
    const uniforms = {
      time: { value: 0.0 },
      veinColor: { value: new THREE.Color(0x7b5cff) },
      intensity: { value: 1.0 },
      pulseStrength: { value: 0.6 },
      pulseSpeed: { value: 1.6 },
    };

    const vertexShader = `
      varying vec3 vWorldPos;
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform float time;
      uniform vec3 veinColor;
      uniform float intensity;
      uniform float pulseStrength;
      uniform float pulseSpeed;
      varying vec3 vWorldPos;
      varying vec3 vNormal;

      float hash(vec3 p) {
        p = vec3(
          dot(p, vec3(127.1, 311.7, 74.7)),
          dot(p, vec3(269.5, 183.3, 246.1)),
          dot(p, vec3(113.5, 271.9, 124.6))
        );
        return fract(sin(p.x + p.y + p.z) * 43758.5453123);
      }

      float valueNoise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        vec3 u = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0,0.0,0.0));
        float n100 = hash(i + vec3(1.0,0.0,0.0));
        float n010 = hash(i + vec3(0.0,1.0,0.0));
        float n110 = hash(i + vec3(1.0,1.0,0.0));
        float n001 = hash(i + vec3(0.0,0.0,1.0));
        float n101 = hash(i + vec3(1.0,0.0,1.0));
        float n011 = hash(i + vec3(0.0,1.0,1.0));
        float n111 = hash(i + vec3(1.0,1.0,1.0));

        float nx00 = mix(n000, n100, u.x);
        float nx10 = mix(n010, n110, u.x);
        float nx01 = mix(n001, n101, u.x);
        float nx11 = mix(n011, n111, u.x);

        float nxy0 = mix(nx00, nx10, u.y);
        float nxy1 = mix(nx01, nx11, u.y);
        return mix(nxy0, nxy1, u.z);
      }

      float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * valueNoise(p);
          p *= 2.35;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec3 dir = normalize(vWorldPos);
        vec3 p = dir * 6.0 + vec3(0.0, time * 0.35, time * 0.18);

        float n = fbm(p);
        float ridge = 1.0 - abs(2.0 * n - 1.0);

        float veins = smoothstep(0.92, 0.995, ridge);
        veins = pow(veins, 5.0);

        float detail = valueNoise(dir * 24.0 + vec3(0.0, time * 0.1, 0.0));
        float detailMask = smoothstep(0.4, 0.9, detail);
        veins *= detailMask;

        float lat = dir.y;
        float band = smoothstep(-0.3, 0.4, lat) * (1.0 - smoothstep(0.5, 0.9, abs(lat)));
        veins *= band;

        float pulse = 0.5 + 0.5 * sin(time * pulseSpeed + lat * 7.0 + n * 10.0);
        float glow = veins * (intensity * (0.5 + pulseStrength * pulse));

        if (glow < 0.015) discard;

        vec3 color = veinColor * glow;
        gl_FragColor = vec4(color, glow);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  };
})();