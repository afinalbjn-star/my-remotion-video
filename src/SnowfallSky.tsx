import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Seeded pseudo-random number generator for deterministic rendering
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Snowflake {
  id: number;
  // Position (0-1 normalized)
  startX: number;
  startY: number;
  // Size in pixels
  size: number;
  // Layer: 0 = far background, 1 = mid, 2 = close foreground
  layer: number;
  // Speed multiplier
  speed: number;
  // Horizontal drift amplitude and frequency
  driftAmplitude: number;
  driftFrequency: number;
  driftPhase: number;
  // Opacity
  opacity: number;
  // Rotation speed
  rotationSpeed: number;
  // Shape variant (0-3)
  shape: number;
  // Blur amount (px)
  blur: number;
  // Twinkle phase offset
  twinklePhase: number;
  // Slight scale pulse
  pulsePhase: number;
}

function generateSnowflakes(count: number, seed: number): Snowflake[] {
  const rng = mulberry32(seed);
  const flakes: Snowflake[] = [];

  for (let i = 0; i < count; i++) {
    const r1 = rng();
    // Weighted layer distribution: more far, fewer close
    const layer = r1 < 0.5 ? 0 : r1 < 0.82 ? 1 : 2;

    let size: number;
    let speed: number;
    let opacity: number;
    let blur: number;

    if (layer === 0) {
      // Far: small, slow, dim, blurred
      size = 2 + rng() * 5;
      speed = 0.15 + rng() * 0.25;
      opacity = 0.15 + rng() * 0.25;
      blur = 2 + rng() * 3;
    } else if (layer === 1) {
      // Mid: medium
      size = 6 + rng() * 12;
      speed = 0.35 + rng() * 0.35;
      opacity = 0.35 + rng() * 0.35;
      blur = 0.5 + rng() * 1.5;
    } else {
      // Close foreground: large, fast, bright, sharp
      size = 14 + rng() * 28;
      speed = 0.65 + rng() * 0.45;
      opacity = 0.6 + rng() * 0.4;
      blur = 0;
    }

    flakes.push({
      id: i,
      startX: rng(),
      startY: rng(),
      size,
      layer,
      speed,
      driftAmplitude: 15 + rng() * 60,
      driftFrequency: 0.3 + rng() * 1.2,
      driftPhase: rng() * Math.PI * 2,
      opacity,
      rotationSpeed: (rng() - 0.5) * 4,
      shape: Math.floor(rng() * 4),
      blur,
      twinklePhase: rng() * Math.PI * 2,
      pulsePhase: rng() * Math.PI * 2,
    });
  }

  return flakes;
}

// SVG snowflake crystal shape
const SnowflakeCrystal: React.FC<{ size: number; opacity: number }> = ({ size, opacity }) => {
  const half = size / 2;
  const arm = half * 0.9;
  const branch = arm * 0.35;
  const branchPos = arm * 0.55;

  return (
    <svg width={size} height={size} viewBox={`${-half} ${-half} ${size} ${size}`}>
      {[0, 60, 120].map((angle) => (
        <g key={angle} transform={`rotate(${angle})`}>
          {/* Main arm */}
          <line x1={0} y1={-arm} x2={0} y2={arm} stroke="white" strokeWidth={size * 0.04} strokeLinecap="round" opacity={opacity} />
          {/* Branches */}
          <line x1={0} y1={-branchPos} x2={-branch} y2={-branchPos - branch * 0.7} stroke="white" strokeWidth={size * 0.03} strokeLinecap="round" opacity={opacity * 0.85} />
          <line x1={0} y1={-branchPos} x2={branch} y2={-branchPos - branch * 0.7} stroke="white" strokeWidth={size * 0.03} strokeLinecap="round" opacity={opacity * 0.85} />
          <line x1={0} y1={branchPos} x2={-branch} y2={branchPos + branch * 0.7} stroke="white" strokeWidth={size * 0.03} strokeLinecap="round" opacity={opacity * 0.85} />
          <line x1={0} y1={branchPos} x2={branch} y2={branchPos + branch * 0.7} stroke="white" strokeWidth={size * 0.03} strokeLinecap="round" opacity={opacity * 0.85} />
        </g>
      ))}
      {/* Center dot */}
      <circle cx={0} cy={0} r={size * 0.06} fill="white" opacity={opacity * 0.9} />
    </svg>
  );
};

