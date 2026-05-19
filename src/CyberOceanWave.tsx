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
  primary: '#00f2ff',      // Neon Cyan
  midWater: '#0077b6',     // Ocean Blue
  accent: '#9d00ff',       // Quantum Purple
  foam: '#ffffff',         // White Peak Highlight
  gridLines: 'rgba(0, 242, 255, 0.15)',
};

export const CyberOceanWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Loop progress perfectly calibrated from 0.0 to 1.0 (seamless loops)
  const progress = frame / durationInFrames;
  
  // To double the speed and maintain a perfect loop, we multiply the progress by 2 cycles (4 * PI)
  const t = progress * Math.PI * 4; 

  // Increased dimensions of the 3D mesh grid for a richer, denser surface
  const cols = 30;
  const rows = 20;

  // Projection engine parameters
  const gridWidth = width * 1.6;
  const gridDepth = 1800;
  const scaleFactor = height / 2160;

  // High-intensity Wave Superposition (Sum of 3 distinct high-amplitude sine/cosine waves)
  const calculateWaveHeight = (x: number, z: number, tVal: number) => {
    // Wave 1: Large active swells moving diagonally (Amplitude 240)
    const w1 = Math.sin(x * 0.0022 + z * 0.0014 + tVal) * 240;
    
    // Wave 2: Faster cross-current ripples (Amplitude 80, double speed)
    const w2 = Math.cos(x * -0.004 + z * 0.003 - tVal * 2) * 80;
    
    // Wave 3: Sharp secondary wind waves (Amplitude 30, triple speed)
    const w3 = Math.sin(x * 0.008 + z * 0.008 + tVal * 3) * 30;

    // Smooth boundary attenuation to keep the edges clean
    const borderFade = Math.sin((x / gridWidth) * Math.PI) * Math.sin((z / gridDepth) * Math.PI);

    return (w1 + w2 + w3) * borderFade * scaleFactor;
  };

  // Helper to color segments dynamically based on vertex height
  const getWaveColor = (yRaw: number) => {
    // High peaks (negative Y in Remotion coordinate space) are Cyan, deep troughs are Purple
    const normalizedHeight = interpolate(yRaw, [-180 * scaleFactor, 180 * scaleFactor], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    if (normalizedHeight > 0.7) {
      return colors.primary; // Bright Cyan peaks
    } else if (normalizedHeight > 0.35) {
      return colors.midWater; // Deep Ocean Blue mid-waves
    } else {
      return colors.accent; // Vibrant Purple troughs
    }
  };

  // Generate 3D grid points dynamically and project them onto 2D viewport (Top-Down View)
  const projectedPoints = useMemo(() => {
    const points = [];
    
    // Steep Camera Pitch from above: 72 degrees (1.25 radians)
    const pitch = (72 * Math.PI) / 180;
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

        // Perspective Camera setup looking down from center
        const fov = 1500;
        const cameraDist = 1800;
        const perspectiveScale = fov / (fov + zRot + cameraDist);

        // Map to 2D screen positions with vertical shift to center the high-angle grid
        const screenX = width / 2 + xRot * perspectiveScale;
        const screenY = height / 2 + yRot * perspectiveScale + 200 * scaleFactor;

        points.push({
          row: r,
          col: c,
          x: screenX,
          y: screenY,
          depth: zRot, // Depth value for Painter's Algorithm sorting
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
      {/* Dynamic Ambient Ocean Backdrop Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 45%, rgba(0, 242, 255, 0.22) 0%, rgba(157, 0, 255, 0.12) 55%, transparent 100%)`,
          filter: 'blur(90px)',
          opacity: 0.95 + Math.sin(frame * 0.08) * 0.05,
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

        {/* 1. DRAW ENHANCED GRID LINES (Vibrant, Thicker Cyberpunk Threads) */}
        <g opacity="0.95">
          {projectedPoints.map((pt) => {
            const nextRight = pointLookup[`${pt.row}_${pt.col + 1}`];
            const nextDown = pointLookup[`${pt.row + 1}_${pt.col}`];
            
            // Bright visibility even for distant points to emphasize the entire grid
            const depthFade = interpolate(pt.depth, [-gridDepth/2, gridDepth/2], [0.95, 0.25], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const lineStroke = getWaveColor(pt.yRaw);

            // Double the line thickness range for outstanding definition
            const strokeWidth = interpolate(pt.depth, [-gridDepth/2, gridDepth/2], [8.0, 2.5], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }) * scaleFactor;

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

        {/* 2. RENDERING MAPPED node.svg GRAPHIC AT VERTICES WITH GLOW */}
        <g>
          {projectedPoints.map((pt) => {
            const opacity = interpolate(pt.depth, [-gridDepth/2, gridDepth/2], [0.98, 0.35], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Enhanced vertex scaling for absolute clarity
            const size = 80 * pt.scale;

            // Clean high-contrast white reflection glow for peaks
            const isPeak = pt.yRaw < -70 * scaleFactor;
            const nodeFill = isPeak ? colors.foam : colors.primary;

            return (
              <g
                key={`node-${pt.row}-${pt.col}`}
                transform={`translate(${pt.x - size / 2}, ${pt.y - size / 2})`}
                opacity={opacity}
              >
                {/* User's custom node.svg */}
                <image
                  href={staticFile('node.svg')}
                  width={size}
                  height={size}
                  style={{
                    filter: isPeak ? 'drop-shadow(0 0 14px #fff)' : 'drop-shadow(0 0 10px rgba(0, 242, 255, 0.85))',
                  }}
                />
                
                {/* Pronounced neon core circle in the center of the node */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={7.5 * pt.scale}
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

      {/* Modern HUD Overlays */}
      <div
        style={{
          position: 'absolute',
          top: 80 * scaleFactor,
          left: 80 * scaleFactor,
          color: colors.primary,
          fontSize: 16 * scaleFactor,
          letterSpacing: 4 * scaleFactor,
          fontWeight: 'bold',
          opacity: 0.8,
        }}
      >
        [ SIMULATION_SECTOR: CYBER_OCEAN_V2 ]
      </div>

      <div
        style={{
          position: 'absolute',
          top: 80 * scaleFactor,
          right: 80 * scaleFactor,
          color: colors.primary,
          fontSize: 16 * scaleFactor,
          letterSpacing: 4 * scaleFactor,
          fontWeight: 'bold',
          opacity: 0.8,
          textAlign: 'right',
        }}
      >
        [ ANGLE: HIGH_PITCH_TOP_DOWN // WAVE_SPEED: ACTIVE ]
      </div>

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 ${400 * scaleFactor}px rgba(0,0,0,0.9)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
