import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

// ─── Deterministic Pseudo-Random Hash Generator ────────────────────────────────
const hash = (n: number): number => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453123;
  return x - Math.floor(x);
};

// ─── Premium Color Palette (Razor Sharp & Vibrant) ──────────────────────────────
const COLORS = {
  bgVoid: '#020208',          // Deep space obsidian background
  purple: '#8b5cf6',          // Sharp royal purple
  purpleDark: '#4c1d95',      // Deep purple shadow
  magenta: '#ec4899',         // Vibrant hot pink/magenta
  magentaDark: '#9d174d',     // Deep magenta shadow
  teal: '#0d9488',            // Luminous teal
  tealDark: '#115e59',        // Deep teal shadow
  electricBlue: '#3b82f6',    // High-energy electric blue
  electricBlueDark: '#1e3a8a',// Deep blue shadow
  cyan: '#06b6d4',            // Electric cyan highlight
  gold: '#f59e0b',            // Sharp gold accent
  orange: '#f97316',          // Radiant orange
  white: '#ffffff',           // Crisp highlight
};

interface VectorPlume {
  id: string;
  baseX: number;
  baseY: number;
  radiusX: number;
  radiusY: number;
  size: number;
  speed: number;
  phase: number;
  pulseFreq: number;
  pulseAmp: number;
  colorGradId: string;
  strokeColor: string;
  wobbleFreq: number;
  scale: number;
  opacity: number;
}

interface SwirlingParticle {
  id: string;
  baseRadius: number;
  angleSpeed: number; // Integer loops
  phase: number;
  size: number;
  color: string;
  radialWobbleAmp: number;
  radialWobbleFreq: number;
  strokeColor: string;
}

interface WaveLayer {
  id: string;
  baseHeightPct: number;
  amp1: number;
  amp2: number;
  freq1: number;
  freq2: number;
  speed1: number;
  speed2: number;
  colorGradId: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
}

