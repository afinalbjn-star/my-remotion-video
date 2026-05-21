import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

// ─── Color Palette ──────────────────────────────────────────────────────────────
const COLORS = {
  bgDeep: '#010812',
  bgMid: '#061b35',
  bgUpper: '#0b3458',
  bubbleRim: '#5ccfe0',
  bubbleHighlight: '#cbf6ff', // Brighter sunlight highlight
  iridPink: '#ff7be2',
  iridMint: '#5efcd0',
  iridGold: '#ffe27a',
  iridPurple: '#b27aff',
  caustic: '#3ac8e4',
  particle: '#3d8aa8',
  white: '#ffffff',
};

// ─── Deterministic Pseudo-Random Hash ───────────────────────────────────────────
const hash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ─── Catmull-Rom → Cubic Bezier Smooth Closed SVG Path ──────────────────────────
const smoothClosedPath = (pts: [number, number][]): string => {
  const n = pts.length;
  if (n < 3) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
};

// ─── Kenyal Wobble Bubble Path Generator ────────────────────────────────────────
const generateBubblePath = (
  cx: number,
  cy: number,
  baseRadius: number,
  t: number,
  seed: number,
  elasticity: number,
  numVertices: number,
): string => {
  const pts: [number, number][] = [];
  const e = elasticity;

  const squashPhase = seed * 1.7;
  const sqX = 1.0 + 0.05 * e * Math.sin(2 * t + squashPhase);
  const sqY = 1.0 - 0.05 * e * Math.sin(2 * t + squashPhase);

  for (let v = 0; v < numVertices; v++) {
    const angle = (v / numVertices) * Math.PI * 2;
    let r = baseRadius;

    r += baseRadius * 0.08 * e * Math.sin(2 * angle + 2 * t + seed * 1.1);
    r += baseRadius * 0.055 * e * Math.sin(3 * angle - 3 * t + seed * 2.3);
    r += baseRadius * 0.035 * e * Math.sin(4 * angle + 1 * t + seed * 3.7);
    r += baseRadius * 0.025 * e * Math.sin(5 * angle - 2 * t + seed * 0.9);
    r += baseRadius * 0.015 * e * Math.sin(6 * angle + 4 * t + seed * 4.1);

    const x = cx + r * Math.cos(angle) * sqX;
    const y = cy + r * Math.sin(angle) * sqY;
    pts.push([x, y]);
  }

  return smoothClosedPath(pts);
};

// ─── Bubble Data Type Definitions ───────────────────────────────────────────────
interface BubbleData {
  id: number;
  startX: number;
  startY: number;
  radius: number;
  speed: number;
  wobbleFreqX: number;
  wobbleAmpX: number;
  seed: number;
  depth: number;
  elasticity: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const AquaBubbleRise: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const progress = frame / durationInFrames; 
  const t = progress * Math.PI * 2; 
  const sf = height / 2160; 

  const wrapH = height * 1.4;
  const marginY = height * 0.2;
  const currentDrift = 25 * sf * Math.sin(1 * t);