// Different snowflake shape renderers
const renderSnowShape = (shape: number, size: number, opacity: number) => {
  switch (shape) {
    case 0:
      // Soft circle (most common snow appearance)
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, 
              rgba(255,255,255,${opacity}) 0%, 
              rgba(220,235,255,${opacity * 0.7}) 40%, 
              rgba(200,220,255,${opacity * 0.3}) 70%, 
              rgba(180,200,240,0) 100%)`,
          }}
        />
      );
    case 1:
      // Crystal snowflake
      return <SnowflakeCrystal size={size} opacity={opacity} />;
    case 2:
      // Diamond / rhombus shape
      return (
        <div
          style={{
            width: size * 0.7,
            height: size * 0.7,
            transform: 'rotate(45deg)',
            borderRadius: size * 0.08,
            background: `radial-gradient(circle at 40% 40%, 
              rgba(255,255,255,${opacity}) 0%, 
              rgba(210,230,255,${opacity * 0.6}) 50%, 
              rgba(180,210,250,0) 100%)`,
          }}
        />
      );
    case 3:
    default:
      // Star-like glow
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `radial-gradient(circle, 
              rgba(255,255,255,${opacity}) 0%, 
              rgba(230,240,255,${opacity * 0.5}) 30%, 
              rgba(200,220,255,${opacity * 0.15}) 60%, 
              transparent 100%)`,
            boxShadow: `0 0 ${size * 0.4}px ${size * 0.15}px rgba(255,255,255,${opacity * 0.3})`,
          }}
        />
      );
  }
};

export const SnowfallSky: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const totalDuration = durationInFrames; // frames
  const progress = frame / totalDuration; // 0 → 1 over the full duration, loops seamlessly

  // Generate snowflakes — high count for 4K
  const snowflakes = useMemo(() => generateSnowflakes(450, 42), []);

  // Subtle vignette pulse for "atmospheric breathing"
  const vignettePulse = Math.sin(progress * Math.PI * 2 * 3) * 0.03;

  return (
    <AbsoluteFill>
      {/* Sky gradient — looking up from below into blue sky */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse 120% 100% at 50% 100%, 
              #b8d4f0 0%,
              #8ab8e8 12%,
              #5a9ad8 25%,
              #3a82cc 38%,
              #2468b8 50%,
              #1a5aaa 60%,
              #144d96 70%,
              #0f4080 80%,
              #0a3570 90%,
              #062a5a 100%)
          `,
        }}
      />

      {/* Atmospheric haze / cloud wisps near horizon (bottom = horizon when looking up) */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse 180% 40% at 50% 105%, 
              rgba(210, 225, 240, 0.5) 0%, 
              rgba(180, 200, 225, 0.3) 30%, 
              rgba(150, 180, 210, 0.1) 60%, 
              transparent 100%)
          `,
        }}
      />

      {/* Subtle sun glow (faint, as if sun is off to the side) */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse 60% 50% at 70% 25%, 
              rgba(255, 250, 230, 0.12) 0%, 
              rgba(255, 245, 210, 0.06) 40%, 
              transparent 80%)
          `,
        }}
      />

      {/* Render snowflakes by layer (back to front) */}
      {[0, 1, 2].map((layer) => (
        <div key={layer} style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
          {snowflakes
            .filter((s) => s.layer === layer)
            .map((flake) => {
              // Time in seconds (for drift calculation)
              const timeSec = frame / fps;

              // Y position: snow falls DOWN in view (from top toward camera below)
              // Since camera looks UP, snow enters from the deep sky (top) and falls toward us (bottom)
              // Use modulo for seamless looping
              const fallDistance = flake.speed * progress;
              const rawY = flake.startY + fallDistance;
              // Seamless wrap: extend by 20% padding to avoid pop-in
              const yNorm = ((rawY % 1.2) + 1.2) % 1.2 - 0.1;
              const y = yNorm * height;

              // X position with sinusoidal drift
              const drift = Math.sin(timeSec * flake.driftFrequency + flake.driftPhase) * flake.driftAmplitude;
              const x = flake.startX * width + drift;

              // Rotation
              const rotation = timeSec * flake.rotationSpeed * 60;

              // Twinkle effect (subtle opacity modulation)
              const twinkle = 1 + Math.sin(timeSec * 2.5 + flake.twinklePhase) * 0.15;
              const currentOpacity = flake.opacity * twinkle;

              // Scale pulse for foreground flakes
              const scalePulse = flake.layer === 2 ? 1 + Math.sin(timeSec * 1.5 + flake.pulsePhase) * 0.08 : 1;

              // Depth-based perspective scaling (closer to bottom = closer to camera = larger)
              const perspectiveScale = flake.layer === 2
                ? interpolate(yNorm, [0, 1], [0.7, 1.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : flake.layer === 1
                  ? interpolate(yNorm, [0, 1], [0.85, 1.15], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                  : 1;

              const finalSize = flake.size * scalePulse * perspectiveScale;

              return (
                <div
                  key={flake.id}
                  style={{
                    position: 'absolute',
                    left: x - finalSize / 2,
                    top: y - finalSize / 2,
                    width: finalSize,
                    height: finalSize,
                    transform: `rotate(${rotation}deg)`,
                    filter: flake.blur > 0 ? `blur(${flake.blur}px)` : undefined,
                    willChange: 'transform',
                  }}
                >
                  {renderSnowShape(flake.shape, finalSize, currentOpacity)}
                </div>
              );
            })}
        </div>
      ))}

      {/* Atmospheric vignette overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse 80% 75% at 50% 50%, 
            transparent 50%, 
            rgba(5, 20, 50, ${0.25 + vignettePulse}) 100%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom frost/haze effect (simulating snow near camera lens) */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `linear-gradient(to top, 
            rgba(220, 235, 250, 0.15) 0%, 
            rgba(200, 220, 240, 0.06) 8%, 
            transparent 20%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
