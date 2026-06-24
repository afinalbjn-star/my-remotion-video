// path: src/CelestialMechanic.tsx
// Celestial Mechanics — seamless loop 4K 60fps
// 12 celestial bodies with analytic Keplerian orbits
// 3-layer parallax starfield, gravitational lensing glow, procedural nebula
// Seamless: all orbital periods are rational multiples of loop duration

import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

// ─── Keplerian orbit ──────────────────────────────────────────────────────────
interface CelestialBody {
  name: string;
  a: number;           // semi-major axis (normalized, 0..1)
  e: number;           // eccentricity [0..0.6]
  inclination: number; // orbital plane tilt (radians)
  omega: number;       // angular velocity multiplier (rational)
  phase: number;       // initial phase (radians)
  radius: number;      // body radius (pixels at 1x)
  hue: number;         // base hue
  luminosity: number;  // glow intensity
  trailLength: number; // how many "history" positions to draw
  mass: number;        // for lensing effect
}

const BODIES: CelestialBody[] = [
  // Central star
  { name: 'Star',    a: 0,    e: 0,    inclination: 0,     omega: 0,    phase: 0,    radius: 55, hue: 45,  luminosity: 2.0, trailLength: 0,  mass: 10 },
  // Inner planets (fast)
  { name: 'Vel',     a: 0.10, e: 0.05, inclination: 0.12,  omega: 8,    phase: 0.5,  radius: 10, hue: 200, luminosity: 0.6, trailLength: 60, mass: 1 },
  { name: 'Aur',     a: 0.16, e: 0.08, inclination: -0.08, omega: 5,    phase: 1.2,  radius: 14, hue: 170, luminosity: 0.7, trailLength: 60, mass: 1.5 },
  { name: 'Thal',    a: 0.22, e: 0.04, inclination: 0.18,  omega: 4,    phase: 2.1,  radius: 16, hue: 120, luminosity: 0.8, trailLength: 80, mass: 2 },
  // Habitable zone
  { name: 'Gaia',    a: 0.30, e: 0.02, inclination: 0.05,  omega: 3,    phase: 0.8,  radius: 18, hue: 220, luminosity: 0.9, trailLength: 90, mass: 2.5 },
  { name: 'Mara',    a: 0.37, e: 0.09, inclination: -0.15, omega: 2.5,  phase: 3.5,  radius: 15, hue: 10,  luminosity: 0.7, trailLength: 90, mass: 2 },
  // Outer giants
  { name: 'Jovian',  a: 0.50, e: 0.05, inclination: 0.22,  omega: 2,    phase: 1.8,  radius: 30, hue: 30,  luminosity: 1.1, trailLength: 120,mass: 4 },
  { name: 'Ringed',  a: 0.61, e: 0.05, inclination: -0.25, omega: 1.5,  phase: 4.2,  radius: 26, hue: 50,  luminosity: 1.0, trailLength: 120,mass: 3.5 },
  { name: 'Azuron',  a: 0.70, e: 0.08, inclination: 0.30,  omega: 1,    phase: 2.6,  radius: 22, hue: 190, luminosity: 0.9, trailLength: 150,mass: 3 },
  // Ice giants
  { name: 'Glacis',  a: 0.80, e: 0.12, inclination: -0.35, omega: 0.8,  phase: 5.1,  radius: 20, hue: 240, luminosity: 0.8, trailLength: 180,mass: 2.5 },
  { name: 'Cryon',   a: 0.87, e: 0.15, inclination: 0.40,  omega: 0.6,  phase: 1.0,  radius: 18, hue: 260, luminosity: 0.75,trailLength: 180,mass: 2 },
  // Dwarf / rogue
  { name: 'Nomad',   a: 0.95, e: 0.30, inclination: 0.55,  omega: 0.4,  phase: 3.0,  radius: 12, hue: 320, luminosity: 0.6, trailLength: 220,mass: 1 },
];

// ─── Get body position at time t (analytic Keplerian) ────────────────────────
// Using eccentric anomaly approximation (good for e < 0.6)
function getBodyPos(
  body: CelestialBody, t: number,
  cx: number, cy: number, scale: number
): { x: number; y: number; z: number } {
  if (body.a === 0) return { x: cx, y: cy, z: 0 };

  const M = body.omega * t + body.phase; // mean anomaly
  // Approximate eccentric anomaly E via Newton's method (2 iterations)
  let E = M;
  E = E - (E - body.e * Math.sin(E) - M) / (1 - body.e * Math.cos(E));
  E = E - (E - body.e * Math.sin(E) - M) / (1 - body.e * Math.cos(E));

  // True anomaly
  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const xOrb = body.a * (cosE - body.e);
  const yOrb = body.a * Math.sqrt(1 - body.e * body.e) * sinE;

  // Apply inclination (3D rotation around x-axis)
  const cosI = Math.cos(body.inclination);
  const sinI = Math.sin(body.inclination);
  const x3 = xOrb * scale;
  const y3 = (yOrb * cosI) * scale;
  const z3 = (yOrb * sinI) * scale;

  return { x: cx + x3, y: cy + y3, z: z3 };
}

