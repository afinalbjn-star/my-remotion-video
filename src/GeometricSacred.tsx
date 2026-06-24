// path: src/GeometricSacred.tsx
// Sacred Geometry Morphing — seamless loop 4K 60fps
// 12+ layers of sacred geometry patterns: Flower of Life, Metatron's Cube,
// Sri Yantra-inspired, Fibonacci spirals, Penrose-inspired tilings
// All using periodic t for perfect seamless loop

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ─── Math helpers ─────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;

function polarPts(cx: number, cy: number, r: number, n: number, offset = 0): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + offset;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  close = true
) {
  if (pts.length === 0) return;
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}

// ─── Flower of Life circle cluster ───────────────────────────────────────────
function flowerOfLife(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number, rings: number
) {
  const centers: [number, number][] = [[cx, cy]];
  for (let ring = 1; ring <= rings; ring++) {
    const pts = polarPts(cx, cy, r * ring, 6, 0);
    for (const [px, py] of pts) {
      centers.push([px, py]);
      // Sub-ring
      if (ring > 1) {
        const sub = polarPts(px, py, r, 6, 0);
        for (const [sx, sy] of sub) {
          const dist = Math.hypot(sx - cx, sy - cy);
          if (dist <= r * rings + 1) centers.push([sx, sy]);
        }
      }
    }
  }
  // Deduplicate approximately
  const unique: [number, number][] = [];
  for (const [px, py] of centers) {
    let dup = false;
    for (const [ux, uy] of unique) {
      if (Math.hypot(px-ux, py-uy) < r * 0.1) { dup = true; break; }
    }
    if (!dup) unique.push([px, py]);
  }
  for (const [px, py] of unique) {
    ctx.moveTo(px + r, py);
    ctx.arc(px, py, r, 0, TAU);
  }
}

// ─── Metatron's Cube ─────────────────────────────────────────────────────────
function metatronsCube(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number
) {
  const centers: [number, number][] = [[cx, cy]];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    centers.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    const a2 = (i / 6) * TAU + TAU / 12;
    centers.push([cx + Math.cos(a2) * r * Math.sqrt(3), cy + Math.sin(a2) * r * Math.sqrt(3)]);
  }
  // Connect all centers
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      ctx.moveTo(centers[i][0], centers[i][1]);
      ctx.lineTo(centers[j][0], centers[j][1]);
    }
  }
}

// ─── Sri Yantra-inspired nested triangles ────────────────────────────────────
function sriYantra(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, layers: number
) {
  for (let l = 0; l < layers; l++) {
    const ratio = 1 - l * 0.18;
    const rr = r * ratio;
    // Upward triangle
    const angle1 = -Math.PI / 2;
    const p1 = polarPts(cx, cy, rr, 3, angle1);
    ctx.moveTo(p1[0][0], p1[0][1]);
    for (const [px, py] of p1) ctx.lineTo(px, py);
    ctx.closePath();
    // Downward triangle (rotated 60deg)
    const angle2 = Math.PI / 6;
    const p2 = polarPts(cx, cy, rr * 0.95, 3, angle2);
    ctx.moveTo(p2[0][0], p2[0][1]);
    for (const [px, py] of p2) ctx.lineTo(px, py);
    ctx.closePath();
  }
}

// ─── Fibonacci spiral ─────────────────────────────────────────────────────────
function fibonacciSpiral(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rMax: number, rotOffset: number, turns: number
) {
  const phi = (1 + Math.sqrt(5)) / 2;
  ctx.moveTo(cx, cy);
  const steps = 600;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * turns * TAU + rotOffset;
    const r = rMax * Math.pow(phi, a / TAU);
    if (r > rMax) break;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
}

// ─── Penrose-inspired star ────────────────────────────────────────────────────
function penroseStar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number, spikes: number, innerRatio: number
) {
  const pts: [number, number][] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * TAU - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * innerRatio;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  drawPolygon(ctx, pts);
}

