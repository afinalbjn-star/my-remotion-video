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
seed(512);

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
  const wx = fbm(x + t * 0.3, y + t * 0.2, 5) * strength;
  const wy = fbm(x + 5.2 + t * 0.2, y + 1.3 + t * 0.3, 5) * strength;
  return [x + wx, y + wy];
}

// ===== COMPONENT =====
export const ChromaticFluid: React.FC = () => {
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

    // Pre-compute fluid emitters
    const emitters: [number, number, number, number, number][] = [];
    let seedVal = 99999;
    for (let i = 0; i < 20; i++) {
      seedVal = (seedVal * 16807) % 2147483647;
      const ex = seedVal / 2147483647;
      seedVal = (seedVal * 16807) % 2147483647;
      const ey = seedVal / 2147483647;
      seedVal = (seedVal * 16807) % 2147483647;
      const phase = (seedVal / 2147483647) * Math.PI * 2;
      seedVal = (seedVal * 16807) % 2147483647;
      const speed = 0.3 + (seedVal / 2147483647) * 0.7;
      seedVal = (seedVal * 16807) % 2147483647;
      const hue = seedVal / 2147483647;
      emitters.push([ex, ey, phase, speed, hue]);
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const nx = x / width;
        const ny = y / height;

        // ===== DARK BASE =====
        let r = 5, g = 5, b = 8;

        // ===== FLUID SIMULATION (6 layers of domain-warped noise) =====
        for (let layer = 0; layer < 6; layer++) {
          const layerT = t * (0.2 + layer * 0.15);
          const layerScale = 2 + layer * 1.5;
          const layerStrength = 0.3 + layer * 0.1;

          // Triple domain warp for extreme organic shapes
          const [wx1, wy1] = domainWarp(
            nx * layerScale + layer * 8.3,
            ny * layerScale + layer * 8.3,
            layerT,
            layerStrength
          );
          const [wx2, wy2] = domainWarp(wx1, wy1, layerT * 0.7, layerStrength * 0.5);

          const noise = fbm(wx2, wy2, 6);
          const density = Math.max(0, (noise + 0.15) * 2.5);

          // Chromatic palette: each layer a different vivid color
          const hues = [0.0, 0.08, 0.17, 0.33, 0.55, 0.78]; // red, orange, yellow, green, cyan, violet
          const sat = 0.9 + Math.sin(noise * 5) * 0.1;
          const light = 0.2 + density * 0.4;

          // HSL to RGB inline
          const h = hues[layer] + noise * 0.05;
          const a = sat * Math.min(light, 1 - light);
          const f = (n: number) => {
            const k = (n + h * 12) % 12;
            return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
          };
          const lr = Math.round(f(0) * 255);
          const lg = Math.round(f(8) * 255);
          const lb = Math.round(f(4) * 255);

          const alpha = density * (0.25 + layer * 0.05);
          r += lr * alpha;
          g += lg * alpha;
          b += lb * alpha;
        }

        // ===== FLUID EMITTERS (moving color sources) =====
        for (const [ex, ey, phase, speed, hue] of emitters) {
          const moveX = ex + Math.sin(t * speed + phase) * 0.2;
          const moveY = ey + Math.cos(t * speed * 0.7 + phase) * 0.2;
          const dx = nx - moveX;
          const dy = ny - moveY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 0.15) {
            const intensity = (1 - dist / 0.15) ** 2;
            const pulse = 0.7 + 0.3 * Math.sin(t * 2 + phase);

            // HSL to RGB inline
            const a = 0.9 * Math.min(0.5, 0.5);
            const f = (n: number) => {
              const k = (n + hue * 12) % 12;
              return 0.5 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
            };
            const er = Math.round(f(0) * 255);
            const eg = Math.round(f(8) * 255);
            const eb = Math.round(f(4) * 255);

            r += er * intensity * pulse * 0.5;
            g += eg * intensity * pulse * 0.5;
            b += eb * intensity * pulse * 0.5;
          }
        }

        // ===== CAUSTIC LIGHT PATTERNS =====
        const causticX = nx * 8 + Math.sin(t * 0.5) * 2;
        const causticY = ny * 8 + Math.cos(t * 0.4) * 2;
        const caustic1 = Math.sin(causticX + Math.sin(causticY + t)) * 0.5 + 0.5;
        const caustic2 = Math.sin(causticY + Math.sin(causticX + t * 0.8)) * 0.5 + 0.5;
        const caustic = caustic1 * caustic2;
        const causticIntensity = Math.pow(caustic, 3) * 80;

        r += causticIntensity * 0.9;
        g += causticIntensity * 0.95;
        b += causticIntensity;

        // ===== MICRO DETAIL (high frequency noise) =====
        const microNoise = perlin2(nx * 50 + t * 0.5, ny * 50 + t * 0.5);
        const microIntensity = Math.max(0, microNoise) * 15;
        r += microIntensity;
        g += microIntensity;
        b += microIntensity;

        // ===== CHROMATIC ABERRATION (subtle) =====
        const centerX = nx - 0.5;
        const centerY = ny - 0.5;
        const distFromCenter = Math.sqrt(centerX * centerX + centerY * centerY);
        const aberration = distFromCenter * 0.02;

        // Shift red channel outward slightly
        const rShiftX = Math.floor((nx + centerX * aberration) * width);
        const rShiftY = Math.floor((ny + centerY * aberration) * height);
        if (rShiftX >= 0 && rShiftX < width && rShiftY >= 0 && rShiftY < height) {
          const rIdx = (rShiftY * width + rShiftX) * 4;
          r = r * 0.9 + data[rIdx] * 0.1;
        }

        // ===== VIGNETTE =====
        const vignette = 1 - distFromCenter * 0.4;
        r *= vignette;
        g *= vignette;
        b *= vignette;

        // ===== FILMIC TONE MAPPING =====
        r = r / (r + 100) * 255;
        g = g / (g + 100) * 255;
        b = b / (b + 100) * 255;

        // ===== SUBTLE COLOR GRADING (warm highlights, cool shadows) =====
        const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        if (luminance > 0.5) {
          r += (luminance - 0.5) * 20;
          g += (luminance - 0.5) * 10;
        } else {
          b += (0.5 - luminance) * 15;
        }

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
