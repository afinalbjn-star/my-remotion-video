import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Inter:wght@400;600;700&display=swap');`;

const VIRUS_THEMES = [
  { capsid: '#f43f5e', glow: '#fda4af', spike: '#7c3aed', tip: '#06b6d4', label: 'SARS-CoV-2'  },
  { capsid: '#0ea5e9', glow: '#bae6fd', spike: '#0891b2', tip: '#22d3ee', label: 'INFLUENZA-A' },
  { capsid: '#10b981', glow: '#a7f3d0', spike: '#065f46', tip: '#34d399', label: 'ADENOVIRUS'  },
  { capsid: '#8b5cf6', glow: '#ddd6fe', spike: '#4c1d95', tip: '#f59e0b', label: 'RHINOVIRUS'  },
  { capsid: '#f97316', glow: '#fed7aa', spike: '#c2410c', tip: '#fcd34d', label: 'ROTAVIRUS'   },
  { capsid: '#ec4899', glow: '#fbcfe8', spike: '#831843', tip: '#a5f3fc', label: 'DENGUE'      },
];

// ─── JELLY BLOB CAPSID ────────────────────────────────────────────────────────
// Generates an SVG path for a wobbly, jelly-like organic blob.
// The radius at each angle is modulated by superposed sine waves.
function jellyBlob(
  cx: number, cy: number,
  baseR: number,
  t: number,          // global time (0→2π)
  blobPhase: number,  // per-virus phase offset
  squashX: number,    // squash-stretch X multiplier (velocity based)
  squashY: number,    // squash-stretch Y multiplier
): string {
  const pts = 72; // number of polygon vertices (smooth enough)
  const coords: Array<[number, number]> = [];

  for (let i = 0; i < pts; i++) {
    const angle = (i / pts) * Math.PI * 2;

    // Superposition of 4 wobble harmonics → organic jelly deformation
    const w1 = Math.sin(angle * 2 + t * 1.8  + blobPhase) * 0.055;
    const w2 = Math.sin(angle * 3 - t * 2.4  + blobPhase * 1.3) * 0.035;
    const w3 = Math.cos(angle * 5 + t * 3.1  + blobPhase * 0.7) * 0.018;
    const w4 = Math.cos(angle * 7 - t * 1.2  + blobPhase * 1.8) * 0.010;
    const r  = baseR * (1 + w1 + w2 + w3 + w4);

    // Apply squash-stretch (elliptical deformation from movement velocity)
    const x = cx + Math.cos(angle) * r * squashX;
    const y = cy + Math.sin(angle) * r * squashY;
    coords.push([x, y]);
  }

  // Build smooth cubic bezier path through all points
  const n = coords.length;
  let d = `M ${coords[0][0].toFixed(2)} ${coords[0][1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = coords[(i - 1 + n) % n];
    const p1 = coords[i];
    const p2 = coords[(i + 1) % n];
    const p3 = coords[(i + 2) % n];
    // Catmull-Rom → cubic bezier control points
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  d += ' Z';
  return d;
}

// ─── SINGLE VIRUS RENDERER ────────────────────────────────────────────────────
interface VirusProps {
  cx: number; cy: number;
  r: number;
  spikeCount: number;
  spikeLen: number;
  theme: typeof VIRUS_THEMES[0];
  rotation: number;
  t: number;
  blobPhase: number;
  squashX: number;
  squashY: number;
  opacity: number;
  sf: number;
}

function renderVirus({
  cx, cy, r, spikeCount, spikeLen, theme, rotation, t,
  blobPhase, squashX, squashY, opacity, sf,
}: VirusProps): React.ReactNode {

  const spikes: React.ReactNode[] = [];
  for (let i = 0; i < spikeCount; i++) {
    const baseAngle = (i / spikeCount) * Math.PI * 2 + rotation;
    const lenMod    = i % 3 === 0 ? 1.18 : i % 3 === 1 ? 0.85 : 1.0;
    // Each spike pulses independently with its own phase
    const spikePulse = 1.0 + Math.sin(t * 2.6 + i * 0.52 + blobPhase) * 0.14;
    const fullLen    = spikeLen * lenMod * spikePulse;
    const tipR       = Math.max(4, (spikeLen * 0.24) * (r / 200));

    // Spike roots on the jelly blob surface (approximate — use squash for attachment)
    const surfR = r * (1 + Math.sin(baseAngle * 2 + t * 1.8 + blobPhase) * 0.04);
    const x1 = cx + Math.cos(baseAngle) * surfR * squashX;
    const y1 = cy + Math.sin(baseAngle) * surfR * squashY;
    const x2 = cx + Math.cos(baseAngle) * (surfR + fullLen) * squashX;
    const y2 = cy + Math.sin(baseAngle) * (surfR + fullLen) * squashY;

    spikes.push(
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={theme.spike}
          strokeWidth={Math.max(1.5, r * 0.042)}
          strokeLinecap="round" opacity={0.92} />
        {/* Bulbous S-protein receptor-binding domain tip */}
        <ellipse cx={x2} cy={y2}
          rx={tipR * 1.5} ry={tipR}
          transform={`rotate(${(baseAngle * 180) / Math.PI}, ${x2}, ${y2})`}
          fill={theme.tip} opacity={0.95} />
        <circle cx={x2} cy={y2} r={tipR * 0.5} fill="white" opacity={0.55} />
      </g>
    );
  }

  const gid      = `vc-${Math.round(cx)}-${Math.round(cy)}`;
  const blobPath = jellyBlob(cx, cy, r, t, blobPhase, squashX, squashY);

  return (
    <g opacity={opacity}>
      {/* Ambient glow halos */}
      <circle cx={cx} cy={cy} r={r * 1.55} fill={theme.glow} opacity={0.14} />
      <circle cx={cx} cy={cy} r={r * 1.25} fill={theme.glow} opacity={0.20} />

      {/* Spikes BEHIND capsid (they're all rendered, capsid sits on top) */}
      {spikes}

      {/* Jelly capsid body */}
      <defs>
        <radialGradient id={gid} cx="33%" cy="28%" r="72%">
          <stop offset="0%"   stopColor="white"       stopOpacity={0.65} />
          <stop offset="30%"  stopColor={theme.glow}  />
          <stop offset="100%" stopColor={theme.capsid} />
        </radialGradient>
      </defs>
      <path d={blobPath} fill={`url(#${gid})`} />

      {/* Icosahedral surface dots rotating on blob */}
      {Array.from({ length: 18 }, (_, i) => {
        const a  = (i / 18) * Math.PI * 2 + rotation * 0.25;
        const dr = r * 0.60;
        return (
          <circle key={i}
            cx={cx + Math.cos(a) * dr * squashX}
            cy={cy + Math.sin(a) * dr * squashY}
            r={Math.max(2, r * 0.058)}
            fill={theme.spike} opacity={0.22} />
        );
      })}

      {/* Inner organelle-like swirl (cytoplasm motion) */}
      {Array.from({ length: 6 }, (_, i) => {
        const a  = (i / 6) * Math.PI * 2 + t * 0.8 + blobPhase;
        const dr = r * 0.38;
        const ir = Math.max(1.5, r * 0.06);
        return (
          <circle key={i}
            cx={cx + Math.cos(a) * dr}
            cy={cy + Math.sin(a) * dr}
            r={ir}
            fill={theme.capsid} opacity={0.28} />
        );
      })}

      {/* Specular highlight — moves slightly with squash */}
      <ellipse
        cx={cx - r * squashX * 0.28}
        cy={cy - r * squashY * 0.30}
        rx={r * 0.25} ry={r * 0.17}
        fill="white" opacity={0.40} />
    </g>
  );
}

