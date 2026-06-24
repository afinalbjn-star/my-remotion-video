import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ===== PERLIN NOISE =====
const perm = new Uint8Array(512);
const gradP = new Array(512);
const grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
];

function seed(s: number): void {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    gradP[i] = grad3[perm[i] % 12];
  }
}
seed(333);

function fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number): number { return (1 - t) * a + t * b; }

function perlin2(x: number, y: number): number {
  let X = Math.floor(x), Y = Math.floor(y);
  x -= X; y -= Y; X &= 255; Y &= 255;
  const n00 = gradP[X + perm[Y]];
  const n01 = gradP[X + perm[Y + 1]];
  const n10 = gradP[X + 1 + perm[Y]];
  const n11 = gradP[X + 1 + perm[Y + 1]];
  const d00 = n00[0] * x + n00[1] * y;
  const d01 = n01[0] * x + n01[1] * (y - 1);
  const d10 = n10[0] * (x - 1) + n10[1] * y;
  const d11 = n11[0] * (x - 1) + n11[1] * (y - 1);
  const u = fade(x);
  return lerp(lerp(d00, d10, u), lerp(d01, d11, u), fade(y));
}

function fbm(x: number, y: number, octaves: number): number {
  let value = 0, amplitude = 0.5, frequency = 1;
  for (let i = 0; i < octaves; i++) {
    value += amplitude * perlin2(x * frequency, y * frequency);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value;
}

function domainWarp(x: number, y: number, t: number, strength: number): [number, number] {
  const wx = fbm(x + t * 0.35, y + t * 0.25, 4) * strength;
  const wy = fbm(x + 5.2 + t * 0.25, y + 1.3 + t * 0.35, 4) * strength;
  return [x + wx, y + wy];
}

// ===== COMPONENT =====
export const HyperDimensional: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = (frame / 600) * Math.PI * 2;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Pre-compute tesseract vertices (4D projected to 2D)
    const vertices4D: [number, number, number, number][] = [];
    for (let i = 0; i < 16; i++) {
      vertices4D.push([
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1,
      ]);
    }

    // 4D rotation matrices
    const cosA = Math.cos(t * 0.5);
    const sinA = Math.sin(t * 0.5);
    const cosB = Math.cos(t * 0.3);
    const sinB = Math.sin(t * 0.3);
    const cosC = Math.cos(t * 0.7);
    const sinC = Math.sin(t * 0.7);

    // Project 4D to 2D
    const projected: [number, number][] = vertices4D.map(([x, y, z, w]) => {
      // Rotate in XW plane
      let x1 = x * cosA - w * sinA;
      let w1 = x * sinA + w * cosA;
      // Rotate in YZ plane
      let y1 = y * cosB - z * sinB;
      let z1 = y * sinB + z * cosB;
      // Rotate in XZ plane
      let x2 = x1 * cosC - z1 * sinC;
      let z2 = x1 * sinC + z1 * cosC;
      // Project from 4D to 3D
      const distance4D = 3;
      const wFactor = 1 / (distance4D - w1);
      const x3 = x2 * wFactor;
      const y3 = y1 * wFactor;
      const z3 = z2 * wFactor;
      // Project from 3D to 2D
      const distance3D = 4;
      const zFactor = 1 / (distance3D - z3);
      return [x3 * zFactor * 0.8 + 0.5, y3 * zFactor * 0.8 + 0.5];
    });

    // Edges of a tesseract
    const edges: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        if (Math.log2(i ^ j) % 1 === 0 && (i ^ j) && ((i ^ j) & ((i ^ j) - 1)) === 0) {
          edges.push([i, j]);
        }
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const nx = x / width;
        const ny = y / height;

        // ===== DEEP SPACE =====
        let r = 3, g = 3, b = 10;

        // ===== HYPERSPACE TUNNEL =====
        const cx = nx - 0.5;
        const cy = ny - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy);

        // Tunnel walls with depth layers
        for (let depth = 0; depth < 8; depth++) {
          const layerZ = ((t * 0.5 + depth * 0.5) % 4) / 4;
          const layerRadius = 0.05 + layerZ * 0.4;
          const ringDist = Math.abs(dist - layerRadius);

          if (ringDist < 0.02) {
            const intensity = (1 - ringDist / 0.02) * (1 - layerZ * 0.5);
            const hueShift = depth * 0.125;
            const cr = Math.sin(hueShift * Math.PI * 2 + t) * 0.5 + 0.5;
            const cg = Math.sin(hueShift * Math.PI * 2 + t + 2.094) * 0.5 + 0.5;
            const cb = Math.sin(hueShift * Math.PI * 2 + t + 4.189) * 0.5 + 0.5;

            r += cr * intensity * 200;
            g += cg * intensity * 200;
            b += cb * intensity * 200;
          }
        }

        // ===== TESSERACT WIREFRAME =====
        for (const [i, j] of edges) {
          const [x1, y1] = projected[i];
          const [x2, y2] = projected[j];

          // Point to line distance
          const A = nx - x1;
          const B = ny - y1;
          const C = x2 - x1;
          const D = y2 - y1;
          const dot = A * C + B * D;
          const lenSq = C * C + D * D;
          let param = -1;
          if (lenSq > 0.0001) param = dot / lenSq;

          if (param >= 0 && param <= 1) {
            const px = x1 + param * C;
            const py = y1 + param * D;
            const lineDist = Math.sqrt((nx - px) ** 2 + (ny - py) ** 2);

            if (lineDist < 0.008) {
              const intensity = (1 - lineDist / 0.008) ** 2;
              const pulse = 0.7 + 0.3 * Math.sin(t * 3 + param * 10);

              // Neon cyan-magenta edges
              r += intensity * pulse * 200;
              g += intensity * pulse * 50;
              b += intensity * pulse * 255;
            }
          }
        }

        // ===== VERTEX GLOWS =====
        for (const [vx, vy] of projected) {
          const vd = Math.sqrt((nx - vx) ** 2 + (ny - vy) ** 2);
          if (vd < 0.03) {
            const glow = (1 - vd / 0.03) ** 3;
            const pulse = 0.8 + 0.2 * Math.sin(t * 5);
            r += glow * pulse * 255;
            g += glow * pulse * 200;
            b += glow * pulse * 100;
          }
        }

        // ===== ENERGY PARTICLES flowing along edges =====
        for (let p = 0; p < 80; p++) {
          const edgeIdx = p % edges.length;
          const [i, j] = edges[edgeIdx];
          const param = ((t * 0.5 + p * 0.125) % 1);
          const [x1, y1] = projected[i];
          const [x2, y2] = projected[j];
          const px = x1 + param * (x2 - x1);
          const py = y1 + param * (y2 - y1);
          const pd = Math.sqrt((nx - px) ** 2 + (ny - py) ** 2);

          if (pd < 0.012) {
            const brightness = (1 - pd / 0.012) ** 3 * 200;
            r += brightness * 0.3;
            g += brightness * 0.8;
            b += brightness;
          }
        }

        // ===== BACKGROUND NEBULA =====
        const [wx, wy] = domainWarp(nx * 2, ny * 2, t, 0.4);
        const nebula = fbm(wx, wy, 5);
        const nebulaDensity = Math.max(0, (nebula + 0.2) * 1.5);

        r += nebulaDensity * 30;
        g += nebulaDensity * 20;
        b += nebulaDensity * 60;

        // ===== VIGNETTE =====
        const vignette = 1 - dist * 0.5;
        r *= vignette;
        g *= vignette;
        b *= vignette;

        data[idx] = Math.min(255, Math.max(0, r));
        data[idx + 1] = Math.min(255, Math.max(0, g));
        data[idx + 2] = Math.min(255, Math.max(0, b));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [frame, width, height]);

  return (
    <AbsoluteFill>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};
