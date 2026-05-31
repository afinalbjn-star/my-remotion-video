export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform float uTime;

  // Fungsi untuk menciptakan gelombang sinusoidal yang kompleks (Cymatics)
  float getDisplacement(vec3 p) {
    float time = uTime;
    // Menggunakan sin/cos dari waktu agar loop sempurna (0 to 2*PI)
    float wave = sin(p.x * 2.0 + cos(time)) * 0.2;
    wave += cos(p.y * 1.5 + sin(time)) * 0.2;
    wave += sin((p.x + p.y) * 1.0 + time) * 0.1;
    return wave;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Animasi deformasi permukaan
    float displacement = getDisplacement(pos);
    pos.z += displacement;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    // Kalkulasi normal sederhana untuk refleksi (ideal menggunakan teknik derivatif)
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  uniform float uTime;

  // Palet Warna: Deep Violet, Magenta, Goldenrod, Teal
  vec3 getGradient(float t) {
    vec3 color1 = vec3(0.29, 0.0, 0.51); // Deep Violet
    vec3 color2 = vec3(1.0, 0.0, 1.0);  // Magenta
    vec3 color3 = vec3(0.85, 0.65, 0.13); // Goldenrod
    vec3 color4 = vec3(0.0, 0.5, 0.5);   // Teal
    
    float step1 = 0.33;
    float step2 = 0.66;
    
    if (t < step1) return mix(color1, color2, t / step1);
    if (t < step2) return mix(color2, color3, (t - step1) / (step2 - step1));
    return mix(color3, color4, (t - step2) / (1.0 - step2));
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    // Efek Fresnel untuk refleksi tepi (Lensa Premium)
    float fresnel = pow(1.0 - dot(normal, viewDir), 2.5);
    
    // Dinamika warna berdasarkan posisi dan waktu
    float colorCycle = mod(vUv.x + vUv.y + sin(uTime) * 0.5, 1.0);
    vec3 baseColor = getGradient(colorCycle);
    
    // Efek Logam Cair (High Reflectivity)
    vec3 lightDir = normalize(vec3(5.0, 5.0, 2.0));
    float spec = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 32.0);
    
    // Chromatic Aberration simulasi di shader
    vec3 color;
    color.r = getGradient(colorCycle + 0.01).r;
    color.g = getGradient(colorCycle).g;
    color.b = getGradient(colorCycle - 0.01).b;
    
    vec3 finalColor = mix(color * 0.4, color, fresnel) + spec * 0.8;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;