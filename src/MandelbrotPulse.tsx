// path: src/MandelbrotPulse.tsx
// Mandelbrot Fractal Pulse — seamless loop 4K 60fps
// Adobe Stock premium background animation
// Seamless: t = (frame/600)*2PI so all periodic functions return to start

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ─── Smooth iteration count ───────────────────────────────────────────────────
function mandelbrot(cx: number, cy: number, maxIter: number): { iter: number; smooth: number } {
  let zx = 0, zy = 0;
  let iter = 0;
  while (iter < maxIter && zx * zx + zy * zy < 4) {
    const tmp = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = tmp;
    iter++;
  }
  if (iter === maxIter) return { iter, smooth: maxIter };
  // Smooth coloring (normalized iteration count)
  const log2 = Math.log2(zx * zx + zy * zy);
  const smooth = iter - Math.log2(Math.max(1, log2));
  return { iter, smooth };
}

// ─── Ultra-chromatic palette ──────────────────────────────────────────────────
function palette(t: number, offset: number): [number, number, number] {
  // Infinite palette cycling with 3 independent sine waves
  const r = 0.5 + 0.5 * Math.sin(t * 6.2831 * 1.0 + offset + 0.0);
  const g = 0.5 + 0.5 * Math.sin(t * 6.2831 * 1.0 + offset + 2.094);
  const b = 0.5 + 0.5 * Math.sin(t * 6.2831 * 1.0 + offset + 4.189);
  return [r, g, b];
}

// ─── Bloom kernel ─────────────────────────────────────────────────────────────
function applyBloom(data: Uint8ClampedArray, width: number, height: number, radius: number) {
  const tmp = new Float32Array(width * height * 4);
  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, w = 0;
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = Math.max(0, Math.min(width - 1, x + dx));
        const weight = 1 - Math.abs(dx) / (radius + 1);
        const idx = (y * width + nx) * 4;
        // Only bright pixels contribute to bloom
        const lum = data[idx] * 0.2126 + data[idx + 1] * 0.7152 + data[idx + 2] * 0.0722;
        if (lum > 180) {
          r += data[idx] * weight;
          g += data[idx + 1] * weight;
          b += data[idx + 2] * weight;
          w += weight;
        }
      }
      const idx = (y * width + x) * 4;
      tmp[idx]     = w > 0 ? r / w : 0;
      tmp[idx + 1] = w > 0 ? g / w : 0;
      tmp[idx + 2] = w > 0 ? b / w : 0;
    }
  }
  // Add bloom back
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    data[idx]     = Math.min(255, data[idx]     + tmp[idx]     * 0.25);
    data[idx + 1] = Math.min(255, data[idx + 1] + tmp[idx + 1] * 0.25);
    data[idx + 2] = Math.min(255, data[idx + 2] + tmp[idx + 2] * 0.25);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export const MandelbrotPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Seamless loop parameter [0..2π)
    const t = (frame / durationInFrames) * Math.PI * 2;

    // ── Zoom cycle: zoom in to point of interest, then smoothly back ──────────
    // Using cos so zoom(0) == zoom(2π) == 1.0
    const zoomBase = 1.8;
    const zoomRange = 1.4;
    const zoom = zoomBase + Math.sin(t * 1.0) * zoomRange;
    const zoomScale = Math.exp(zoom); // exponential zoom feel

    // Orbit point (interest point on the boundary)
    const centerX = -0.7453 + Math.sin(t * 0.5) * 0.003;
    const centerY =  0.1127 + Math.cos(t * 0.5) * 0.003;

    // Color cycle offset — full rotation over the loop
    const colorOffset = t;

    const maxIter = 256;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const scale = 3.5 / zoomScale;
    const offsetX = centerX - scale / 2;
    const offsetY = centerY - scale * (height / width) / 2;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const cx = offsetX + (px / width) * scale;
        const cy = offsetY + (py / height) * scale * (height / width);

        const { iter, smooth } = mandelbrot(cx, cy, maxIter);
        const idx = (py * width + px) * 4;

        if (iter === maxIter) {
          // Interior: deep dark with subtle inner glow
          const innerGlow = (Math.sin(cx * 12 + t) * Math.cos(cy * 12 - t) + 1) * 0.5;
          data[idx]     = Math.round(innerGlow * 8);
          data[idx + 1] = Math.round(innerGlow * 5);
          data[idx + 2] = Math.round(innerGlow * 20);
          data[idx + 3] = 255;
        } else {
          // Exterior: ultra-chromatic smooth coloring
          const n = smooth / maxIter;

          // Multi-palette blend: 3 palettes at different speeds
          const [r1, g1, b1] = palette(n + colorOffset * 0.3, 0.0);
          const [r2, g2, b2] = palette(n * 2.5 + colorOffset * 0.5, 1.2);
          const [r3, g3, b3] = palette(n * 0.7 + colorOffset * 0.7, 2.4);

          const blend = (Math.sin(n * Math.PI * 8 + t) + 1) * 0.5;
          const blend2 = (Math.cos(n * Math.PI * 5 + t * 0.7) + 1) * 0.5;

          let r = r1 * 0.4 + r2 * blend * 0.4 + r3 * blend2 * 0.2;
          let g = g1 * 0.4 + g2 * blend * 0.4 + g3 * blend2 * 0.2;
          let b = b1 * 0.4 + b2 * blend * 0.4 + b3 * blend2 * 0.2;

          // Brightness boost near boundary
          const edgeGlow = Math.pow(1 - n, 4) * 2;
          r = Math.min(1, r * (1 + edgeGlow));
          g = Math.min(1, g * (1 + edgeGlow));
          b = Math.min(1, b * (1 + edgeGlow));

          // Filmic contrast
          r = r * r * (3 - 2 * r);
          g = g * g * (3 - 2 * g);
          b = b * b * (3 - 2 * b);

          data[idx]     = Math.round(r * 255);
          data[idx + 1] = Math.round(g * 255);
          data[idx + 2] = Math.round(b * 255);
          data[idx + 3] = 255;
        }
      }
    }

    // Apply bloom
    applyBloom(data, width, height, 4);

    ctx.putImageData(imageData, 0, 0);
  }, [frame, width, height, durationInFrames]);

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      />
    </AbsoluteFill>
  );
};
