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
seed(99);

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
  const wx = fbm(x + t * 0.4, y + t * 0.3, 4) * strength;
  const wy = fbm(x + 5.2 + t * 0.3, y + 1.3 + t * 0.4, 4) * strength;
  return [x + wx, y + wy];
}

// ===== COMPONENT =====
export const QuantumField: React.FC = () => {
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

    // Pre-compute energy nodes
    const nodes: [number, number, number, number][] = [];
    let seedVal = 54321;
    for (let i = 0; i < 30; i++) {
      seedVal = (seedVal * 16807) % 2147483647;
      const nx = seedVal / 2147483647;
      seedVal = (seedVal * 16807) % 2147483647;
      const ny = seedVal / 2147483647;
      seedVal = (seedVal * 16807) % 2147483647;
      const phase = (seedVal / 2147483647) * Math.PI * 2;
      seedVal = (seedVal * 16807) % 2147483647;
      const freq = 0.5 + (seedVal / 2147483647) * 2;
      nodes.push([nx, ny, phase, freq]);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const nx = x / width;
        const ny = y / height;

        // ===== DARK QUANTUM VOID =====
        let r = 0, g = 0, b = 5;

        // ===== ENERGY GRID (hexagonal pattern) =====
        const gridX = nx * 20;
        const gridY = ny * 20;
        const hexDist = Math.abs(Math.sin(gridX * Math.PI)) * Math.abs(Math.sin(gridY * Math.PI));
        const gridPulse = 0.5 + 0.5 * Math.sin(t * 2 + hexDist * 10);
        const gridIntensity = Math.max(0, hexDist - 0.95) * 20 * gridPulse;

        r += gridIntensity * 0;
        g += gridIntensity * 100;
        b += gridIntensity * 200;

        // ===== QUANTUM FOAM (3 layers of domain-warped noise) =====
        for (let layer = 0; layer < 3; layer++) {
          const layerT = t * (0.3 + layer * 0.2);
          const layerScale = 3 + layer * 2;
          const layerStrength = 0.3 + layer * 0.1;

          const [wx, wy] = domainWarp(
            nx * layerScale + layer * 7.7,
            ny * layerScale + layer * 7.7,
            layerT,
            layerStrength
          );

          const noise = fbm(wx, wy, 6);
          const density = Math.max(0, (noise + 0.2) * 2);

          // Quantum colors: cyan, electric blue, violet
          const hueShift = layer * 0.15;
          const r1 = Math.sin(noise * Math.PI + hueShift) * 0.5 + 0.5;
          const g1 = Math.sin(noise * Math.PI + hueShift + 2.094) * 0.5 + 0.5;
          const b1 = Math.sin(noise * Math.PI + hueShift + 4.189) * 0.5 + 0.5;

          r += r1 * density * 80;
          g += g1 * density * 120;
          b += b1 * density * 200;
        }

        // ===== ENERGY NODES (glowing orbs with connections) =====
        for (const [nodeX, nodeY, phase, freq] of nodes) {
          const dx = nx - nodeX;
          const dy = ny - nodeY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Pulsating glow
          const pulse = 0.5 + 0.5 * Math.sin(t * freq + phase);
          const glowRadius = 0.05 + pulse * 0.03;

          if (dist < glowRadius) {
            const intensity = (1 - dist / glowRadius) ** 2 * pulse;
            r += intensity * 100;
            g += intensity * 200;
            b += intensity * 255;
          }

          // Connection lines to nearby nodes
          for (const [n2x, n2y] of nodes) {
            if (n2x === nodeX && n2y === nodeY) continue;
            const lineDist = pointToLineDistance(nx, ny, nodeX, nodeY, n2x, n2y);
            const lineLength = Math.sqrt((n2x - nodeX) ** 2 + (n2y - nodeY) ** 2);
            if (lineDist < 0.003 && lineLength < 0.3) {
              const lineIntensity = (1 - lineDist / 0.003) * 0.3 * pulse;
              r += lineIntensity * 50;
              g += lineIntensity * 150;
              b += lineIntensity * 255;
            }
          }
        }

        // ===== PARTICLE STREAMS =====
        for (let s = 0; s < 100; s++) {
          const streamT = t * (0.5 + s * 0.02) + s * 0.5;
          const streamX = (Math.sin(s * 73.1 + streamT * 0.3) * 0.4 + 0.5);
          const streamY = (Math.sin(s * 191.7 + streamT * 0.2) * 0.4 + 0.5);
          const sd = Math.sqrt((nx - streamX) ** 2 + (ny - streamY) ** 2);

          if (sd < 0.008) {
            const brightness = (1 - sd / 0.008) ** 3 * 250;
            const trail = Math.sin(s * 37.3) * 0.5 + 0.5;
            r += brightness * (0.2 + trail * 0.3);
            g += brightness * (0.5 + trail * 0.3);
            b += brightness * (0.8 + trail * 0.2);
          }
        }

        // ===== CENTRAL SINGULARITY =====
        const cx = nx - 0.5;
        const cy = ny - 0.5;
        const cdist = Math.sqrt(cx * cx + cy * cy);
        const cangle = Math.atan2(cy, cx);

        // Swirling accretion disk
        const diskAngle = cangle + cdist * 15 - t * 3;
        const diskNoise = perlin2(
          Math.cos(diskAngle) * 5 + t * 0.5,
          Math.sin(diskAngle) * 5 + t * 0.5
        );
        const diskIntensity = Math.max(0, (diskNoise + 0.3) * 2) * Math.max(0, 1 - cdist * 2);

        r += diskIntensity * 255;
        g += diskIntensity * 200;
        b += diskIntensity * 100;

        // Event horizon (dark center)
        if (cdist < 0.08) {
          const darkness = (1 - cdist / 0.08) ** 2;
          r *= (1 - darkness);
          g *= (1 - darkness);
          b *= (1 - darkness);
        }

        // ===== LIGHT BENDING (gravitational lensing effect) =====
        const lensStrength = Math.max(0, 0.15 - cdist) * 5;
        const lensX = nx + cx * lensStrength * 0.5;
        const lensY = ny + cy * lensStrength * 0.5;
        const lensNoise = fbm(lensX * 8, lensY * 8, 4);
        const lensIntensity = Math.max(0, lensNoise) * lensStrength;

        r += lensIntensity * 200;
        g += lensIntensity * 220;
        b += lensIntensity * 255;

        // ===== VIGNETTE =====
        const vignette = 1 - cdist * 0.6;
        r *= vignette;
        g *= vignette;
        b *= vignette;

        // ===== OUTPUT =====
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

// Helper: distance from point to line segment
function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }
  return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
}