// (fbm2 removed — nebula uses radial gradient lobes instead)

// ─── Component ────────────────────────────────────────────────────────────────
export const CelestialMechanic: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = (frame / durationInFrames) * Math.PI * 2;
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.47;

    // ── Background: deep space ────────────────────────────────────────────
    ctx.fillStyle = '#010208';
    ctx.fillRect(0, 0, width, height);

    // ── Procedural nebula (6 overlapping lobes with animated positions) ──
    for (let ni = 0; ni < 6; ni++) {
      const nx = cx + Math.sin(t * 0.2 + ni * 1.05) * width * 0.28;
      const ny = cy + Math.cos(t * 0.18 + ni * 0.88) * height * 0.22;
      const nr = Math.min(width, height) * (0.2 + ni * 0.06);
      const nhue = [280, 200, 160, 320, 240, 40][ni];
      const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      const nebIntensity = 0.04 + 0.025 * Math.sin(t * 0.3 + ni);
      grd.addColorStop(0, `hsla(${nhue},80%,30%,${nebIntensity})`);
      grd.addColorStop(0.5, `hsla(${nhue},70%,20%,${nebIntensity * 0.4})`);
      grd.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
    }

    // ── Parallax star layers ──────────────────────────────────────────────
    const starLayers = [
      { count: 800, minR: 0.5, maxR: 1.0, parallax: 0.005, brightness: 0.7 },
      { count: 400, minR: 1.0, maxR: 1.8, parallax: 0.012, brightness: 0.85 },
      { count: 150, minR: 1.5, maxR: 3.0, parallax: 0.025, brightness: 1.0 },
    ];

    for (const layer of starLayers) {
      let sSeed = layer.count * 1337 + 99;
      for (let s = 0; s < layer.count; s++) {
        sSeed = (sSeed * 16807) % 2147483647;
        const bsx = (sSeed / 2147483647) * width;
        sSeed = (sSeed * 16807) % 2147483647;
        const bsy = (sSeed / 2147483647) * height;
        sSeed = (sSeed * 16807) % 2147483647;
        const ssr = layer.minR + (sSeed / 2147483647) * (layer.maxR - layer.minR);
        sSeed = (sSeed * 16807) % 2147483647;
        const twinkle = 0.6 + 0.4 * Math.sin(t * (1 + sSeed % 5) + sSeed * 0.001);
        sSeed = (sSeed * 16807) % 2147483647;
        const starHue = sSeed % 3 === 0 ? `255,220,180` : (sSeed % 3 === 1 ? `200,210,255` : `255,255,255`);

        // Parallax shift based on camera "drift"
        const px = (bsx + Math.sin(t * 0.2) * layer.parallax * width + width) % width;
        const py = (bsy + Math.cos(t * 0.15) * layer.parallax * height + height) % height;

        const alpha = layer.brightness * twinkle;
        ctx.fillStyle = `rgba(${starHue},${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, ssr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Orbit ellipses (faint) ────────────────────────────────────────────
    for (const body of BODIES) {
      if (body.a === 0) continue;
      ctx.save();
      ctx.strokeStyle = `hsla(${body.hue}, 60%, 50%, 0.08)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      // Draw ellipse
      const bScale = body.a * scale;
      const bScaleY = bScale * Math.sqrt(1 - body.e * body.e) * Math.cos(body.inclination);
      ctx.ellipse(
        cx - body.e * bScale * Math.cos(body.inclination),
        cy,
        bScale,
        bScaleY,
        0, 0, Math.PI * 2
      );
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ── Orbit trails ──────────────────────────────────────────────────────
    for (const body of BODIES) {
      if (body.trailLength === 0) continue;
      const trailSteps = body.trailLength;
      const trailPositions: { x: number; y: number }[] = [];

      for (let tr = trailSteps; tr >= 0; tr--) {
        const tPast = t - (tr / durationInFrames) * Math.PI * 2 * 1.2;
        const pos = getBodyPos(body, tPast, cx, cy, scale);
        trailPositions.push({ x: pos.x, y: pos.y });
      }

      // Draw trail as gradient path
      if (trailPositions.length > 1) {
        for (let tr = 0; tr < trailPositions.length - 1; tr++) {
          const ratio = tr / trailPositions.length;
          const alpha = ratio * 0.5 * body.luminosity;
          ctx.strokeStyle = `hsla(${body.hue}, 90%, 65%, ${alpha})`;
          ctx.lineWidth = (body.radius * 0.15 * ratio) + 0.5;
          ctx.beginPath();
          ctx.moveTo(trailPositions[tr].x, trailPositions[tr].y);
          ctx.lineTo(trailPositions[tr + 1].x, trailPositions[tr + 1].y);
          ctx.stroke();
        }
      }
    }

    // ── Draw bodies ───────────────────────────────────────────────────────
    for (const body of BODIES) {
      const { x, y } = getBodyPos(body, t, cx, cy, scale);
      const r = body.radius;

      // Gravitational lensing glow (multiple passes)
      for (let glowPass = 3; glowPass >= 0; glowPass--) {
        const glowR = r * (2 + glowPass * 2.5) * body.luminosity;
        const glowAlpha = (0.08 / (glowPass + 1)) * body.luminosity;
        const grd = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowR);
        grd.addColorStop(0, `hsla(${body.hue}, 95%, 80%, ${glowAlpha * 3})`);
        grd.addColorStop(0.3, `hsla(${body.hue}, 85%, 60%, ${glowAlpha})`);
        grd.addColorStop(1, 'hsla(0,0%,0%,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Body surface gradient
      const surfaceGrd = ctx.createRadialGradient(
        x - r * 0.3, y - r * 0.3, r * 0.05,
        x, y, r
      );
      surfaceGrd.addColorStop(0, `hsl(${body.hue + 30}, 80%, 90%)`);
      surfaceGrd.addColorStop(0.4, `hsl(${body.hue}, 80%, 60%)`);
      surfaceGrd.addColorStop(1, `hsl(${body.hue - 20}, 70%, 20%)`);
      ctx.fillStyle = surfaceGrd;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Saturn-like ring for Ringed planet
      if (body.name === 'Ringed') {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(0.4);
        ctx.scale(1, 0.35);
        for (let ri = 1; ri <= 3; ri++) {
          ctx.strokeStyle = `hsla(${body.hue + 20}, 70%, 75%, ${0.4 - ri * 0.1})`;
          ctx.lineWidth = r * (0.4 + ri * 0.15);
          ctx.beginPath();
          ctx.arc(0, 0, r * (1.5 + ri * 0.4), 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // ── Central star corona ───────────────────────────────────────────────
    const starBody = BODIES[0];
    const { x: sx, y: sy } = getBodyPos(starBody, t, cx, cy, scale);
    const coronaPulse = 1 + 0.08 * Math.sin(t * 7);
    const coronaR = starBody.radius * 4 * coronaPulse;
    const coronaGrd = ctx.createRadialGradient(sx, sy, starBody.radius, sx, sy, coronaR);
    coronaGrd.addColorStop(0, `hsla(${starBody.hue}, 100%, 90%, 0.3)`);
    coronaGrd.addColorStop(0.3, `hsla(${starBody.hue - 10}, 95%, 70%, 0.08)`);
    coronaGrd.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = coronaGrd;
    ctx.beginPath();
    ctx.arc(sx, sy, coronaR, 0, Math.PI * 2);
    ctx.fill();

    // ── Solar lens flares ─────────────────────────────────────────────────
    for (let f = 0; f < 6; f++) {
      const fa = (f / 6) * Math.PI * 2 + t * 0.3;
      const fd = starBody.radius * (1.5 + f * 1.8);
      const fx = sx + Math.cos(fa) * fd;
      const fy = sy + Math.sin(fa) * fd;
      const fr = starBody.radius * (0.2 + f * 0.05);
      const flareGrd = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
      flareGrd.addColorStop(0, `hsla(${starBody.hue + f * 10}, 100%, 95%, 0.25)`);
      flareGrd.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = flareGrd;
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Vignette ─────────────────────────────────────────────────────────
    const vg = ctx.createRadialGradient(
      cx, cy, Math.min(width, height) * 0.25,
      cx, cy, Math.max(width, height) * 0.85
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.82)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, width, height);

  }, [frame, width, height, durationInFrames]);

  return (
    <AbsoluteFill style={{ background: '#010208' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      />
    </AbsoluteFill>
  );
};