  // ── Large Bubbles (8) ──────────────────────────────────────────────────────
  const largeBubbles = useMemo((): BubbleData[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      startX: hash(i * 13 + 1) * width * 0.7 + width * 0.15,
      startY: hash(i * 17 + 3) * wrapH,
      radius: (65 + hash(i * 23 + 7) * 115) * sf,
      speed: 1 + (i % 3),
      wobbleFreqX: 1 + (i % 4),
      wobbleAmpX: (35 + hash(i * 31 + 11) * 55) * sf,
      seed: i * 2.399 + 0.5,
      depth: 0.35 + hash(i * 41 + 5) * 0.65,
      elasticity: 0.85 + hash(i * 53 + 9) * 0.25, // Slightly more kenyal
    }));
  }, [width, wrapH, sf]);

  // ── Medium Bubbles (20) ────────────────────────────────────────────────────
  const medBubbles = useMemo((): BubbleData[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i + 100,
      startX: hash(i * 19 + 101) * width,
      startY: hash(i * 29 + 103) * wrapH,
      radius: (16 + hash(i * 37 + 107) * 38) * sf,
      speed: 1 + (i % 4),
      wobbleFreqX: 1 + (i % 3),
      wobbleAmpX: (15 + hash(i * 43 + 109) * 28) * sf,
      seed: i * 3.14 + 10,
      depth: 0.1 + hash(i * 47 + 111) * 0.55,
      elasticity: 0.6 + hash(i * 59 + 113) * 0.5,
    }));
  }, [width, wrapH, sf]);

  // ── Micro Bubbles (50) ─────────────────────────────────────────────────────
  const microBubbles = useMemo((): BubbleData[] => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 200,
      startX: hash(i * 23 + 201) * width,
      startY: hash(i * 31 + 203) * wrapH,
      radius: (2 + hash(i * 41 + 207) * 11) * sf,
      speed: 1 + (i % 5),
      wobbleFreqX: 1 + (i % 2),
      wobbleAmpX: (5 + hash(i * 53 + 209) * 12) * sf,
      seed: i * 1.618 + 20,
      depth: hash(i * 61 + 211) * 0.45,
      elasticity: 0.3,
    }));
  }, [width, wrapH, sf]);

  // ── Dust Particles (40) ────────────────────────────────────────────────────
  const dustParticles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i + 300,
      x: hash(i * 29 + 301) * width,
      y: hash(i * 37 + 303) * height,
      radius: (1 + hash(i * 43 + 307) * 3) * sf,
      driftFreqX: 1 + (i % 3),
      driftFreqY: 1 + (i % 2),
      driftAmpX: (10 + hash(i * 53 + 309) * 25) * sf,
      driftAmpY: (5 + hash(i * 59 + 311) * 18) * sf,
      phase: hash(i * 67 + 313) * Math.PI * 2,
      opacity: 0.12 + hash(i * 71 + 317) * 0.2,
    }));
  }, [width, height, sf]);

  // ── Caustic Light Rays (6) ─────────────────────────────────────────────────
  const causticRays = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      x: width * 0.08 + (i / 5) * width * 0.84,
      rayWidth: (60 + hash(i * 7 + 401) * 220) * sf,
      angle: -12 + hash(i * 11 + 403) * 24,
      swayFreq: 1 + (i % 3),
      swayAmp: (20 + hash(i * 13 + 407) * 45) * sf,
      opacity: 0.035 + hash(i * 17 + 409) * 0.05,
      phase: hash(i * 19 + 411) * Math.PI * 2,
    }));
  }, [width, sf]);

  const computePos = (b: BubbleData) => {
    const yOffset = b.speed * progress * wrapH;
    const y = ((b.startY - yOffset) % wrapH + wrapH) % wrapH - marginY;
    const xPrimary = b.wobbleAmpX * Math.sin(b.wobbleFreqX * t + b.seed);
    const xSecondary = b.wobbleAmpX * 0.3 * Math.sin((b.wobbleFreqX + 1) * t + b.seed * 2.1);
    const x = b.startX + xPrimary + xSecondary + currentDrift;
    return { x, y };
  };

  const lgRender = largeBubbles
    .map((b) => {
      const pos = computePos(b);
      const path = generateBubblePath(pos.x, pos.y, b.radius, t, b.seed, b.elasticity, 36);
      const depthOpacity = interpolate(b.depth, [0.3, 1], [0.45, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const dofBlur = interpolate(b.depth, [0.3, 0.6, 1], [3, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * sf;
      return { ...b, ...pos, path, depthOpacity, dofBlur };
    })
    .sort((a, b) => a.depth - b.depth);

  const medRender = medBubbles
    .map((b) => {
      const pos = computePos(b);
      const path = generateBubblePath(pos.x, pos.y, b.radius, t, b.seed, b.elasticity * 0.7, 24);
      const depthOpacity = interpolate(b.depth, [0, 0.55], [0.2, 0.55], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      const dofBlur = interpolate(b.depth, [0, 0.3, 0.55], [4, 2, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * sf;
      return { ...b, ...pos, path, depthOpacity, dofBlur };
    })
    .sort((a, b) => a.depth - b.depth);

  const microRender = microBubbles.map((b) => {
    const pos = computePos(b);
    const depthOpacity = interpolate(b.depth, [0, 0.45], [0.12, 0.35], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const wobbleR = b.radius * (1 + 0.12 * Math.sin(3 * t + b.seed));
    return { ...b, ...pos, depthOpacity, wobbleR };
  });

  const glowPulse = 0.6 + 0.4 * Math.sin(2 * t);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.bgUpper} 0%, ${COLORS.bgMid} 40%, ${COLORS.bgDeep} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Ambient Underwater Glow Spots */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: [
            `radial-gradient(ellipse 55% 40% at 25% 18%, rgba(11,52,88,${(0.45 * glowPulse).toFixed(3)}) 0%, transparent 70%)`,
            `radial-gradient(ellipse 45% 45% at 75% 55%, rgba(6,27,53,${(0.35 * glowPulse).toFixed(3)}) 0%, transparent 60%)`,
            `radial-gradient(ellipse 50% 35% at 50% 85%, rgba(11,52,88,${(0.25 * glowPulse).toFixed(3)}) 0%, transparent 65%)`,
          ].join(', '),
          pointerEvents: 'none' as const,
        }}
      />

      {/* Microscopic Dot Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(92,207,224,0.02) ${1 * sf}px, transparent ${1 * sf}px)`,
          backgroundSize: `${45 * sf}px ${45 * sf}px`,
          pointerEvents: 'none' as const,
        }}
      />

      {/* Caustic Light Rays */}
      {causticRays.map((ray, i) => {
        const sway = ray.swayAmp * Math.sin(ray.swayFreq * t + ray.phase);
        const pulseOp = ray.opacity * (0.7 + 0.3 * Math.sin(3 * t + ray.phase * 2));
        return (
          <div
            key={`ray-${i}`}
            style={{
              position: 'absolute',
              left: ray.x + sway,
              top: -height * 0.1,
              width: ray.rayWidth,
              height: height * 1.3,
              background: `linear-gradient(180deg, rgba(58,200,228,${(pulseOp * 1.8).toFixed(4)}) 0%, rgba(58,200,228,${pulseOp.toFixed(4)}) 25%, rgba(58,200,228,${(pulseOp * 0.4).toFixed(4)}) 60%, transparent 85%)`,
              transform: `rotate(${ray.angle}deg)`,
              filter: `blur(${35 * sf}px)`,
              transformOrigin: 'top center',
              pointerEvents: 'none' as const,
            }}
          />
        );
      })}

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <filter id="glow-lg" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${10 * sf}`} />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-md" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${5 * sf}`} />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="blur-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${4 * sf}`} />
          </filter>
          <filter id="blur-micro" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${2 * sf}`} />
          </filter>
          <filter id="blur-irid" x="-50%" y="-50%" width="200%" height="200%">
            {/* Strong blur for iridescent colors so they blend beautifully */}
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${8 * sf}`} />
          </filter>
          <filter id="glow-sparkle" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={`${1.5 * sf}`} />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Dynamic Iridescent Gradients for Large Bubbles */}
          {lgRender.map((b) => (
            <React.Fragment key={`defs-lg-${b.id}`}>
              <radialGradient
                id={`bgrad-${b.id}`}
                gradientUnits="userSpaceOnUse"
                cx={b.x - b.radius * 0.12} cy={b.y - b.radius * 0.12} r={b.radius * 1.15}
              >
                <stop offset="0%" stopColor={COLORS.white} stopOpacity={0.08} />
                <stop offset="35%" stopColor={COLORS.bubbleHighlight} stopOpacity={0.04} />
                <stop offset="65%" stopColor={COLORS.bubbleRim} stopOpacity={0.08} />
                <stop offset="88%" stopColor={COLORS.bubbleRim} stopOpacity={0.20} />
                <stop offset="96%" stopColor={COLORS.bubbleRim} stopOpacity={0.15} />
                <stop offset="100%" stopColor={COLORS.bubbleRim} stopOpacity={0.05} />
              </radialGradient>
              
              {/* Animated linear gradient for iridescent effect */}
              <linearGradient
                id={`irid-${b.id}`}
                x1={`${50 + 50 * Math.cos(2 * t + b.seed)}%`}
                y1={`${50 + 50 * Math.sin(2 * t + b.seed)}%`}
                x2={`${50 - 50 * Math.cos(2 * t + b.seed)}%`}
                y2={`${50 - 50 * Math.sin(2 * t + b.seed)}%`}
              >
                <stop offset="0%" stopColor={COLORS.iridPink} stopOpacity={0.6} />
                <stop offset="30%" stopColor={COLORS.iridMint} stopOpacity={0.6} />
                <stop offset="70%" stopColor={COLORS.iridGold} stopOpacity={0.6} />
                <stop offset="100%" stopColor={COLORS.iridPurple} stopOpacity={0.6} />
              </linearGradient>
            </React.Fragment>
          ))}

          {/* Dynamic Iridescent Gradients for Medium Bubbles */}
          {medRender.map((b) => (
            <linearGradient
              key={`defs-med-${b.id}`}
              id={`irid-med-${b.id}`}
              x1={`${50 + 50 * Math.cos(2 * t + b.seed * 2)}%`}
              y1={`${50 + 50 * Math.sin(2 * t + b.seed * 2)}%`}
              x2={`${50 - 50 * Math.cos(2 * t + b.seed * 2)}%`}
              y2={`${50 - 50 * Math.sin(2 * t + b.seed * 2)}%`}
            >
              <stop offset="0%" stopColor={COLORS.iridPink} stopOpacity={0.5} />
              <stop offset="50%" stopColor={COLORS.iridMint} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS.iridGold} stopOpacity={0.5} />
            </linearGradient>
          ))}
        </defs>

        {/* Dust Particles */}
        <g>
          {dustParticles.map((p) => {
            const dx = p.driftAmpX * Math.sin(p.driftFreqX * t + p.phase);
            const dy = p.driftAmpY * Math.cos(p.driftFreqY * t + p.phase * 1.3);
            return (
              <circle
                key={`dust-${p.id}`}
                cx={p.x + dx + currentDrift * 0.5} cy={p.y + dy} r={p.radius}
                fill={COLORS.particle} opacity={p.opacity} filter="url(#blur-micro)"
              />
            );
          })}
        </g>

        {/* Micro Bubbles */}
        <g>
          {microRender.map((b) => (
            <g key={`micro-${b.id}`} opacity={b.depthOpacity}>
              <circle cx={b.x} cy={b.y} r={b.wobbleR} fill="rgba(92,207,224,0.15)" stroke="rgba(92,207,224,0.3)" strokeWidth={0.6 * sf} />
              <circle cx={b.x - b.wobbleR * 0.28} cy={b.y - b.wobbleR * 0.28} r={Math.max(b.wobbleR * 0.18, 0.5 * sf)} fill="rgba(255,255,255,0.6)" />
            </g>
          ))}
        </g>

        {/* Medium Bubbles */}
        <g>
          {medRender.map((b) => (
            <g key={`med-${b.id}`} opacity={b.depthOpacity} style={{ filter: b.dofBlur > 0.5 ? `blur(${b.dofBlur.toFixed(1)}px)` : undefined }}>
              <circle cx={b.x} cy={b.y} r={b.radius * 1.6} fill="rgba(92,207,224,0.05)" filter="url(#blur-soft)" />
              <path d={b.path} fill="rgba(168,238,248,0.06)" stroke="rgba(92,207,224,0.25)" strokeWidth={1 * sf} />
              
              {/* Soft blurred iridescent inner glow */}
              <path d={b.path} fill={`url(#irid-med-${b.id})`} filter="url(#blur-irid)" style={{ mixBlendMode: 'screen' }} opacity={0.6} />
              
              <ellipse
                cx={b.x - b.radius * 0.22} cy={b.y - b.radius * 0.28}
                rx={b.radius * 0.22} ry={b.radius * 0.13}
                fill="rgba(255,255,255,0.6)"
                transform={`rotate(-22, ${b.x - b.radius * 0.22}, ${b.y - b.radius * 0.28})`}
                filter="url(#glow-sparkle)"
              />
            </g>
          ))}
        </g>

        {/* Large Bubbles */}
        <g>
          {lgRender.map((b) => (
            <g key={`lg-${b.id}`} opacity={b.depthOpacity} style={{ filter: b.dofBlur > 0.5 ? `blur(${b.dofBlur.toFixed(1)}px)` : undefined }}>
              {/* Outer ambient glow halo */}
              <circle cx={b.x} cy={b.y} r={b.radius * 2.2} fill="rgba(58,200,228,0.05)" filter="url(#glow-lg)" />

              {/* Bubble body with Fresnel radial gradient */}
              <path d={b.path} fill={`url(#bgrad-${b.id})`} stroke="rgba(92,207,224,0.3)" strokeWidth={1.5 * sf} />

              {/* Vibrant blurred iridescent colors */}
              <path
                d={b.path}
                fill={`url(#irid-${b.id})`}
                filter="url(#blur-irid)"
                style={{ mixBlendMode: 'screen' }}
                opacity={0.7}
              />

              {/* Inner rim glow */}
              <path d={b.path} fill="none" stroke="rgba(92,207,224,0.15)" strokeWidth={4 * sf} filter="url(#blur-soft)" />

              {/* Primary specular highlight - Bright sunlight reflection */}
              <ellipse
                cx={b.x - b.radius * 0.26} cy={b.y - b.radius * 0.3}
                rx={b.radius * 0.3} ry={b.radius * 0.17}
                fill="rgba(255,255,255,0.85)"
                transform={`rotate(-28, ${b.x - b.radius * 0.26}, ${b.y - b.radius * 0.3})`}
                filter="url(#glow-sparkle)"
              />

              {/* Secondary specular */}
              <ellipse
                cx={b.x + b.radius * 0.18} cy={b.y + b.radius * 0.22}
                rx={b.radius * 0.14} ry={b.radius * 0.08}
                fill="rgba(255,255,255,0.3)"
                transform={`rotate(35, ${b.x + b.radius * 0.18}, ${b.y + b.radius * 0.22})`}
              />

              {/* Sharp specular dot with sparkle */}
              <circle
                cx={b.x - b.radius * 0.18} cy={b.y - b.radius * 0.26}
                r={b.radius * 0.055} fill="rgba(255,255,255,0.95)"
                filter="url(#glow-sparkle)"
              />

              {/* Tiny secondary dot */}
              <circle cx={b.x - b.radius * 0.32} cy={b.y - b.radius * 0.18} r={b.radius * 0.03} fill="rgba(255,255,255,0.6)" />
            </g>
          ))}
        </g>
      </svg>

      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 65% 55% at 50% 50%, transparent 35%, rgba(1,8,18,0.75) 100%)',
          pointerEvents: 'none' as const,
        }}
      />
    </AbsoluteFill>
  );
};