export const NebulaFogLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Scale factor to keep elements crisp and perfectly proportioned in 4K UHD
  const sf = height / 2160;

  // Perfect 10-second loop progress (0.0 to 1.0)
  const progress = frame / durationInFrames;
  const t = progress * Math.PI * 2; // Time value for seamless trig functions

  // 1. GENERATE DYNAMIC SHARP COSMIC VECTOR WAVES (5 distinct flowing layers)
  const waves = useMemo<WaveLayer[]>(() => {
    return [
      {
        id: 'wave-1',
        baseHeightPct: 0.72,
        amp1: 140 * sf,
        amp2: 70 * sf,
        freq1: 0.0018,
        freq2: 0.0035,
        speed1: 1, // 1 complete cycle in 10s
        speed2: -2,
        colorGradId: 'grad-wave-1',
        strokeColor: COLORS.electricBlue,
        strokeWidth: 4 * sf,
        opacity: 0.85,
      },
      {
        id: 'wave-2',
        baseHeightPct: 0.58,
        amp1: 160 * sf,
        amp2: 90 * sf,
        freq1: 0.0022,
        freq2: 0.0040,
        speed1: -2,
        speed2: 1,
        colorGradId: 'grad-wave-2',
        strokeColor: COLORS.magenta,
        strokeWidth: 4.5 * sf,
        opacity: 0.75,
      },
      {
        id: 'wave-3',
        baseHeightPct: 0.44,
        amp1: 120 * sf,
        amp2: 80 * sf,
        freq1: 0.0028,
        freq2: 0.0055,
        speed1: 2,
        speed2: -3,
        colorGradId: 'grad-wave-3',
        strokeColor: COLORS.teal,
        strokeWidth: 3.5 * sf,
        opacity: 0.80,
      },
      {
        id: 'wave-4',
        baseHeightPct: 0.32,
        amp1: 100 * sf,
        amp2: 60 * sf,
        freq1: 0.0035,
        freq2: 0.0065,
        speed1: -1,
        speed2: 2,
        colorGradId: 'grad-wave-4',
        strokeColor: COLORS.gold,
        strokeWidth: 3.5 * sf,
        opacity: 0.65,
      },
      {
        id: 'wave-5',
        baseHeightPct: 0.20,
        amp1: 80 * sf,
        amp2: 40 * sf,
        freq1: 0.0045,
        freq2: 0.0080,
        speed1: 3,
        speed2: -2,
        colorGradId: 'grad-wave-5',
        strokeColor: COLORS.cyan,
        strokeWidth: 3 * sf,
        opacity: 0.90,
      },
    ];
  }, [sf]);

  // 2. GENERATE ORBITING VECTOR CLOUD PLUMES (14 plumes - razor sharp borders)
  const plumes = useMemo<VectorPlume[]>(() => {
    const list: VectorPlume[] = [];
    const gradIds = ['grad-plume-purple', 'grad-plume-magenta', 'grad-plume-teal', 'grad-plume-blue', 'grad-plume-orange'];
    const strokes = [COLORS.cyan, COLORS.white, COLORS.gold, COLORS.magenta, COLORS.electricBlue];

    for (let i = 0; i < 14; i++) {
      const seed = i * 2.33;
      list.push({
        id: `vector-plume-${i}`,
        baseX: width * (0.2 + hash(seed * 1.1) * 0.6),
        baseY: height * (0.2 + hash(seed * 2.2) * 0.6),
        radiusX: (180 + hash(seed * 3.3) * 350) * sf,
        radiusY: (120 + hash(seed * 4.4) * 220) * sf,
        size: (500 + hash(seed * 5.5) * 450) * sf,
        speed: hash(seed * 6.6) > 0.5 ? 1 : -1, // Loops perfectly (1 full cycle)
        phase: hash(seed * 7.7) * Math.PI * 2,
        pulseFreq: hash(seed * 8.8) > 0.5 ? 2 : 1,
        pulseAmp: 0.18,
        colorGradId: gradIds[i % gradIds.length],
        strokeColor: strokes[i % strokes.length],
        wobbleFreq: 1 + Math.floor(hash(seed * 9.9) * 3),
        scale: 0.95 + hash(seed * 10.1) * 0.35,
        opacity: 0.75 + hash(seed * 11.2) * 0.20,
      });
    }
    return list;
  }, [width, height, sf]);

  // 3. GENERATE SWIRLING GALAXY VORTEX PARTICLES (160 sharp particles)
  const particles = useMemo<SwirlingParticle[]>(() => {
    const list: SwirlingParticle[] = [];
    const palette = [COLORS.cyan, COLORS.magenta, COLORS.gold, COLORS.orange, COLORS.white, COLORS.purple];
    
    for (let i = 0; i < 160; i++) {
      const seed = i * 7.41;
      const baseRadius = (50 + hash(seed * 1.5) * 1450) * sf;
      // Faster angular speed for closer particles, slower for distant (simulating gravity)
      const isInner = baseRadius < 600 * sf;
      const speedOptions = isInner ? [3, -3, 4, -4] : [1, -1, 2, -2];
      const angleSpeed = speedOptions[Math.floor(hash(seed * 2.5) * speedOptions.length)];

      list.push({
        id: `swirl-pt-${i}`,
        baseRadius,
        angleSpeed,
        phase: hash(seed * 3.5) * Math.PI * 2,
        size: (5 + hash(seed * 4.5) * 22) * sf,
        color: palette[i % palette.length],
        radialWobbleAmp: (10 + hash(seed * 5.5) * 80) * sf,
        radialWobbleFreq: hash(seed * 6.5) > 0.5 ? 2 : 1,
        strokeColor: hash(seed * 7.5) > 0.6 ? COLORS.white : 'transparent',
      });
    }
    return list;
  }, [sf]);

  // 4. ANIMATE WAVES DYNAMIC PATHS (Crisp vector lines)
  const wavePaths = useMemo(() => {
    return waves.map((w) => {
      const points = [];
      const steps = 120; // High resolution for smooth sharp SVG curves
      const stepSize = width / steps;

      for (let i = 0; i <= steps; i++) {
        const x = i * stepSize;

        // Wave formula looping perfectly
        // We evaluate two sinusoidal components synced to t * speed
        const w1 = Math.sin(x * w.freq1 + t * w.speed1) * w.amp1;
        const w2 = Math.cos(x * w.freq2 + t * w.speed2) * w.amp2;

        const y = height * w.baseHeightPct + w1 + w2;
        points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }

      // Close the path at the bottom of the screen to fill it with a vibrant gradient
      const fillPath = `${points.join(' ')} L ${width} ${height} L 0 ${height} Z`;
      const linePath = points.join(' ');

      return {
        ...w,
        fillPath,
        linePath,
      };
    });
  }, [waves, t, width, height]);

  // 5. ANIMATE SHARP COSMIC PLUMES
  const animatedPlumes = useMemo(() => {
    return plumes.map((p) => {
      // Swirling orbital coordinates
      const angle = t * p.speed + p.phase;
      const x = p.baseX + p.radiusX * Math.cos(angle);
      const y = p.baseY + p.radiusY * Math.sin(angle);

      // Gas expansion / heartbeat pulsing (expansion scale)
      const pulse = 1.0 + p.pulseAmp * Math.sin(t * p.pulseFreq + p.phase);
      const dynamicSize = p.size * pulse;

      // Razor-sharp organic shape deformation (border-radius wobble)
      const wPhase = t * p.wobbleFreq;
      const r1 = 50 + 12 * Math.sin(wPhase + p.phase);
      const r2 = 50 + 10 * Math.cos(wPhase + 1 + p.phase);
      const r3 = 50 + 9 * Math.sin(wPhase + 2 + p.phase);
      const r4 = 50 + 8 * Math.cos(wPhase + 3 + p.phase);
      const borderRadius = `${r1}% ${100 - r1}% ${r2}% ${100 - r2}% / ${r3}% ${r4}% ${100 - r3}% ${100 - r4}%`;

      // Rotation
      const rot = ((progress * 360 * p.speed) + (p.phase * 180 / Math.PI)) % 360;

      return {
        ...p,
        x,
        y,
        size: dynamicSize,
        borderRadius,
        rot,
      };
    });
  }, [plumes, t, progress]);

  // 6. ANIMATE SWIRLING GALAXY PARTICLES
  const animatedParticles = useMemo(() => {
    return particles.map((p) => {
      // Seamless orbital motion
      const currentAngle = p.phase + t * p.angleSpeed;
      
      // Add radial wobble (wobbles in and out dynamically and seamlessly)
      const wobble = p.radialWobbleAmp * Math.sin(t * p.radialWobbleFreq + p.phase);
      const currentRadius = p.baseRadius + wobble;

      // Map to 2D coordinates around the center of the frame
      const x = width / 2 + currentRadius * Math.cos(currentAngle);
      const y = height / 2 + currentRadius * Math.sin(currentAngle);

      // Pulse particle size slightly for energetic twinkling
      const sizePulse = 0.85 + 0.15 * Math.sin(t * (p.angleSpeed > 0 ? 3 : 2) + p.phase);
      const dynamicSize = p.size * sizePulse;

      return {
        ...p,
        x,
        y,
        size: dynamicSize,
      };
    });
  }, [particles, t, width, height]);

  // 7. ORBITING TECK LABELS & GRAVITY PATHS (Visual aids for elite design)
  const ringAngles = useMemo(() => {
    return [
      { id: 't-ring-1', r: 500 * sf, spin: t * 1, dash: '8, 12, 100, 12' },
      { id: 't-ring-2', r: 900 * sf, spin: -t * 1.5, dash: '40, 20, 20, 20' },
      { id: 't-ring-3', r: 1300 * sf, spin: t * 0.5, dash: '4, 8' },
    ];
  }, [sf, t]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgVoid,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* Import high-tech font */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        `}
      </style>

      {/* DEFINITIONS FOR GRADIENTS AND FILTERS */}
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <defs>
          {/* Waves Gradients */}
          <linearGradient id="grad-wave-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.electricBlue} stopOpacity={0.8} />
            <stop offset="50%" stopColor={COLORS.purpleDark} stopOpacity={0.7} />
            <stop offset="100%" stopColor={COLORS.bgVoid} stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="grad-wave-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.magenta} stopOpacity={0.75} />
            <stop offset="50%" stopColor={COLORS.purple} stopOpacity={0.65} />
            <stop offset="100%" stopColor={COLORS.bgVoid} stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="grad-wave-3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.8} />
            <stop offset="50%" stopColor={COLORS.electricBlueDark} stopOpacity={0.6} />
            <stop offset="100%" stopColor={COLORS.bgVoid} stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="grad-wave-4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.gold} stopOpacity={0.65} />
            <stop offset="50%" stopColor={COLORS.orange} stopOpacity={0.55} />
            <stop offset="100%" stopColor={COLORS.bgVoid} stopOpacity={0.9} />
          </linearGradient>
          <linearGradient id="grad-wave-5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.85} />
            <stop offset="50%" stopColor={COLORS.tealDark} stopOpacity={0.7} />
            <stop offset="100%" stopColor={COLORS.bgVoid} stopOpacity={0.9} />
          </linearGradient>

          {/* Plumes Gradients */}
          <radialGradient id="grad-plume-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.white} stopOpacity={0.4} />
            <stop offset="30%" stopColor={COLORS.purple} stopOpacity={0.75} />
            <stop offset="70%" stopColor={COLORS.purpleDark} stopOpacity={0.3} />
            <stop offset="100%" stopColor={COLORS.purpleDark} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="grad-plume-magenta" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.white} stopOpacity={0.35} />
            <stop offset="35%" stopColor={COLORS.magenta} stopOpacity={0.7} />
            <stop offset="75%" stopColor={COLORS.magentaDark} stopOpacity={0.25} />
            <stop offset="100%" stopColor={COLORS.magentaDark} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="grad-plume-teal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.white} stopOpacity={0.4} />
            <stop offset="25%" stopColor={COLORS.cyan} stopOpacity={0.8} />
            <stop offset="65%" stopColor={COLORS.teal} stopOpacity={0.3} />
            <stop offset="100%" stopColor={COLORS.tealDark} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="grad-plume-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.white} stopOpacity={0.3} />
            <stop offset="30%" stopColor={COLORS.electricBlue} stopOpacity={0.75} />
            <stop offset="70%" stopColor={COLORS.electricBlueDark} stopOpacity={0.25} />
            <stop offset="100%" stopColor={COLORS.electricBlueDark} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="grad-plume-orange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.white} stopOpacity={0.4} />
            <stop offset="28%" stopColor={COLORS.orange} stopOpacity={0.8} />
            <stop offset="68%" stopColor={COLORS.gold} stopOpacity={0.2} />
            <stop offset="100%" stopColor={COLORS.bgVoid} stopOpacity={0} />
          </radialGradient>
        </defs>
      </svg>

      {/* ── 1. BACKGROUND SCI-FI VECTOR RADIAL LINES ── */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.15,
        }}
      >
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {/* Faint sharp background circular guides */}
          {ringAngles.map((ring) => (
            <circle
              key={ring.id}
              cx={0}
              cy={0}
              r={ring.r}
              fill="none"
              stroke={COLORS.cyan}
              strokeWidth={1.5 * sf}
              strokeDasharray={ring.dash}
              transform={`rotate(${(ring.spin * 180 / Math.PI) % 360})`}
            />
          ))}
          {/* Central crosshair coordinates */}
          <line x1={-30 * sf} y1={0} x2={30 * sf} y2={0} stroke={COLORS.cyan} strokeWidth={2 * sf} />
          <line x1={0} y1={-30 * sf} x2={0} y2={30 * sf} stroke={COLORS.cyan} strokeWidth={2 * sf} />
          <circle cx={0} cy={0} r={12 * sf} fill="none" stroke={COLORS.cyan} strokeWidth={1.5 * sf} />
        </g>
      </svg>

      {/* ── 2. SHARP COSMIC VECTOR PLUMES (NO BLUR, crisp organic shapes) ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {animatedPlumes.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: p.borderRadius,
              background: `url(#${p.colorGradId})`, // Failsafe fallback
              backgroundColor: 'transparent',
              // Dynamic CSS inline radial-gradient simulating sharp cosmic clouds
              backgroundImage: p.colorGradId === 'grad-plume-purple'
                ? `radial-gradient(circle, rgba(255,255,255,0.7) 0%, ${COLORS.purple} 28%, ${COLORS.purpleDark} 60%, transparent 88%)`
                : p.colorGradId === 'grad-plume-magenta'
                ? `radial-gradient(circle, rgba(255,255,255,0.65) 0%, ${COLORS.magenta} 32%, ${COLORS.magentaDark} 65%, transparent 88%)`
                : p.colorGradId === 'grad-plume-teal'
                ? `radial-gradient(circle, rgba(255,255,255,0.7) 0%, ${COLORS.cyan} 24%, ${COLORS.teal} 55%, transparent 85%)`
                : p.colorGradId === 'grad-plume-blue'
                ? `radial-gradient(circle, rgba(255,255,255,0.6) 0%, ${COLORS.electricBlue} 30%, ${COLORS.electricBlueDark} 62%, transparent 88%)`
                : `radial-gradient(circle, rgba(255,255,255,0.7) 0%, ${COLORS.orange} 26%, ${COLORS.gold} 58%, transparent 85%)`,
              opacity: p.opacity,
              border: `2px solid ${p.strokeColor}88`, // Crisp structural border
              transform: `scale(${p.scale}) rotate(${p.rot.toFixed(1)}deg)`,
              mixBlendMode: 'screen',
            }}
          />
        ))}
      </div>

      {/* ── 3. SHARP DYNAMIC COSMIC VECTOR WAVES (Razor sharp filled streams) ── */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {wavePaths.map((w) => (
          <g key={w.id} opacity={w.opacity}>
            {/* Solid sharp wave fill */}
            <path
              d={w.fillPath}
              fill={`url(#${w.colorGradId})`}
              style={{
                mixBlendMode: 'screen',
              }}
            />
            {/* Crisp sharp highlight edge line */}
            <path
              d={w.linePath}
              fill="none"
              stroke={w.strokeColor}
              strokeWidth={w.strokeWidth}
              style={{
                mixBlendMode: 'screen',
              }}
            />
          </g>
        ))}
      </svg>

      {/* ── 4. SWIRLING GALAXY PARTICLES (Crystal-clear high-contrast stars) ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {animatedParticles.map((pt) => (
          <div
            key={pt.id}
            style={{
              position: 'absolute',
              left: pt.x - pt.size / 2,
              top: pt.y - pt.size / 2,
              width: pt.size,
              height: pt.size,
              borderRadius: '50%',
              backgroundColor: pt.color,
              // Crisp thin circular stroke for stellar density
              border: pt.strokeColor !== 'transparent' ? `1.5px solid ${pt.strokeColor}` : undefined,
              boxShadow: `0 0 4px ${pt.color}, 0 0 10px ${pt.color}`, // Intense light core bloom
            }}
          />
        ))}
      </div>

      {/* ── 5. LIVE TECHNICAL GRAPHICS OVERLAY (Scientific aesthetics) ── */}
      <div
        style={{
          position: 'absolute',
          top: 60 * sf,
          left: 80 * sf,
          color: COLORS.white,
          fontSize: 22 * sf,
          letterSpacing: 2 * sf,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 6 * sf,
          textShadow: `0 0 8px ${COLORS.cyan}`,
        }}
      >
        <div style={{ fontWeight: 'bold' }}>⚡ VECTOR_NEBULA_SIMULATION // ACTIVE</div>
        <div style={{ color: COLORS.cyan, fontSize: 16 * sf }}>
          FLOW_RATE: 60_FPS // SCALE: 4K_UHD // CYCLE: 10.0s_LOOP
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 60 * sf,
          right: 80 * sf,
          color: COLORS.cyan,
          fontSize: 16 * sf,
          pointerEvents: 'none',
          textAlign: 'right',
          textShadow: `0 0 8px ${COLORS.cyan}`,
        }}
      >
        <div>SYSTEM_COORDINATES: x={interpolate(progress, [0, 1], [0, 360]).toFixed(1)}°</div>
        <div style={{ color: COLORS.white, marginTop: 4 * sf }}>
          SWIRL_PARTICLES: 160 // ACTIVE_WAVES: 5
        </div>
      </div>

      {/* ── 6. CASCADING DIGITAL VECTOR RULERS (Edge calibration ticks) ── */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      >
        {/* Left vertical ruler ticks */}
        {Array.from({ length: 20 }).map((_, idx) => {
          const y = (height / 20) * idx;
          const isMajor = idx % 5 === 0;
          return (
            <line
              key={`tick-l-${idx}`}
              x1={40 * sf}
              y1={y}
              x2={(isMajor ? 60 : 50) * sf}
              y2={y}
              stroke={COLORS.cyan}
              strokeWidth={isMajor ? 2.5 * sf : 1.2 * sf}
            />
          );
        })}
        {/* Right vertical ruler ticks */}
        {Array.from({ length: 20 }).map((_, idx) => {
          const y = (height / 20) * idx;
          const isMajor = idx % 5 === 0;
          return (
            <line
              key={`tick-r-${idx}`}
              x1={width - 40 * sf}
              y1={y}
              x2={width - (isMajor ? 60 : 50) * sf}
              y2={y}
              stroke={COLORS.cyan}
              strokeWidth={isMajor ? 2.5 * sf : 1.2 * sf}
            />
          );
        })}
      </svg>

      {/* ── 7. PREMIUM DUST NOISE OVERLAY (No blur, vector-style clean turbulence) ── */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.05, // Crisp technical overlay
          mixBlendMode: 'overlay',
        }}
      >
        <filter id="vectorNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#vectorNoise)" />
      </svg>

      {/* ── 8. DRAMATIC VIGNETTE AND CONTRAST ENHANCER ── */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(1, 1, 5, 0.3) 50%, rgba(1, 1, 5, 0.98) 100%)`,
          pointerEvents: 'none',
          mixBlendMode: 'multiply', // Sharply darkens outer edges
        }}
      />
    </AbsoluteFill>
  );
};
