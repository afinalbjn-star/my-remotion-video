// path: src/QuantumEntanglement.tsx
// Quantum Entanglement Wave — seamless loop 4K 60fps
// 20+ superposed quantum wave sources — complex amplitude (Re+Im) per pixel
// Phase-angle HSL coloring, magnitude → brightness
// Seamless: all wave frequencies are integer multiples of loop frequency

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ─── Wave sources ─────────────────────────────────────────────────────────────
// Each source: [x, y, wavenumber_x, wavenumber_y, omega, phase]
// omega must be an integer to ensure seamless loop at t = 2π
interface WaveSource {
  x: number;  // 0..1
  y: number;  // 0..1
  kx: number; // spatial frequency x
  ky: number; // spatial frequency y
  omega: number; // temporal frequency (integer!)
  phase: number; // phase offset
  amp: number;   // amplitude
  hueShift: number; // hue offset for this source
}

function generateSources(count: number): WaveSource[] {
  const sources: WaveSource[] = [];
  let seed = 42424242;
  const rng = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    sources.push({
      x: rng(),
      y: rng(),
      kx: (rng() - 0.5) * 18,
      ky: (rng() - 0.5) * 18,
      omega: 1 + Math.floor(rng() * 5), // integer: 1..5
      phase: rng() * Math.PI * 2,
      amp: 0.3 + rng() * 0.7,
      hueShift: rng(),
    });
  }
  return sources;
}

// Second set — "entangled" twin sources (correlated)
function generateEntangledSources(primary: WaveSource[]): WaveSource[] {
  return primary.map((s, i) => ({
    x: 1 - s.x,
    y: 1 - s.y,
    kx: -s.kx,
    ky: -s.ky,
    omega: s.omega,
    phase: s.phase + Math.PI, // anti-phase = entanglement
    amp: s.amp * 0.8,
    hueShift: (s.hueShift + 0.5) % 1,
  }));
}

const PRIMARY_SOURCES = generateSources(12);
const ENTANGLED_SOURCES = generateEntangledSources(PRIMARY_SOURCES);
const EXTRA_SOURCES = generateSources(10).map(s => ({ ...s, amp: s.amp * 0.5 }));
const ALL_SOURCES = [...PRIMARY_SOURCES, ...ENTANGLED_SOURCES, ...EXTRA_SOURCES];

// ─── HSL → RGB ────────────────────────────────────────────────────────────────
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

// ─── Component ────────────────────────────────────────────────────────────────
export const QuantumEntanglement: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = (frame / durationInFrames) * Math.PI * 2;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Global hue rotation — seamless (full rotation over one loop)
    const globalHue = (frame / durationInFrames);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const nx = px / width;
        const ny = py / height;

        // Superpose all wave sources — complex amplitude
        let re = 0, im = 0;

        for (const src of ALL_SOURCES) {
          const dx = nx - src.x;
          const dy = ny - src.y;
          const r2 = dx * dx + dy * dy;

          // Spherical wave: A/r * exp(i(kr - ωt + φ))
          // Plane + spherical hybrid
          const spatialPhase = src.kx * nx + src.ky * ny + Math.sqrt(r2) * 12;
          const temporalPhase = src.omega * t;
          const totalPhase = spatialPhase - temporalPhase + src.phase;

          // Envelope: Gaussian decay from source (but broad)
          const envelope = Math.exp(-r2 * 3) * 1.5 + 0.3;
          const amp = src.amp * envelope;

          re += amp * Math.cos(totalPhase);
          im += amp * Math.sin(totalPhase);
        }

        // Magnitude (probability density)
        const mag = Math.sqrt(re * re + im * im);

        // Phase angle → hue
        const phaseAngle = Math.atan2(im, re) / (Math.PI * 2) + 0.5; // [0..1]

        // Normalize magnitude (soft clamp)
        const normMag = mag / (mag + 2.5);

        // ── Coloring: phase → hue, magnitude → lightness ───────────────
        const hue = (phaseAngle + globalHue) % 1;

        // Saturation boosted near zero magnitude (quantum vacuum glow)
        const saturation = 0.85 + (1 - normMag) * 0.15;

        // Lightness: dark background, bright at high mag, subtle glow at low
        const lightness = normMag * 0.6 + 0.03;

        const [r, g, b] = hslToRgb(hue, saturation, lightness);

        // ── Interference fringe enhancement ───────────────────────────
        // Boost contrast at wave crests/troughs
        const fringeBoost = Math.pow(Math.abs(Math.cos(re * 4)), 3) * 0.15;
        const rr = Math.min(1, r + fringeBoost);
        const gg = Math.min(1, g + fringeBoost * 0.8);
        const bb = Math.min(1, b + fringeBoost * 1.2);

        // ── Probability current visualization (subtle overlay) ─────────
        // J ∝ Im(ψ* ∇ψ) — add subtle gradient highlight
        const jMag = Math.min(1, Math.abs(re * 0.3 + im * 0.3) * 0.1);

        const idx = (py * width + px) * 4;
        data[idx]     = Math.min(255, Math.round(rr * 255 + jMag * 20));
        data[idx + 1] = Math.min(255, Math.round(gg * 255 + jMag * 15));
        data[idx + 2] = Math.min(255, Math.round(bb * 255 + jMag * 25));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // ── Post-processing: glow overlay ─────────────────────────────────────
    // Draw secondary glow pass (radial gradient at hotspots)
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 8; i++) {
      const src = PRIMARY_SOURCES[i];
      const gx = src.x * width;
      const gy = src.y * height;
      const gr = Math.min(width, height) * 0.08;
      const pulse = 0.5 + 0.5 * Math.sin(t * src.omega + src.phase);
      const gHue = Math.round((src.hueShift + globalHue) % 1 * 360);
      const grd = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      grd.addColorStop(0, `hsla(${gHue}, 100%, 80%, ${0.12 * pulse})`);
      grd.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.globalCompositeOperation = 'source-over';

    // ── Vignette ─────────────────────────────────────────────────────────
    const vg = ctx.createRadialGradient(width/2, height/2, height * 0.18,
                                        width/2, height/2, height * 0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

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
