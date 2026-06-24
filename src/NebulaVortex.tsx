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
seed(42);

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

// ===== HSL to RGB =====
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 1) + 1) % 1;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// ===== COMPONENT =====
export const NebulaVortex: React.FC = () => {
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

    // Pre-compute star positions (seeded)
    const stars: [number, number, number][] = [];
    let seedVal = 12345;
    for (let i = 0; i < 200; i++) {
      seedVal = (seedVal * 16807) % 2147483647;
      const sx = seedVal / 2147483647;
      seedVal = (seedVal * 16807) % 2147483647;
      const sy = seedVal / 2147483647;
      seedVal = (seedVal * 16807) % 2147483647;
      const sz = 0.3 + (seedVal / 2147483647) * 0.7;
      stars.push([sx * width, sy * height, sz]);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const nx = x / width;
        const ny = y / height;

        // Center coordinates
        const cx = nx - 0.5;
        const cy = ny - 0.5;
        const dist = Math.sqrt(cx * cx + cy * cy);
        const angle = Math.atan2(cy, cx);

        // ===== DEEP SPACE BACKGROUND =====
        let r = 2, g = 2, b = 8;

        // ===== STARS =====
        for (const [sx, sy, sz] of stars) {
          const dx = x - sx;
          const dy = y - sy;
          const sd = Math.sqrt(dx * dx + dy * dy);
          const twinkle = 0.7 + 0.3 * Math.sin(t * 3 + sx * 0.01);
          if (sd < 2 * sz) {
            const brightness = (1 - sd / (2 * sz)) * twinkle * 255 * sz;
            r += brightness * 0.9;
            g += brightness * 0.95;
            b += brightness;
          }
        }

        // ===== NEBULA GAS LAYERS (4 layers) =====
        for (let layer = 0; layer < 4; layer++) {
          const layerT = t * (0.5 + layer * 0.3);
          const layerScale = 1.5 + layer * 0.8;
          const layerStrength = 0.4 + layer * 0.15;

          // Domain warp for organic shapes
          const [wx, wy] = domainWarp(
            nx * layerScale + layer * 10,
            ny * layerScale + layer * 10,
            layerT,
            layerStrength
          );

          const noise = fbm(wx, wy, 5);
          const density = Math.max(0, (noise + 0.3) * 1.5);

          // Color per layer (purple, blue, pink, teal)
          const hues = [0.75, 0.6, 0.85, 0.45];
          const sats = [0.8, 0.9, 0.7, 0.85];
          const lights = [0.15, 0.1, 0.12, 0.08];

          const [lr, lg, lb] = hslToRgb(
            hues[layer] + noise * 0.1,
            sats[layer],
            lights[layer] + density * 0.3
          );

          const alpha = density * (0.3 + layer * 0.1);
          r += lr * alpha;
          g += lg * alpha;
          b += lb * alpha;
        }

        // ===== VORTEX CORE =====
        const vortexAngle = angle + dist * 8 - t * 2;
        const vortexNoise = perlin2(
          Math.cos(vortexAngle) * 3 + t * 0.5,
          Math.sin(vortexAngle) * 3 + t * 0.5
        );
        const vortexIntensity = Math.max(0, 1 - dist * 2.5) * (0.5 + vortexNoise * 0.5);

        // Bright vortex core (white-blue)
        r += vortexIntensity * 120;
        g += vortexIntensity * 150;
        b += vortexIntensity * 255;

        // ===== SPIRAL ARMS =====
        const spiralAngle = angle + dist * 12 - t * 1.5;
        const spiralNoise = perlin2(
          Math.cos(spiralAngle) * 4 + t * 0.3,
          Math.sin(spiralAngle) * 4 + t * 0.3
        );
        const spiralIntensity = Math.max(0, (spiralNoise + 0.2) * 2) * Math.max(0, 1 - dist * 1.8);

        // Golden spiral arms
        r += spiralIntensity * 200;
        g += spiralIntensity * 160;
        b += spiralIntensity * 80;

        // ===== LIGHT RAYS (God rays) =====
        const rayAngle = Math.atan2(ny - 0.3, nx - 0.4);
        const rayDist = Math.sqrt((nx - 0.4) ** 2 + (ny - 0.3) ** 2);
        const ray = Math.max(0, Math.sin(rayAngle * 6 + t * 0.5) * 0.5 + 0.5);
        const rayIntensity = ray * Math.max(0, 1 - rayDist * 2) * 0.3;

        r += rayIntensity * 255;
        g += rayIntensity * 220;
        b += rayIntensity * 180;

        // ===== DUST PARTICLES =====
        for (let p = 0; p < 50; p++) {
          const px = (Math.sin(p * 127.1 + t * (0.2 + p * 0.01)) * 0.5 + 0.5);
          const py = (Math.sin(p * 311.7 + t * (0.15 + p * 0.01)) * 0.5 + 0.5);
          const pd = Math.sqrt((nx - px) ** 2 + (ny - py) ** 2);
          if (pd < 0.01) {
            const brightness = (1 - pd / 0.01) * 200 * (0.5 + 0.5 * Math.sin(p * 47.3));
            r += brightness * 0.8;
            g += brightness * 0.9;
            b += brightness;
          }
        }

        // ===== TONE MAPPING & GAMMA =====
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        // Slight vignette
        const vignette = 1 - dist * 0.4;
        r *= vignette;
        g *= vignette;
        b *= vignette;

        data[idx] = Math.min(255, r);
        data[idx + 1] = Math.min(255, g);
        data[idx + 2] = Math.min(255, b);
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
