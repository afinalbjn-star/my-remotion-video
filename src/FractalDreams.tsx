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
seed(256);

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
  const wx = fbm(x + t * 0.3, y + t * 0.2, 4) * strength;
  const wy = fbm(x + 5.2 + t * 0.2, y + 1.3 + t * 0.3, 4) * strength;
  return [x + wx, y + wy];
}

// ===== COMPONENT =====
export const FractalDreams: React.FC = () => {
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

    // Fractal parameters that evolve over time
    const zoom = 1 + Math.sin(t * 0.5) * 0.3;
    const centerX = -0.5 + Math.sin(t * 0.3) * 0.2;
    const centerY = 0 + Math.cos(t * 0.4) * 0.2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        // Map pixel to complex plane
        const nx = (x / width - 0.5) * 4 / zoom + centerX;
        const ny = (y / height - 0.5) * 4 / zoom + centerY;

        // Julia set with animated c
        const cReal = -0.7 + Math.sin(t * 0.5) * 0.1;
        const cImag = 0.27015 + Math.cos(t * 0.3) * 0.1;

        let zReal = nx;
        let zImag = ny;
        let iter = 0;
        const maxIter = 100;

        while (zReal * zReal + zImag * zImag < 4 && iter < maxIter) {
          const temp = zReal * zReal - zImag * zImag + cReal;
          zImag = 2 * zReal * zImag + cImag;
          zReal = temp;
          iter++;
        }

        // Smooth coloring
        let r = 0, g = 0, b = 0;
        if (iter < maxIter) {
          const log_zn = Math.log(zReal * zReal + zImag * zImag) / 2;
          const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
          const smooth = iter + 1 - nu;

          // Color cycling with time
          const hue = (smooth * 0.05 + t * 0.1) % 1;
          const sat = 0.8 + Math.sin(smooth * 0.1) * 0.2;
          const val = 0.9 + Math.sin(smooth * 0.05) * 0.1;

          // HSV to RGB
          const i2 = Math.floor(hue * 6);
          const f2 = hue * 6 - i2;
          const p = val * (1 - sat);
          const q = val * (1 - f2 * sat);
          const u = val * (1 - (1 - f2) * sat);

          switch (i2 % 6) {
            case 0: r = val; g = u; b = p; break;
            case 1: r = q; g = val; b = p; break;
            case 2: r = p; g = val; b = u; break;
            case 3: r = p; g = q; b = val; break;
            case 4: r = u; g = p; b = val; break;
            case 5: r = val; g = p; b = q; break;
          }

          r *= 255;
          g *= 255;
          b *= 255;
        }

        // ===== DOMAIN WARP OVERLAY =====
        const [wx, wy] = domainWarp(nx * 0.5, ny * 0.5, t, 0.5);
        const warpNoise = fbm(wx, wy, 4);
        const warpIntensity = Math.max(0, (warpNoise + 0.3) * 1.5);

        // Blend fractal with warped nebula
        const blend = 0.7;
        r = r * blend + warpIntensity * 100 * (1 - blend);
        g = g * blend + warpIntensity * 150 * (1 - blend);
        b = b * blend + warpIntensity * 255 * (1 - blend);

        // ===== GLOWING EDGES =====
        if (iter > 0 && iter < maxIter) {
          const edgeGlow = Math.sin(iter * 0.3 + t * 2) * 0.5 + 0.5;
          r += edgeGlow * 50;
          g += edgeGlow * 80;
          b += edgeGlow * 120;
        }

        // ===== VIGNETTE =====
        const cx = x / width - 0.5;
        const cy = y / height - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
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