// ─── RNA DOUBLE HELIX ─────────────────────────────────────────────────────────
function renderHelix(
  x: number, y: number, h: number, amp: number,
  t: number, phase: number, dir: number,
  c1: string, c2: string, sw: number, opacity: number
) {
  const steps = 48;
  const s1: string[] = [], s2: string[] = [];
  const rungs: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  for (let j = 0; j <= steps; j++) {
    const frac   = j / steps;
    const vy     = y + frac * h;
    const angle1 = frac * Math.PI * 5 + t * dir + phase;
    const angle2 = angle1 + Math.PI;
    const vx1    = x + Math.cos(angle1) * amp;
    const vx2    = x + Math.cos(angle2) * amp;
    s1.push(`${j === 0 ? 'M' : 'L'} ${vx1.toFixed(1)} ${vy.toFixed(1)}`);
    s2.push(`${j === 0 ? 'M' : 'L'} ${vx2.toFixed(1)} ${vy.toFixed(1)}`);
    if (j % 5 === 0) rungs.push({ x1: vx1, y1: vy, x2: vx2, y2: vy });
  }
  return (
    <g opacity={opacity}>
      <path d={s1.join(' ')} fill="none" stroke={c1} strokeWidth={sw} strokeLinecap="round" />
      <path d={s2.join(' ')} fill="none" stroke={c2} strokeWidth={sw} strokeLinecap="round" />
      {rungs.map((rg, ri) => (
        <g key={ri}>
          <line x1={rg.x1} y1={rg.y1} x2={rg.x2} y2={rg.y2}
            stroke={c1} strokeWidth={sw * 0.5} opacity={0.65} />
          <circle cx={(rg.x1 + rg.x2) / 2} cy={rg.y1} r={sw * 0.85} fill={c2} opacity={0.82} />
        </g>
      ))}
    </g>
  );
}

