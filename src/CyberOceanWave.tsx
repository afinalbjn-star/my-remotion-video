import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from 'remotion';

// Sleek Cyberpunk Neon Ocean Color Palette
const colors = {
  bg: '#010105',
  primary: '#00f2ff',      // Neon Cyan (Crests)
  midWater: '#0077b6',     // Ocean Blue (Mids)
  accent: '#9d00ff',       // Quantum Purple (Valleys)
  foam: '#ffffff',         // White Peak Highlight
};

export const CyberOceanWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Loop progress perfectly calibrated from 0.0 to 1.0 (seamless loops)
  const progress = frame / durationInFrames;
  
  // Quadrupled propagation speed for intense, majestic ocean currents (8 * PI loops 4 times in 10s)
  const t = progress * Math.PI * 8; 

  // High-density grid coordinates to pack the screen with thousands of jaring-jaring and nodes
  const cols = 60;
  const rows = 45;

  // Ultra-wide grid dimensions to completely overshoot borders and cover the full screen
  const gridWidth = width * 3.6;
  const gridDepth = 6000;
  const scaleFactor = height / 2160;

  // Gigantic/Dahsyat Wave Superposition (High-amplitude, fast-moving ocean swells)
  const calculateWaveHeight = (x: number, z: number, tVal: number) => {
    // Wave 1: Gigantic ocean swells (Amplitude 480 - extremely powerful)
    const w1 = Math.sin(x * 0.0016 + z * 0.001 + tVal) * 480;
    
    // Wave 2: Powerful cross-current tidal waves (Amplitude 160)
    const w2 = Math.cos(x * -0.003 + z * 0.002 - tVal * 2.0) * 160;
    
    // Wave 3: Strong sharp secondary wind crests (Amplitude 60)
    const w3 = Math.sin(x * 0.006 + z * 0.006 + tVal * 3.0) * 60;

    // Boundary attenuation with an extremely flat fractional power curve
    // This allows the waves to remain massive and active all the way to the edges of the grid
    const borderFade = Math.sin((x / gridWidth) * Math.PI) * Math.sin((z / gridDepth) * Math.PI);
    const wideBorderFade = Math.pow(Math.max(0, borderFade), 0.02);

    return (w1 + w2 + w3) * wideBorderFade * scaleFactor;
  };

  // Helper to color segments dynamically based on vertex height
  const getWaveColor = (yRaw: number) => {
    // Crests are Cyan/White, valleys are Purple
    const normalizedHeight = interpolate(yRaw, [-350 * scaleFactor, 350 * scaleFactor], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    if (normalizedHeight > 0.72) {
      return colors.primary; // Neon Cyan
    } else if (normalizedHeight > 0.38) {
      return colors.midWater; // Ocean Blue
    } else {
      return colors.accent; // Vibrant Purple
    }
  };

  // Generate 3D grid points dynamically and project them onto 2D viewport (Steep Top-Down View)
  const projectedPoints = useMemo(() => {
    const points = [];
    
    // Steep Camera Pitch from above: 76 degrees (1.32 radians) to emphasize top-down grid layout
    const pitch = (76 * Math.PI) / 180;
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);

    for (let r = 0; r < rows; r++) {
      const zPercent = r / (rows - 1);
      // Center the depth coordinates to rotate around grid center
      const zRaw = (zPercent - 0.5) * gridDepth;

      for (let c = 0; c < cols; c++) {
        const xPercent = c / (cols - 1);
        const xRaw = (xPercent - 0.5) * gridWidth;

        // Apply high-intensity wave displacement
        const yRaw = calculateWaveHeight(xPercent * gridWidth, zPercent * gridDepth, t);

        // Apply X-axis pitch rotation for steep top-down camera look
        const xRot = xRaw;
        const yRot = yRaw * cosP - zRaw * sinP;
        const zRot = yRaw * sinP + zRaw * cosP;

        // Balanced Perspective setup looking down to span the entire screen
        const fov = 1600;
        const cameraDist = 2000;
        const perspectiveScale = fov / (fov + zRot + cameraDist);

        // Map to 2D screen positions centered vertically to cover top and bottom edges fully
        const screenX = width / 2 + xRot * perspectiveScale;
        const screenY = height / 2 + yRot * perspectiveScale;

        points.push({
          row: r,
          col: c,
          x: screenX,
          y: screenY,
          depth: zRot, // Depth value for back-to-front sorting
          yRaw,
          zRaw,
          scale: perspectiveScale * scaleFactor,
        });
      }
    }

    // Sort back-to-front so objects in background are drawn first
    return points.sort((a, b) => b.depth - a.depth);
  }, [frame, width, height, scaleFactor]);

  // Construct a lookup map for grid connections
  const pointLookup = useMemo(() => {
    const map: Record<string, typeof projectedPoints[0]> = {};
    projectedPoints.forEach((pt) => {
      map[`${pt.row}_${pt.col}`] = pt;
    });
    return map;
  }, [projectedPoints]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Massive Volumetric Ocean Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(0, 242, 255, 0.25) 0%, rgba(157, 0, 255, 0.15) 60%, transparent 100%)`,
          filter: 'blur(100px)',
          opacity: 0.95 + Math.sin(frame * 0.1) * 0.05,
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
        <defs>
          <filter id="ultraGlow">
            <feGaussianBlur stdDeviation={12 * scaleFactor} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. DRAW ENHANCED GRID LINES (Denser, ultra-vibrant connecting threads) */}
        <g opacity="0.95">
          {projectedPoints.map((pt) => {
            const nextRight = pointLookup[`${pt.row}_${pt.col + 1}`];
            const nextDown = pointLookup[`${pt.row + 1}_${pt.col}`];
            
            // Strong grid presence from foreground all the way to the horizon
            const depthFade = interpolate(pt.depth, [-1500, 1500], [0.95, 0.35], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const lineStroke = getWaveColor(pt.yRaw);

            // Robust line thickness for massive, sharp visual presence
            const strokeWidth = interpolate(pt.depth, [-1500, 1500], [7.5, 2.8]) * scaleFactor;

            return (
              <React.Fragment key={`lines-${pt.row}-${pt.col}`}>
                {/* Horizontal Wave Thread */}
                {nextRight && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={nextRight.x}
                    y2={nextRight.y}
                    stroke={lineStroke}
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
                    stroke={lineStroke}
                    strokeWidth={strokeWidth}
                    opacity={depthFade}
                  />
                )}
              </React.Fragment>
            );
          })}
        </g>

        {/* 2. RENDERING MAPPED node.svg GRAPHIC AT VERTICES WITH INTENSE GLOW */}
        <g>
          {projectedPoints.map((pt) => {
            const opacity = interpolate(pt.depth, [-1500, 1500], [0.98, 0.45], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Scaled perspective size of each node (refined for higher density)
            const size = 55 * pt.scale;

            // Highly pronounced peak highlights
            const isPeak = pt.yRaw < -120 * scaleFactor;
            const nodeFill = isPeak ? colors.foam : colors.primary;

            return (
              <g
                key={`node-${pt.row}-${pt.col}`}
                transform={`translate(${pt.x - size / 2}, ${pt.y - size / 2})`}
                opacity={opacity}
              >
                {/* Custom node SVG */}
                <image
                  href={staticFile('node.svg')}
                  width={size}
                  height={size}
                  style={{
                    filter: isPeak ? 'drop-shadow(0 0 14px #fff)' : 'drop-shadow(0 0 10px rgba(0, 242, 255, 0.85))',
                  }}
                />
                
                {/* Neon core focal point circle */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={6.0 * pt.scale}
                  fill={nodeFill}
                  style={{
                    filter: 'drop-shadow(0 0 8px #00f2ff)',
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
          boxShadow: `inset 0 0 ${400 * scaleFactor}px rgba(0,0,0,0.95)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
