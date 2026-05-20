import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
} from 'remotion';

// Elegant Deep Navy & Luminous Blue/Cyan Palette (Exactly matching the reference image)
const colors = {
  bg: '#040a1c',           // Deep Navy Blue Base
  primary: '#00d2ff',      // Bright Luminous Cyan
  midWater: '#0d5fa6',     // Elegant Mid-Blue
  accent: '#08254c',       // Deep Ocean Shadow Blue
  foam: '#ffffff',         // Pristine White Crest Peaks
};

export const Oceancyber: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Loop progress perfectly calibrated from 0.0 to 1.0 (seamless loops)
  const progress = frame / durationInFrames;

  // Grid density: Clean, premium mesh without overcrowding
  const cols = 48;
  const rows = 36;

  // Grid dimensions designed to cover the 75-degree viewport and stretch beyond the screen boundaries
  const gridWidth = width * 3.8;
  const gridDepth = 6200;
  const scaleFactor = height / 2160;

  // Generate 3D grid points dynamically and project them onto 2D viewport (75-Degree Camera)
  const projectedPoints = useMemo(() => {
    const points = [];
    
    // Camera angle: Exactly 75 degrees from above
    const pitch = (75 * Math.PI) / 180;
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    // Gerstner Wave definitions for extreme, organic, and dramatic wave movements
    // All temporal frequencies (omega) are integers to guarantee a perfect seamless loop!
    const waves = [
      { amp: 460 * scaleFactor, kx: 0.0008, kz: -0.0004, omega: 2, Q: 0.75 },  // Primary rolling ocean swell
      { amp: 200 * scaleFactor, kx: 0.0012, kz: 0.0014, omega: -3, Q: 0.65 },  // Heavy cross-current swell
      { amp: 95 * scaleFactor, kx: 0.0032, kz: -0.0008, omega: 5, Q: 0.5 },   // Sharp wind wave crests
      { amp: 35 * scaleFactor, kx: -0.0025, kz: 0.0060, omega: -8, Q: 0.4 },  // High-frequency choppy details
    ];

    const tVal = progress * 2 * Math.PI;

    for (let r = 0; r < rows; r++) {
      const zPercent = r / (rows - 1);
      const zRaw = (zPercent - 0.5) * gridDepth;

      for (let c = 0; c < cols; c++) {
        const xPercent = c / (cols - 1);
        const xRaw = (xPercent - 0.5) * gridWidth;

        // Apply Gerstner Wave formulas
        let xDisp = xRaw;
        let zDisp = zRaw;
        let yDisp = 0;

        waves.forEach((w) => {
          const phase = (xRaw * w.kx + zRaw * w.kz) - tVal * w.omega;
          const kMag = Math.sqrt(w.kx * w.kx + w.kz * w.kz);
          
          if (kMag > 0) {
            // Gerstner wave horizontal displacement pulls points towards the crest
            xDisp -= (w.kx / kMag) * w.amp * w.Q * Math.sin(phase);
            zDisp -= (w.kz / kMag) * w.amp * w.Q * Math.sin(phase);
          }
          yDisp += w.amp * Math.cos(phase);
        });

        // Border fading to keep the edges smooth and prevent any clipping
        const borderFade = Math.sin(xPercent * Math.PI) * Math.sin(zPercent * Math.PI);
        const wideBorderFade = Math.pow(Math.max(0, borderFade), 0.15);

        // Apply fading to height displacement
        const yFinal = yDisp * wideBorderFade;
        // Keep the horizontal displacement fading near borders to preserve grid structure
        const xFinal = xRaw + (xDisp - xRaw) * wideBorderFade;
        const zFinal = zRaw + (zDisp - zRaw) * wideBorderFade;

        // Apply X-axis pitch rotation (75 degrees)
        const xRot = xFinal;
        const yRot = yFinal * cosP - zFinal * sinP;
        const zRot = yFinal * sinP + zFinal * cosP;

        // Perspective projection setup
        const fov = 2000;
        const cameraDist = 2800; // Adjusted camera distance to frame the grid perfectly
        const perspectiveScale = fov / (fov + zRot + cameraDist);

        // Map to 2D screen coordinates
        const screenX = width / 2 + xRot * perspectiveScale;
        const screenY = height / 2 + yRot * perspectiveScale;

        points.push({
          row: r,
          col: c,
          x: screenX,
          y: screenY,
          depth: zRot,
          yRaw: yFinal,
          scale: perspectiveScale * scaleFactor,
        });
      }
    }

    // Sort back-to-front
    return points.sort((a, b) => b.depth - a.depth);
  }, [frame, width, height, scaleFactor, progress]);

  // Construct a lookup map for grid connections
  const pointLookup = useMemo(() => {
    const map: Record<string, typeof projectedPoints[0]> = {};
    projectedPoints.forEach((pt) => {
      map[`${pt.row}_${pt.col}`] = pt;
    });
    return map;
  }, [projectedPoints]);

  // Helper to color lines dynamically based on height displacement
  const getLineColor = (yRaw: number) => {
    // Peak crests (positive yRaw) are bright cyan/white, troughs (negative yRaw) are deep blue
    const normalizedHeight = interpolate(yRaw, [-280 * scaleFactor, 280 * scaleFactor], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    if (normalizedHeight < 0.5) {
      return interpolateColors(normalizedHeight * 2, [0, 1], [colors.accent, colors.midWater]);
    } else {
      return interpolateColors((normalizedHeight - 0.5) * 2, [0, 1], [colors.midWater, colors.primary]);
    }
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Massive Volumetric Ocean Ambient Glow from Upper Left (exactly like the reference image) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 35% 25%, rgba(0, 162, 255, 0.28) 0%, rgba(13, 95, 166, 0.12) 50%, transparent 100%)`,
          filter: 'blur(80px)',
          opacity: 0.95 + Math.sin(frame * 0.05) * 0.03,
          pointerEvents: 'none',
        }}
      />

      {/* Cybernetic Ocean Mesh Canvas */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {/* 1. DRAW ENHANCED GRID LINES (Smooth depth & height gradient threads) */}
        <g opacity="0.85">
          {projectedPoints.map((pt) => {
            const nextRight = pointLookup[`${pt.row}_${pt.col + 1}`];
            const nextDown = pointLookup[`${pt.row + 1}_${pt.col}`];
            
            // Depth fading to mimic photographic lens focus fall-off (depth of field)
            const depthFade = interpolate(pt.depth, [-1500, 1500], [0.95, 0.15], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Line thickness gets thinner in the distance
            const strokeWidth = interpolate(pt.depth, [-1500, 1500], [6.5, 1.6]) * scaleFactor;

            const lineColor = getLineColor(pt.yRaw);

            return (
              <React.Fragment key={`lines-${pt.row}-${pt.col}`}>
                {/* Horizontal Wave Thread */}
                {nextRight && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={nextRight.x}
                    y2={nextRight.y}
                    stroke={lineColor}
                    strokeWidth={strokeWidth}
                    opacity={depthFade}
                  />
                )}
                {/* Vertical Wave Thread */}
                {nextDown && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={nextDown.x}
                    y2={nextDown.y}
                    stroke={lineColor}
                    strokeWidth={strokeWidth}
                    opacity={depthFade}
                  />
                )}
              </React.Fragment>
            );
          })}
        </g>

        {/* 2. RENDERING NODES WITH HALO AND CORE GLOW */}
        <g>
          {projectedPoints.map((pt) => {
            // Depth-based opacity fading for high-end depth of field
            const depthFade = interpolate(pt.depth, [-1500, 1500], [0.95, 0.25], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Crest peaks scale slightly larger for organic variety
            const heightScale = interpolate(pt.yRaw, [-280 * scaleFactor, 280 * scaleFactor], [0.75, 1.25], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const nodeScale = pt.scale * heightScale;
            const coreRadius = 5.5 * nodeScale;
            const glowRadius = 14 * nodeScale;

            const heightPercent = interpolate(pt.yRaw, [-280 * scaleFactor, 280 * scaleFactor], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            let nodeColor;
            let glowColor;
            let glowOpacity;

            if (heightPercent > 0.8) {
              // Foam crests: Glowing white
              nodeColor = '#ffffff';
              glowColor = '#00d2ff';
              glowOpacity = 0.85;
            } else if (heightPercent > 0.4) {
              // Mid-water: Luminous Cyan
              nodeColor = interpolateColors((heightPercent - 0.4) / 0.4, [0, 1], ['#00d2ff', '#ffffff']);
              glowColor = '#00d2ff';
              glowOpacity = 0.55;
            } else {
              // Troughs: Deep Ocean Blue
              nodeColor = interpolateColors(heightPercent / 0.4, [0, 1], ['#0d5fa6', '#00d2ff']);
              glowColor = '#0d5fa6';
              glowOpacity = 0.25;
            }

            return (
              <g
                key={`node-${pt.row}-${pt.col}`}
                opacity={depthFade}
              >
                {/* Volumetric Radial Glow Halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={glowRadius}
                  fill={glowColor}
                  opacity={glowOpacity * 0.35}
                  style={{
                    filter: 'blur(3px)',
                  }}
                />
                
                {/* Luminous Inner Core Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={coreRadius}
                  fill={nodeColor}
                  style={{
                    filter: heightPercent > 0.8 ? 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.95))' : 'none',
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Atmospheric Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(3, 8, 24, 0.4) 60%, rgba(3, 8, 24, 0.92) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