// ─── Component ────────────────────────────────────────────────────────────────
export const GeometricSacred: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = (frame / durationInFrames) * TAU; // [0, 2π)
    const cx = width / 2;
    const cy = height / 2;
    const baseR = Math.min(width, height) * 0.38;

    // ── Background gradient ────────────────────────────────────────────────
    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.8);
    bg.addColorStop(0, '#060210');
    bg.addColorStop(0.5, '#03000d');
    bg.addColorStop(1, '#000000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Subtle moving background nebula
    for (let i = 0; i < 5; i++) {
      const nx = cx + Math.sin(t * 0.3 + i * 1.2) * width * 0.3;
      const ny = cy + Math.cos(t * 0.25 + i * 0.9) * height * 0.25;
      const nr = baseR * (1.5 + Math.sin(t * 0.4 + i) * 0.3);
      const hue = (i * 72 + t * 20) % 360;
      const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      grd.addColorStop(0, `hsla(${hue}, 80%, 30%, 0.06)`);
      grd.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
    }

    // ─── Layer drawing helper ──────────────────────────────────────────────
    const drawLayer = (
      drawFn: () => void,
      hue: number,
      alpha: number,
      lineWidth: number,
      blur = 0,
      fillAlpha = 0
    ) => {
      ctx.save();
      if (blur > 0) ctx.filter = `blur(${blur}px)`;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `hsla(${hue}, 95%, 70%, ${alpha})`;
      if (fillAlpha > 0) ctx.fillStyle = `hsla(${hue}, 95%, 50%, ${fillAlpha})`;
      ctx.beginPath();
      drawFn();
      ctx.stroke();
      if (fillAlpha > 0) ctx.fill();
      ctx.filter = 'none';
      ctx.restore();
    };

    // ─── Glow pass (blur version of all geometry) ──────────────────────────
    const drawAll = (glowPass: boolean) => {
      const lw = glowPass ? 8 : 2;
      const al = glowPass ? 0.06 : 0.55;
      const blr = glowPass ? 12 : 0;

      // ── Layer 1: Flower of Life (slow rotate) ──────────────────────────
      const fol_r = baseR * (0.18 + Math.sin(t * 0.5) * 0.02);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.1);
      ctx.translate(-cx, -cy);
      drawLayer(() => flowerOfLife(ctx, cx, cy, fol_r, 3), 180 + t * 20 % 360, al, lw, blr);
      ctx.restore();

      // ── Layer 2: Metatron's Cube (counter-rotate) ─────────────────────
      const met_r = baseR * (0.58 + Math.sin(t * 0.4) * 0.05);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.08);
      ctx.translate(-cx, -cy);
      drawLayer(() => metatronsCube(ctx, cx, cy, met_r), 270 + t * 15 % 360, al * 0.8, lw * 0.7, blr * 0.8);
      ctx.restore();

      // ── Layer 3: Sri Yantra inner ─────────────────────────────────────
      const sri_r = baseR * (0.72 + Math.cos(t * 0.6) * 0.04);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.05);
      ctx.translate(-cx, -cy);
      drawLayer(() => sriYantra(ctx, cx, cy, sri_r, 9), 45 + t * 25 % 360, al * 1.1, lw * 0.8, blr);
      ctx.restore();

      // ── Layer 4: Fibonacci spiral (CW) ────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.15);
      ctx.translate(-cx, -cy);
      drawLayer(() => fibonacciSpiral(ctx, cx, cy, baseR * 0.8, t * 0.5, 4), 120 + t * 18 % 360, al * 0.9, lw * 0.6, blr);
      ctx.restore();

      // ── Layer 5: Fibonacci spiral (CCW) ──────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.2);
      ctx.translate(-cx, -cy);
      drawLayer(() => fibonacciSpiral(ctx, cx, cy, baseR * 0.75, -t * 0.5 + Math.PI, 4), 300 + t * 12 % 360, al * 0.8, lw * 0.6, blr);
      ctx.restore();

      // ── Layer 6: Penrose 10-star (rotate) ────────────────────────────
      const star_r = baseR * (0.88 + Math.sin(t * 0.7) * 0.04);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.07);
      ctx.translate(-cx, -cy);
      drawLayer(() => penroseStar(ctx, cx, cy, star_r, 10, 0.382), 60 + t * 22 % 360, al, lw, blr);
      ctx.restore();

      // ── Layer 7: Penrose 5-star (counter) ────────────────────────────
      const star2_r = baseR * (0.65 + Math.cos(t * 0.55) * 0.06);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.12);
      ctx.translate(-cx, -cy);
      drawLayer(() => penroseStar(ctx, cx, cy, star2_r, 5, 0.5), 210 + t * 30 % 360, al, lw * 1.1, blr);
      ctx.restore();

      // ── Layer 8: Hexagonal rings ──────────────────────────────────────
      for (let ring = 1; ring <= 8; ring++) {
        const hr = baseR * 0.115 * ring + Math.sin(t * 0.4 + ring) * baseR * 0.01;
        const hpts = polarPts(cx, cy, hr, 6, t * 0.03 * ring);
        ctx.save();
        drawLayer(() => { ctx.beginPath(); drawPolygon(ctx, hpts); }, 
          (180 + ring * 25 + t * 15) % 360, al * 0.7, lw * 0.5, blr * 0.5);
        ctx.restore();
      }

      // ── Layer 9: Rotating circles ─────────────────────────────────────
      for (let c = 0; c < 12; c++) {
        const ca = (c / 12) * TAU + t * 0.2;
        const cr = baseR * (0.5 + Math.sin(t * 0.3 + c * 0.5) * 0.1);
        const cRadius = baseR * (0.08 + Math.sin(t * 0.5 + c * 0.8) * 0.03);
        const ccx = cx + Math.cos(ca) * cr;
        const ccy = cy + Math.sin(ca) * cr;
        drawLayer(() => {
          ctx.moveTo(ccx + cRadius, ccy);
          ctx.arc(ccx, ccy, cRadius, 0, TAU);
        }, (c * 30 + t * 40) % 360, al * 0.6, lw * 0.5, blr * 0.5);
      }

      // ── Layer 10: Outer mandala ring ──────────────────────────────────
      const mr = baseR * (0.95 + Math.sin(t * 0.3) * 0.03);
      const petalCount = 24;
      for (let p = 0; p < petalCount; p++) {
        const pa = (p / petalCount) * TAU + t * 0.04;
        const px1 = cx + Math.cos(pa) * mr;
        const py1 = cy + Math.sin(pa) * mr;
        const pa2 = pa + TAU / petalCount;
        const px2 = cx + Math.cos(pa2) * mr;
        const py2 = cy + Math.sin(pa2) * mr;
        const pMidX = (px1 + px2) / 2 + Math.cos(pa + TAU / petalCount / 2) * mr * 0.15;
        const pMidY = (py1 + py2) / 2 + Math.sin(pa + TAU / petalCount / 2) * mr * 0.15;
        drawLayer(() => {
          ctx.moveTo(cx, cy);
          ctx.quadraticCurveTo(pMidX, pMidY, px1, py1);
        }, (p * 15 + t * 20) % 360, al * 0.5, lw * 0.4, blr * 0.5);
      }

      // ── Layer 11: Interference rings ─────────────────────────────────
      for (let ri = 1; ri <= 20; ri++) {
        const rr = baseR * 0.05 * ri + Math.sin(t + ri * 0.5) * 5;
        drawLayer(() => {
          ctx.moveTo(cx + rr, cy);
          ctx.arc(cx, cy, rr, 0, TAU);
        }, (ri * 18 + t * 25) % 360, al * 0.35, lw * 0.3, blr * 0.4);
      }

      // ── Layer 12: Vesica Piscis ───────────────────────────────────────
      const vr = baseR * (0.45 + Math.sin(t * 0.5) * 0.05);
      const offset = vr * Math.cos(Math.PI / 3);
      for (let v = 0; v < 6; v++) {
        const va = (v / 6) * TAU + t * 0.06;
        const vx = cx + Math.cos(va) * offset;
        const vy = cy + Math.sin(va) * offset;
        drawLayer(() => {
          ctx.moveTo(vx + vr, vy);
          ctx.arc(vx, vy, vr, 0, TAU);
        }, (v * 60 + t * 18) % 360, al * 0.5, lw * 0.6, blr * 0.6);
      }
    };

    // Glow pass
    drawAll(true);
    // Sharp pass
    drawAll(false);

    // ── Center orb ────────────────────────────────────────────────────────
    const orbPulse = 0.015 + Math.sin(t * 3) * 0.005;
    const orbR = baseR * orbPulse * 10;
    const orbHue = (t / TAU) * 360;
    const orbGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR);
    orbGrad.addColorStop(0, `hsla(${orbHue}, 100%, 95%, 0.95)`);
    orbGrad.addColorStop(0.3, `hsla(${orbHue}, 90%, 70%, 0.5)`);
    orbGrad.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, orbR, 0, TAU);
    ctx.fill();

    // ── Vignette ─────────────────────────────────────────────────────────
    const vg = ctx.createRadialGradient(cx, cy, Math.min(width,height)*0.25, cx, cy, Math.max(width,height)*0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.75)');
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
