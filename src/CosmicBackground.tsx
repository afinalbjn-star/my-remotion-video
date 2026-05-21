import React from 'react';
import {useVideoConfig} from 'remotion';
import {Canvas} from '@react-three/fiber';
import {Stars} from '@react-three/drei';

// Vertex shader passes UV coordinates to fragment shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment shader creates an animated nebula effect that loops
const fragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  float random(in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.05; // speed control
    float n = random(uv * 10.0 + t);
    vec3 color = mix(vec3(0.0, 0.0, 0.1), vec3(0.4, 0.0, 0.8), n);
    color = mix(color, vec3(0.0, 0.7, 0.8), smoothstep(0.4, 0.6, n));
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function CosmicBackground() {
  const {width, height, fps, currentFrame} = useVideoConfig();
  const time = currentFrame / fps;
  return (
    <div style={{width, height, overflow: 'hidden'}}>
      <Canvas
        gl={{antialias: true}}
        camera={{position: [0, 0, 5], fov: 75}}
        style={{width: '100%', height: '100%'}}
      >
        {/* Full‑screen plane with shader material */}
        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[width, height]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={{uTime: {value: time}}}
          />
        </mesh>
        {/* Starfield adds depth and sparkle */}
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />
      </Canvas>
    </div>
  );
}
