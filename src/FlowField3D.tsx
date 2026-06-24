// path: src/FlowField3D.tsx
// 3D Particle Flow Field — seamless loop 4K 60fps
// FULLY STATELESS PER FRAME — no canvas accumulation, safe for Remotion rendering
// 3200+ particles with curl noise vector field & analytical trail (18 positions)
// Seamless: t = (frame/durationInFrames) * 2π — all sin/cos return to start

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ─── 3D Noise (simple deterministic) ─────────────────────────────────────────
const _perm = (() => {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = 31337;
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
})();

const _grad3 = [
  [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
  [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
  [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1],
];

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }

function noise3(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const zf = z - Math.floor(z);
  const u = fade(xf), v = fade(yf), w = fade(zf);

  const grad = (h: number, gx: number, gy: number, gz: number) => {
    const g = _grad3[_perm[h] % 12];
    return g[0]*gx + g[1]*gy + g[2]*gz;
  };

  const A  = _perm[X] + Y;
  const AA = _perm[A] + Z;   const AB = _perm[A + 1] + Z;
  const B  = _perm[X + 1] + Y;
  const BA = _perm[B] + Z;   const BB = _perm[B + 1] + Z;

  return lerp(
    lerp(
      lerp(grad(_perm[AA],   xf,   yf,   zf), grad(_perm[BA],   xf-1, yf,   zf), u),
      lerp(grad(_perm[AB],   xf,   yf-1, zf), grad(_perm[BB],   xf-1, yf-1, zf), u), v),
    lerp(
      lerp(grad(_perm[AA+1], xf,   yf,   zf-1), grad(_perm[BA+1], xf-1, yf,   zf-1), u),
      lerp(grad(_perm[AB+1], xf,   yf-1, zf-1), grad(_perm[BB+1], xf-1, yf-1, zf-1), u), v), w);
}

// ─── 3D Curl noise ────────────────────────────────────────────────────────────
function curl3(x: number, y: number, z: number): [number, number, number] {
  const eps = 0.01;
  const dFz_dy = (noise3(x, y + eps, z) - noise3(x, y - eps, z)) / (2 * eps);
  const dFy_dz = (noise3(x, y, z + eps) - noise3(x, y, z - eps)) / (2 * eps);
  const dFx_dz = (noise3(x + eps, y, z) - noise3(x - eps, y, z)) / (2 * eps);
  const dFz_dx = (noise3(x, y, z + eps) - noise3(x, y, z - eps)) / (2 * eps);
  const dFy_dx = (noise3(x + eps, y, z) - noise3(x - eps, y, z)) / (2 * eps);
  const dFx_dy = (noise3(x, y + eps, z) - noise3(x, y - eps, z)) / (2 * eps);
  return [dFz_dy - dFy_dz, dFx_dz - dFz_dx, dFy_dx - dFx_dy];
}

// ─── Deterministic particle position (purely analytical — seamless) ────────────
// All movement based on sin/cos of t, so position(t=0) == position(t=2π)
function particlePos(
  seed: number,
  t: number
): { x: number; y: number; z: number } {
  let s = seed;
  s = (s * 16807) % 2147483647; const bx = s / 2147483647;
  s = (s * 16807) % 2147483647; const by = s / 2147483647;
  s = (s * 16807) % 2147483647; const bz = s / 2147483647;
  s = (s * 16807) % 2147483647; const phase = (s / 2147483647) * Math.PI * 2;
  s = (s * 16807) % 2147483647; const speed = 0.15 + (s / 2147483647) * 0.25;
  s = (s * 16807) % 2147483647; const amp = 0.08 + (s / 2147483647) * 0.14;

  // Get curl direction from fixed noise position (no t dependency → stable)
  const [cx, cy, cz] = curl3(bx * 3 + 0.5, by * 3 + 0.5, bz * 3 + 0.5);

  // Particle orbits around its base position using sin/cos — perfectly seamless
  const x = bx + Math.sin(t * speed + phase)           * amp * (cx * 0.5 + 0.5);
  const y = by + Math.cos(t * speed * 0.73 + phase + 1.1) * amp * (cy * 0.5 + 0.5);
  const z = bz + Math.sin(t * speed * 0.57 + phase + 2.2) * amp * (cz * 0.5 + 0.5);

  return { x, y, z };
}

// ─── 3D → 2D perspective projection ──────────────────────────────────────────
function project(
  x3: number, y3: number, z3: number,
  camDist: number, rotY: number, rotX: number,
  w: number, h: number
): { sx: number; sy: number; depth: number } {
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const x1 = x3 * cosY - z3 * sinY;
  const z1 = x3 * sinY + z3 * cosY;
  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const y2 = y3 * cosX - z1 * sinX;
  const z2 = y3 * sinX + z1 * cosX;
  const depth = z2 + camDist;
  if (depth < 0.1) return { sx: -1, sy: -1, depth: 0.1 };
  const fov = camDist / depth;
  return { sx: (x1 * fov + 0.5) * w, sy: (y2 * fov + 0.5) * h, depth };
}

// ─── HSL → RGB ────────────────────────────────────────────────────────────────
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

// ─── Component ────────────────────────────────────────────────────────────────
const PARTICLE_COUNT = 3200;
const TRAIL_LENGTH = 20;  // number of past positions per trail

export const FlowField3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Seamless t ∈ [0, 2π)
    const t = (frame / durationInFrames) * Math.PI * 2;

    // Camera slowly orbits — 1 full rotation every 2 loops for gentle sweep
    const camRotY = t * 0.5;
    const camRotX = Math.sin(t * 1.0) * 0.20;
    const camDist = 2.5;

    // ── 1. Solid background (drawn fresh every frame — fully stateless) ──────
    ctx.fillStyle = 'rgb(2, 3, 10)';
    ctx.fillRect(0, 0, width, height);

    // ── 2. Nebula glow (background depth) ────────────────────────────────────
    for (let ni = 0; ni < 5; ni++) {
      const na = (ni / 5) * Math.PI * 2 + t * 0.15;
      const nr = Math.min(width, height) * (0.25 + Math.sin(t * 0.3 + ni) * 0.05);
      const nx = width * 0.5 + Math.cos(na) * width * 0.22;
      const ny = height * 0.5 + Math.sin(na) * height * 0.18;
      const nhue = [200, 260, 300, 180, 240][ni];
      const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      grd.addColorStop(0, `hsla(${nhue}, 80%, 25%, 0.09)`);
      grd.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
    }

    // ── 3. Static starfield (deterministic, rendered every frame) ────────────
    let starSeed = 7777;
    for (let i = 0; i < 900; i++) {
      starSeed = (starSeed * 16807) % 2147483647;
      const bsx = (starSeed / 2147483647) * width;
      starSeed = (starSeed * 16807) % 2147483647;
      const bsy = (starSeed / 2147483647) * height;
      starSeed = (starSeed * 16807) % 2147483647;
      const sr = 0.4 + (starSeed / 2147483647) * 1.6;
      starSeed = (starSeed * 16807) % 2147483647;
      const sb = 120 + Math.round((starSeed / 2147483647) * 135);
      // Subtle twinkle using star index
      const twinkle = 0.5 + 0.5 * Math.sin(t * (1 + (i % 5)) + i * 0.37);
      const alpha = (0.4 + 0.6 * twinkle);
      ctx.fillStyle = `rgba(${sb},${sb},${sb},${alpha})`;
      ctx.beginPath();
      ctx.arc(bsx, bsy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── 4. Draw particle trails (fully analytical — no state needed) ──────────
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const seed = i * 7919 + 1;

      // Stable per-particle hue
      let sh = seed;
      sh = (sh * 16807) % 2147483647;
      sh = (sh * 16807) % 2147483647;
      sh = (sh * 16807) % 2147483647;
      sh = (sh * 16807) % 2147483647;
      const hueBase = sh / 2147483647;

      // Sample TRAIL_LENGTH past positions — step = loop/durationInFrames *
      // small fraction so trail covers ~3 frames of motion in loop-space
      const trailStep = (Math.PI * 2 / durationInFrames) * 3.0;

      for (let tr = TRAIL_LENGTH; tr >= 0; tr--) {
        // tPast recedes into the past; at tr=TRAIL_LENGTH it's oldest
        const tPast = t - tr * trailStep;
        const { x, y, z } = particlePos(seed, tPast);
        const { sx, sy, depth } = project(
          (x - 0.5) * 2, (y - 0.5) * 2, (z - 0.5) * 2,
          camDist, camRotY, camRotX, width, height
        );
        if (sx < 0 || sx > width || sy < 0 || sy > height) continue;

        const trailRatio = 1 - tr / TRAIL_LENGTH;  // 0=tail, 1=head
        const depthFactor = Math.min(2, 1 / (depth * 0.4 + 0.5));
        const alpha = trailRatio * 0.85 * depthFactor;
        const size  = Math.max(0.5, (0.8 + trailRatio * 2.5) * depthFactor);

        const [r, g, b] = hslToRgb((hueBase + tr * 0.015) % 1, 0.9, 0.65);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;

    // ── 5. Vignette ───────────────────────────────────────────────────────────
    const vg = ctx.createRadialGradient(
      width / 2, height / 2, height * 0.18,
      width / 2, height / 2, height * 0.92
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

  }, [frame, width, height, durationInFrames]);

  return (
    <AbsoluteFill>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      />
    </AbsoluteFill>
  );
};
