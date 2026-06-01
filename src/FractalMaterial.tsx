import React, { useMemo } from "react";
import * as THREE from "three";

const fragmentShader = `
  uniform float u_time;
  varying vec3 v_pos;

  vec3 opRepetition(vec3 p, vec3 c) {
    return mod(p + 0.5 * c, c) - 0.5 * c;
  }

  float mandelboxSDF(vec3 p) {
    vec3 w = opRepetition(p, vec3(3.5));
    float scale = 2.2;
    float r2 = 0.0;
    float pulse = sin(u_time) * 0.15 + 1.0;

    for (int i = 0; i < 5; i++) {
      w = clamp(w, -1.0 * pulse, 1.0 * pulse) * 2.0 * pulse - w;
      r2 = dot(w, w);
      if (r2 < 0.5) w = w * (1.0 / 0.5);
      else if (r2 < 1.0) w = w * (1.0 / r2);
      w = w * scale + p;
    }
    return (length(w) - 0.05) / abs(scale);
  }

  void main() {
    vec3 rayOri = cameraPosition;
    vec3 rayDir = normalize(v_pos - cameraPosition);

    float depth = 0.0;
    float maxDist = 15.0;
    float d = 0.0;
    int hitSteps = 0;

    for (int i = 0; i < 64; i++) {
      vec3 p = rayOri + rayDir * depth;
      d = mandelboxSDF(p);
      depth += d;
      hitSteps = i;
      if (d < 0.002 || depth > maxDist) break;
    }

    if (depth < maxDist) {
      vec3 hitPoint = rayOri + rayDir * depth;
      float edgeGlow = float(hitSteps) / 64.0;
      vec3 colorA = vec3(0.02, 0.71, 0.83);
      vec3 colorB = vec3(0.54, 0.36, 0.96);
      vec3 finalColor = mix(colorA, colorB, edgeGlow + sin(hitPoint.z * 0.5 + u_time) * 0.3);
      finalColor *= 1.2 - (depth / maxDist);
      finalColor += vec3(edgeGlow * 0.45);
      gl_FragColor = vec4(finalColor, 1.0);
    } else {
      discard;
    }
  }
`;

const vertexShader = `
  varying vec3 v_pos;
  void main() {
    v_pos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  }
`;

export const FractalMaterial: React.FC<{ progress: number }> = ({ progress }) => {
    const timeUniform = progress * Math.PI * 2;

    const uniforms = useMemo(() => ({
        u_time: { value: timeUniform },
    }), [timeUniform]);

    return (
        <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            side={THREE.DoubleSide}
        />
    );
};