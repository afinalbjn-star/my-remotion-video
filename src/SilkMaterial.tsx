import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const fragmentShader = `
  uniform float u_progress;
  uniform vec2 u_resolution;
  varying vec2 v_uv;

  // -- 4D SIMPLEX NOISE ALGORITHM --
  // (Ashima Arts / Stefan Gustavson implementation)
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}
  
  float snoise(vec4 v){
    const vec2  C = vec2( 0.138196601125010504, 0.309016994374947451);
    vec4 i  = floor(v + dot(v, vec4(C.y)) );
    vec4 x0 = v -   i + dot(i, vec4(C.x)) ;
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );
    vec4 x1 = x0 - i1 + 1.0 * C.x;
    vec4 x2 = x0 - i2 + 2.0 * C.x;
    vec4 x3 = x0 - i3 + 3.0 * C.x;
    vec4 x4 = x0 - 1.0 + 4.0 * C.x;
    i = mod(i, 289.0);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
               i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
             + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
             + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
             + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;
    vec4 p0 = fract(j0 * ip);
    vec4 p1 = fract(j1 * ip);
    vec4 p2 = fract(j1 * ip);
    p0 -= fract(p0 * (289.0/289.0));
    p1 -= fract(p1 * (289.0/289.0));
    p2 -= fract(p2 * (289.0/289.0));
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p1,p1), dot(p1,p1)));
    p0 *= norm.x;
    p1 *= norm.yzw;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    vec2 m2 = m.xy * m.xy;
    vec2 m4 = m2 * m2;
    float n1 = dot( m4, vec2(dot(p0, x0), dot(p1.xy, x1.xy)));
    return 49.0 * n1; // Skala disesuaikan untuk rentang wajar
  }

  // Fungsi palet kosinus untuk efek Iridescent Pastel
  vec3 cosinePalette(in float t) {
      vec3 a = vec3(0.8, 0.8, 0.9);   // Tingkat kecerahan dasar (Soft)
      vec3 b = vec3(0.2, 0.2, 0.2);   // Kontras warna
      vec3 c = vec3(1.0, 1.0, 1.0);   // Frekuensi osilasi
      vec3 d = vec3(0.0, 0.33, 0.67); // Phase shift untuk (Lavender, Mint, Pearl White)
      return a + b * cos(6.28318 * (c * t + d));
  }

  // Fungsi pembungkus fbm & domain warping khusus 4D
  float warpedNoise(vec2 p, vec2 t) {
      // Warping layer 1
      vec2 q = vec2(
          snoise(vec4(p + vec2(0.0, 0.0), t.x, t.y)),
          snoise(vec4(p + vec2(5.2, 1.3), t.x, t.y))
      );
      
      // Warping layer 2
      vec2 r = vec2(
          snoise(vec4(p + 4.0 * q + vec2(1.7, 9.2), t.x, t.y)),
          snoise(vec4(p + 4.0 * q + vec2(8.3, 2.8), t.x, t.y))
      );
      
      // Final smooth pass
      return snoise(vec4(p + 3.0 * r, t.x, t.y)) * 0.5 + 0.5;
  }

  // Menghasilkan procedural static noise / film grain
  float hash(vec2 p) {
      vec3 p3  = fract(vec3(p.xyx) * .1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
  }

  void main() {
    // 1. Normalisasi Koordinat UV untuk resolusi 4K (Menjaga Aspect Ratio)
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= u_resolution.x / u_resolution.y;

    // Menyesuaikan ukuran gelombang cairan (Skala lebih besar = lipatan lebih elegan)
    p *= 1.8; 

    // 2. Trigonometri 4D untuk Seamless Looping
    float timeAngle = u_progress * 2.0 * 3.14159265;
    vec2 t = vec2(sin(timeAngle), cos(timeAngle)) * 0.8; // Radius waktu mempengaruhi kecepatan mutasi

    // 3. Eksekusi Domain Warping
    float n = warpedNoise(p, t);

    // 4. Kalkulasi Turunan untuk Specular / Pantulan Cahaya (Derivatives)
    float eps = 0.005;
    float dx = (warpedNoise(p + vec2(eps, 0.0), t) - warpedNoise(p - vec2(eps, 0.0), t)) / (2.0 * eps);
    float dy = (warpedNoise(p + vec2(0.0, eps), t) - warpedNoise(p - vec2(0.0, eps), t)) / (2.0 * eps);
    
    vec3 normal = normalize(vec3(-dx, -dy, 1.5)); // Z=1.5 membuat lipatan sutra lebih halus
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0)); // Arah pencahayaan semu
    
    // Intensitas Specular (Phong reflection model ringan)
    float specular = pow(max(dot(normal, lightDir), 0.0), 16.0) * 0.25; 

    // 5. Pewarnaan Iridescent + Pencahayaan
    vec3 color = cosinePalette(n + u_progress * 0.1); 
    color += vec3(specular); // Menambahkan kilau mutiara ke lipatan kain

    // 6. Penambahan Procedural Grain Tipis untuk tekstur mewah dan menghilangkan color banding
    float grain = hash(v_uv * 1000.0) * 0.035;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const vertexShader = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

export const SilkMaterial: React.FC<{ progress: number; resolution: [number, number] }> = ({
    progress,
    resolution,
}) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    // Mendorong uniform secara real-time ke GPU
    useFrame(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_progress.value = progress;
        }
    });

    const uniforms = useMemo(
        () => ({
            u_progress: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2(resolution[0], resolution[1]) },
        }),
        [resolution]
    );

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            depthWrite={false}
            depthTest={false}
        />
    );
};