// ─── ANTIBODY Y-SHAPE ─────────────────────────────────────────────────────────
function renderAntibody(
  cx: number, cy: number, size: number, rot: number,
  color: string, tipColor: string, opacity: number, sw: number
) {
  const rotPt = (px: number, py: number) => {
    const dx = px - cx, dy = py - cy;
    return {
      x: cx + dx * Math.cos(rot) - dy * Math.sin(rot),
      y: cy + dx * Math.sin(rot) + dy * Math.cos(rot),
    };
  };
  const sb  = rotPt(cx,              cy);
  const hi  = rotPt(cx,              cy - size * 0.55);
  const al  = rotPt(cx - size * 0.65, cy - size * 1.1);
  const ar  = rotPt(cx + size * 0.65, cy - size * 1.1);
  return (
    <g opacity={opacity}>
      <line x1={sb.x} y1={sb.y} x2={hi.x} y2={hi.y}
        stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={hi.x} y1={hi.y} x2={al.x} y2={al.y}
        stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <line x1={hi.x} y1={hi.y} x2={ar.x} y2={ar.y}
        stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <circle cx={hi.x} cy={hi.y} r={sw * 1.8} fill={color} />
      <circle cx={al.x} cy={al.y} r={sw * 2.6} fill={tipColor} />
      <circle cx={ar.x} cy={ar.y} r={sw * 2.6} fill={tipColor} />
      <circle cx={al.x} cy={al.y} r={sw * 1.1} fill="white" opacity={0.6} />
      <circle cx={ar.x} cy={ar.y} r={sw * 1.1} fill="white" opacity={0.6} />
    </g>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const PathogenMicroverse: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const sf   = Math.min(width / 3840, height / 2160);
  const prog = frame / durationInFrames;
  const t    = prog * Math.PI * 2;
  const W = width, H = height;

  // ─── VIRUS DEFINITIONS ─────────────────────────────────────────────────────
  // Each virus uses a LISSAJOUS path for organic active movement:
  //   x(t) = bx + Ax * sin(ax*t + dx)
  //   y(t) = by + Ay * sin(ay*t + dy)
  // Different ax/ay ratios produce figure-8s, ovals, loopy paths.
  const virusDefs = useMemo(() => [
    // Hero – large coral, figure-8 roam
    { bx: W*0.38, by: H*0.50, r: 230*sf, sc: 52, sl: 90*sf,
      Ax: 95*sf, Ay: 60*sf, ax: 1.0, ay: 2.0, dx: 0.0, dy: Math.PI/2,
      speed: 0.15, themeIdx: 0, blobPhase: 0.0 },
    // Large blue – trefoil-like
    { bx: W*0.74, by: H*0.28, r: 175*sf, sc: 44, sl: 72*sf,
      Ax: 70*sf, Ay: 80*sf, ax: 2.0, ay: 3.0, dx: 0.5, dy: 0.0,
      speed: -0.22, themeIdx: 1, blobPhase: 1.4 },
    // Medium green – slow oval drift
    { bx: W*0.80, by: H*0.72, r: 148*sf, sc: 38, sl: 60*sf,
      Ax: 55*sf, Ay: 40*sf, ax: 1.0, ay: 1.0, dx: 1.2, dy: 0.4,
      speed: 0.28, themeIdx: 2, blobPhase: 2.6 },
    // Medium purple – fast erratic
    { bx: W*0.12, by: H*0.22, r: 122*sf, sc: 34, sl: 50*sf,
      Ax: 45*sf, Ay: 55*sf, ax: 3.0, ay: 2.0, dx: 0.8, dy: 1.5,
      speed: -0.19, themeIdx: 3, blobPhase: 0.8 },
    // Small orange – bouncy figure-8
    { bx: W*0.16, by: H*0.78, r: 96*sf, sc: 28, sl: 38*sf,
      Ax: 35*sf, Ay: 28*sf, ax: 1.0, ay: 2.0, dx: Math.PI/3, dy: 0.0,
      speed: 0.34, themeIdx: 4, blobPhase: 3.2 },
    // Small pink – circular drift
    { bx: W*0.91, by: H*0.50, r: 90*sf, sc: 26, sl: 36*sf,
      Ax: 30*sf, Ay: 30*sf, ax: 1.0, ay: 1.0, dx: 0.0, dy: Math.PI/2,
      speed: -0.26, themeIdx: 5, blobPhase: 4.1 },
    // Tiny coral – fast spin + drift
    { bx: W*0.52, by: H*0.10, r: 66*sf, sc: 22, sl: 26*sf,
      Ax: 22*sf, Ay: 18*sf, ax: 2.0, ay: 1.0, dx: 1.0, dy: 0.5,
      speed: 0.42, themeIdx: 0, blobPhase: 5.0 },
    // Tiny blue – bottom center
    { bx: W*0.48, by: H*0.90, r: 62*sf, sc: 20, sl: 24*sf,
      Ax: 20*sf, Ay: 15*sf, ax: 1.0, ay: 3.0, dx: 0.3, dy: 2.1,
      speed: -0.38, themeIdx: 1, blobPhase: 2.0 },
    // Extra tiny – left mid
    { bx: W*0.05, by: H*0.50, r: 52*sf, sc: 18, sl: 20*sf,
      Ax: 15*sf, Ay: 20*sf, ax: 3.0, ay: 1.0, dx: 0.6, dy: 0.9,
      speed: 0.30, themeIdx: 2, blobPhase: 1.1 },
  ], [W, H, sf]);

  // ─── HELIX DEFINITIONS ─────────────────────────────────────────────────────
  const helixDefs = useMemo(() => [
    { x: W*0.56, y: H*0.04, h: H*0.46, amp: 62*sf, dir:  1, phase: 0.0, c1:'#0ea5e9', c2:'#38bdf8' },
    { x: W*0.04, y: H*0.38, h: H*0.57, amp: 52*sf, dir: -1, phase: 1.2, c1:'#10b981', c2:'#34d399' },
    { x: W*0.96, y: H*0.08, h: H*0.52, amp: 48*sf, dir:  1, phase: 2.2, c1:'#8b5cf6', c2:'#a78bfa' },
    { x: W*0.50, y: H*0.62, h: H*0.36, amp: 42*sf, dir: -1, phase: 3.1, c1:'#f97316', c2:'#fb923c' },
  ], [W, H, sf]);

  // ─── ANTIBODY DEFINITIONS ──────────────────────────────────────────────────
  const abDefs = useMemo(() => [
    { bx: W*0.23, by: H*0.44, sz: 112*sf, rSpeed:  0.14, phase: 0.0, themeIdx: 1,
      Ax: 30*sf, Ay: 25*sf, ax: 1.0, ay: 2.0 },
    { bx: W*0.62, by: H*0.68, sz:  96*sf, rSpeed: -0.18, phase: 1.4, themeIdx: 2,
      Ax: 25*sf, Ay: 20*sf, ax: 2.0, ay: 1.0 },
    { bx: W*0.87, by: H*0.41, sz:  82*sf, rSpeed:  0.22, phase: 2.6, themeIdx: 3,
      Ax: 20*sf, Ay: 28*sf, ax: 1.0, ay: 1.0 },
    { bx: W*0.40, by: H*0.83, sz:  72*sf, rSpeed: -0.12, phase: 3.8, themeIdx: 4,
      Ax: 18*sf, Ay: 15*sf, ax: 3.0, ay: 2.0 },
    { bx: W*0.08, by: H*0.58, sz:  66*sf, rSpeed:  0.16, phase: 1.9, themeIdx: 5,
      Ax: 16*sf, Ay: 20*sf, ax: 2.0, ay: 3.0 },
  ], [W, H, sf]);

  // ─── BACKGROUND PARTICLES ──────────────────────────────────────────────────
  const particles = useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    x: ((i * 317 + 53) % 100) / 100 * W,
    y: ((i * 541 + 17) % 100) / 100 * H,
    r: (((i * 97) % 100) / 100 * 30 + 7) * sf,
    phase: (i * 0.513) % (Math.PI * 2),
    speed: 0.28 + (i % 5) * 0.11,
    themeIdx: i % VIRUS_THEMES.length,
    isCell: i % 6 === 0,
  })), [W, H, sf]);

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse 115% 95% at 48% 42%, #f8fafc 0%, #e0f2fe 38%, #bae6fd 72%, #dbeafe 100%)`,
      overflow: 'hidden',
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      <style>{FONT_IMPORT}</style>

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="glow-soft" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={7*sf} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-hard" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation={3*sf} result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="blur-bg">
            <feGaussianBlur stdDeviation={14*sf} />
          </filter>
          <filter id="blur-mid">
            <feGaussianBlur stdDeviation={5*sf} />
          </filter>
        </defs>

        {/* ── AMBIENT BACKGROUND LIGHT HALOS ────────────────────────────── */}
        {virusDefs.map((v, vi) => {
          const vx = v.bx + v.Ax * Math.sin(v.ax * t + v.dx);
          const vy = v.by + v.Ay * Math.sin(v.ay * t + v.dy);
          return (
            <circle key={vi} cx={vx} cy={vy} r={v.r * 2.1}
              fill={VIRUS_THEMES[v.themeIdx].glow} opacity={0.10} filter="url(#blur-bg)" />
          );
        })}

        {/* ── BACKGROUND PARTICLES ──────────────────────────────────────── */}
        {particles.map((p, pi) => {
          const px = p.x + Math.sin(t * p.speed + p.phase) * 28 * sf;
          const py = p.y + Math.cos(t * p.speed * 0.75 + p.phase) * 22 * sf;
          const th = VIRUS_THEMES[p.themeIdx];
          return p.isCell
            ? <ellipse key={pi} cx={px} cy={py} rx={p.r*1.8} ry={p.r*0.85}
                fill={th.glow} stroke={th.capsid}
                strokeWidth={Math.max(0.8, p.r * 0.15)}
                opacity={0.30} filter="url(#blur-mid)" />
            : <circle key={pi} cx={px} cy={py} r={p.r}
                fill={th.glow} opacity={0.25} filter="url(#blur-mid)" />;
        })}

        {/* ── RNA HELIX STRANDS ─────────────────────────────────────────── */}
        {helixDefs.map((h, hi) => {
          const fx = Math.sin(t * 0.45 + h.phase) * 22 * sf;
          return (
            <g key={hi} filter="url(#blur-mid)">
              {renderHelix(h.x + fx, h.y, h.h, h.amp, t, h.phase, h.dir,
                h.c1, h.c2, 4.5 * sf, 0.76)}
            </g>
          );
        })}

        {/* ── ANTIBODIES ────────────────────────────────────────────────── */}
        {abDefs.map((ab, ai) => {
          const th  = VIRUS_THEMES[ab.themeIdx];
          const abx = ab.bx + ab.Ax * Math.sin(ab.ax * t + ai * 0.8);
          const aby = ab.by + ab.Ay * Math.sin(ab.ay * t + ai * 0.6);
          const rot = Math.sin(t * ab.rSpeed + ab.phase) * 0.55;
          return (
            <g key={ai} filter="url(#glow-soft)">
              {renderAntibody(abx, aby, ab.sz, rot, th.spike, th.tip, 0.85, 5.5*sf)}
            </g>
          );
        })}

        {/* ── VIRUSES ───────────────────────────────────────────────────── */}
        {virusDefs.map((v, vi) => {
          const theme = VIRUS_THEMES[v.themeIdx];
          const rot   = t * v.speed;

          // Lissajous position
          const vx = v.bx + v.Ax * Math.sin(v.ax * t + v.dx);
          const vy = v.by + v.Ay * Math.sin(v.ay * t + v.dy);

          // Velocity for squash-stretch
          const dt   = 0.02;
          const vx2  = v.bx + v.Ax * Math.sin(v.ax * (t + dt) + v.dx);
          const vy2  = v.by + v.Ay * Math.sin(v.ay * (t + dt) + v.dy);
          const velX = (vx2 - vx) / dt;
          const velY = (vy2 - vy) / dt;
          const speed = Math.sqrt(velX * velX + velY * velY);
          // Squash in direction of movement, stretch perpendicular
          const sqStrength = Math.min(0.22, speed / (v.r * 18));
          const velAngle   = Math.atan2(velY, velX);
          const cosA = Math.cos(velAngle), sinA = Math.sin(velAngle);
          // Directional squash factors (simplified to axis-aligned for SVG)
          const sqX = 1.0 + Math.abs(cosA) * sqStrength - Math.abs(sinA) * sqStrength * 0.5;
          const sqY = 1.0 + Math.abs(sinA) * sqStrength - Math.abs(cosA) * sqStrength * 0.5;

          const filt = v.r > 120 * sf ? 'url(#glow-soft)' : undefined;
          return (
            <g key={vi} filter={filt}>
              {renderVirus({
                cx: vx, cy: vy,
                r: v.r, spikeCount: v.sc, spikeLen: v.sl,
                theme, rotation: rot, t,
                blobPhase: v.blobPhase,
                squashX: sqX, squashY: sqY,
                opacity: interpolate(v.r / sf, [50, 240], [0.62, 1.0]),
                sf,
              })}
            </g>
          );
        })}

        {/* ── MICROSCOPE HUD (tracks main virus) ───────────────────────── */}
        {(() => {
          const v   = virusDefs[0];
          const vx  = v.bx + v.Ax * Math.sin(v.ax * t + v.dx);
          const vy  = v.by + v.Ay * Math.sin(v.ay * t + v.dy);
          const foc = (v.r + v.sl) * 1.40;
          return (
            <g opacity={0.52}>
              <circle cx={vx} cy={vy} r={foc}
                fill="none" stroke="#0f172a" strokeWidth={1.5*sf}
                strokeDasharray={`${12*sf} ${6*sf}`} opacity={0.32} />
              <line x1={vx - foc*1.1} y1={vy} x2={vx + foc*1.1} y2={vy}
                stroke="#0f172a" strokeWidth={sf} opacity={0.18}
                strokeDasharray={`${5*sf} ${10*sf}`} />
              <line x1={vx} y1={vy - foc*1.1} x2={vx} y2={vy + foc*1.1}
                stroke="#0f172a" strokeWidth={sf} opacity={0.18}
                strokeDasharray={`${5*sf} ${10*sf}`} />
              {([[-1,-1],[1,-1],[1,1],[-1,1]] as [number,number][]).map(([sx, sy], bi) => {
                const bl = 52*sf;
                const bx = vx + sx * foc * 0.74;
                const by = vy + sy * foc * 0.74;
                return (
                  <g key={bi} stroke="#334155" strokeWidth={2.5*sf} fill="none" opacity={0.72}>
                    <line x1={bx} y1={by} x2={bx + sx*bl} y2={by} />
                    <line x1={bx} y1={by} x2={bx} y2={by + sy*bl} />
                  </g>
                );
              })}
              {/* Scale bar */}
              <line x1={vx - 95*sf} y1={vy + foc + 30*sf}
                    x2={vx + 95*sf} y2={vy + foc + 30*sf}
                stroke="#1e293b" strokeWidth={2.5*sf} opacity={0.65} />
              <text x={vx} y={vy + foc + 56*sf}
                fill="#1e293b" fontSize={16*sf} textAnchor="middle"
                opacity={0.60} fontFamily="'Share Tech Mono', monospace">100 nm</text>
              <text x={vx} y={vy - foc - 18*sf}
                fill={VIRUS_THEMES[0].capsid} fontSize={19*sf}
                textAnchor="middle" fontWeight="bold"
                fontFamily="'Share Tech Mono', monospace" opacity={0.82}>
                ► {VIRUS_THEMES[0].label}
              </text>
            </g>
          );
        })()}

        {/* ── SMALLER VIRUS LABELS ──────────────────────────────────────── */}
        {virusDefs.slice(1).map((v, vi) => {
          const theme = VIRUS_THEMES[v.themeIdx];
          const vx    = v.bx + v.Ax * Math.sin(v.ax * t + v.dx);
          const vy    = v.by + v.Ay * Math.sin(v.ay * t + v.dy);
          return (
            <text key={vi} x={vx} y={vy - (v.r + v.sl) - 12*sf}
              fill={theme.capsid} fontSize={14*sf}
              textAnchor="middle" fontFamily="'Share Tech Mono', monospace"
              opacity={0.72}>{theme.label}</text>
          );
        })}
      </svg>

      {/* ── HUD TEXT PANELS ─────────────────────────────────────────────────── */}
      <div style={{ position:'absolute', top:60*sf, left:80*sf,
        fontFamily:"'Share Tech Mono', monospace", color:'#0f172a', pointerEvents:'none' }}>
        <div style={{ fontSize:12*sf, color:'#64748b', letterSpacing:2*sf }}>
          ADVANCED PATHOGEN IMAGING SYSTEM v3.9
        </div>
        <div style={{ fontSize:28*sf, fontWeight:'bold', marginTop:5*sf, color:'#0f172a' }}>
          🔬 PATHOGEN MICROVERSE
        </div>
        <div style={{ fontSize:15*sf, color:'#6366f1', marginTop:4*sf }}>
          SAMPLE: BIO-8820 // CLASS: ENVELOPED RNA VIRION
        </div>
        <div style={{ fontSize:13*sf, color:'#94a3b8', marginTop:3*sf }}>
          DETECTED: {virusDefs.length} VIRAL PARTICLES // JELLY-MOTION: ACTIVE
        </div>
      </div>

      <div style={{ position:'absolute', top:60*sf, right:80*sf,
        fontFamily:"'Share Tech Mono', monospace", color:'#0f172a',
        textAlign:'right', pointerEvents:'none' }}>
        <div style={{ fontSize:12*sf, color:'#64748b' }}>LIVE TELEMETRY</div>
        <div style={{ fontSize:22*sf, fontWeight:'bold', color:'#f43f5e', marginTop:8*sf }}>
          MAG: 480,000×
        </div>
        <div style={{ fontSize:15*sf, color:'#475569', marginTop:5*sf }}>
          SIZE: {(120 + Math.sin(t) * 3).toFixed(1)} nm (avg)
        </div>
        <div style={{ fontSize:15*sf, color:'#0d9488', marginTop:3*sf }}>
          TEMP: {(36.4 + Math.sin(t) * 0.5).toFixed(1)} °C
        </div>
        <div style={{ fontSize:15*sf, color:'#6366f1', marginTop:3*sf }}>
          COHERENCE: {(99.5 + Math.cos(t*2)*0.4).toFixed(2)}%
        </div>
      </div>

      <div style={{ position:'absolute', bottom:70*sf, left:80*sf,
        fontFamily:"'Share Tech Mono', monospace", color:'#0f172a', pointerEvents:'none' }}>
        <div style={{ fontSize:13*sf, color:'#64748b' }}>SURFACE GLYCOPROTEIN ANALYSIS</div>
        <div style={{ fontSize:20*sf, fontWeight:'bold', color:'#6366f1', marginTop:4*sf }}>
          {virusDefs.reduce((s, v) => s + v.sc, 0)} TOTAL SPIKES // ACTIVE
        </div>
        <div style={{ fontSize:13*sf, color:'#0d9488', marginTop:5*sf }}>
          ● RNA: +ssRNA // {(29903 + Math.floor(Math.sin(t)*5)).toLocaleString()} BASES
        </div>
        <div style={{ fontSize:13*sf, color:'#94a3b8', marginTop:2*sf }}>
          REPLICATION: {(2.1 + Math.sin(t*3)*0.4).toFixed(2)} copies/hr
        </div>
      </div>

      <div style={{ position:'absolute', bottom:70*sf, right:80*sf,
        fontFamily:"'Share Tech Mono', monospace", color:'#0f172a',
        textAlign:'right', pointerEvents:'none' }}>
        <div style={{ fontSize:13*sf, color:'#64748b' }}>ANTIBODY NEUTRALIZATION</div>
        <div style={{ fontSize:20*sf, fontWeight:'bold', color:'#8b5cf6', marginTop:4*sf }}>
          {abDefs.length} IgG ANTIBODIES DETECTED
        </div>
        <div style={{ fontSize:13*sf, color:'#64748b', marginTop:5*sf }}>
          BINDING AFFINITY: {(94.1 + Math.cos(t*2)*1.8).toFixed(1)}%
        </div>
        <div style={{ fontSize:13*sf, color:'#06b6d4', marginTop:2*sf }}>
          ● NEUTRALIZATION: IN PROGRESS
        </div>
      </div>

      <div style={{ position:'absolute', bottom:22*sf, left:0, right:0,
        textAlign:'center', fontFamily:"'Share Tech Mono', monospace",
        fontSize:13*sf, color:'#94a3b8', opacity:0.58, pointerEvents:'none' }}>
        FOCAL_LOCK: ACTIVE // DOF: 38 nm // FRAME {String(frame).padStart(4,'0')} / {durationInFrames}
      </div>
    </AbsoluteFill>
  );
};
