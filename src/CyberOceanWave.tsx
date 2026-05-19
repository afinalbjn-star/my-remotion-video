import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  staticFile,
} from 'remotion';

// Curated Sleek Dark Tech & Cyberpunk Ocean Color Palette
const colors = {
  bg: '#010206',
  primary: '#00f2ff',      // Cyan Wave Crests
  accent: '#7b2cbf',       // Deep Royal Violet
  foam: '#ffffff',         // Bright White Peak accents
  darkWater: '#030712',    // Deep Sea Floor
  gridLines: 'rgba(0, 242, 255, 0.08)',
};

export const CyberOceanWave: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Loop progress perfectly calibrated from 0.0 to 1.0 (seamless loops)
  const progress = frame / durationInFrames;
  const t = progress * Math.PI * 2; // Time variable for 360-degree looping math

  // Dimensions of the 3D mesh grid
  const cols = 28;
  const rows = 16;

  // Projection engine parameters
  const gridWidth = width * 1.5;
  const gridDepth = 1200;
  const scaleFactor = height / 2160;

  // Multi-layered Wave Superposition (Sum of 3 distinct complex sine waves)
  const calculateWaveHeight = (x: number, z: number, tVal: number) => {
    // Wave 1: Large directional swells moving forward-right
    const w1 = Math.sin(x * 0.0018 + z * 0.001 + tVal) * 90;
    
    // Wave 2: Shorter, fast counter-current ripples
    const w2 = Math.cos(x * -0.003 + z * 0.0025 - tVal * 2) * 35;
    
    // Wave 3: Fine micro-turbulence (adds fluid detail)
    const w3 = Math.sin(x * 0.006 + z * 0.007 + tVal * 3) * 12;

    // Amplitude attenuation toward boundaries for standard perspective frame fit
    const borderFade = Math.sin((x / gridWidth) * Math.PI) * Math.sin((z / gridDepth) * Math.PI);

    return (w1 + w2 + w3) * borderFade * scaleFactor;
  };

  // Generate 3D grid points dynamically and project them onto 2D viewport
  const projectedPoints = useMemo(() => {
    const points = [];

    for (let r = 0; r < rows; r++) {
      // Z runs from far away (depth 100) to near camera (depth 0)
      const zPercent = r / (rows - 1);
      const zRaw = zPercent * gridDepth;

      for (let c = 0; c < cols; c++) {
        const xPercent = c / (cols - 1);
        const xRaw = (xPercent - 0.5) * gridWidth;

        // Apply wave displacement
        const yRaw = calculateWaveHeight(xRaw + (gridWidth * 0.5), zRaw, t);

        // 3D Isometric Projection with depth distortion
        // Camera perspective calibration parameters:
        const fov = 1000;
        const cameraY = -550 * scaleFactor; // Position camera above the surface
        const cameraZ = -300;               // Put camera slightly back

        const relativeY = yRaw - cameraY;
        const relativeZ = zRaw - cameraZ;

        // Standard perspective scale multiplier
        const perspectiveScale = fov / (fov + relativeZ);

        // Map to 2D coordinates centered in canvas
        const screenX = width / 2 + xRaw * perspectiveScale;
        const screenY = height / 2 + relativeY * perspectiveScale + 250 * scaleFactor;

        points.push({
          row: r,
          col: c,
          x: screenX,
          y: screenY,
          depth: relativeZ, // Track depth for correct SVG paint-order sorting (Painter's Algorithm)
          yRaw,
          zRaw,
          scale: perspectiveScale * scaleFactor,
        });
      }
    }

    // Sort nodes back-to-front (highest depth drawn first) to ensure correct visual overlap
    return points.sort((a, b) => b.depth - a.depth);
  }, [frame, width, height, scaleFactor]);

  // Construct a lookup map for instant connectivity line drawing
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
      {/* Deep Sea Ambient Volumetric Backlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 30%, rgba(0, 242, 255, 0.15) 0%, rgba(123, 44, 191, 0.08) 50%, transparent 100%)`,
          filter: 'blur(80px)',
          opacity: 0.9 + Math.sin(frame * 0.05) * 0.08,
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
          <radialGradient id="waveGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </radialGradient>
          <filter id="meshGlow">
            <feGaussianBlur stdDeviation={10 * scaleFactor} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. DRAW GRID LINES (Threads/Structural Connections) */}
        <g opacity="0.65">
          {projectedPoints.map((pt) => {
            const nextRight = pointLookup[`${pt.row}_${pt.col + 1}`];
            const nextDown = pointLookup[`${pt.row + 1}_${pt.col}`];
            
            // Grid Line Opacity naturally decays as coordinates go deeper into horizon
            const depthFade = interpolate(pt.depth, [0, gridDepth], [0.85, 0.05], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Color shift: higher points look brighter, lower look darker purple
            const lineStroke = pt.yRaw > 30 * scaleFactor ? colors.primary : colors.accent;

            return (
              <React.Fragment key={`lines-${pt.row}-${pt.col}`}>
                {/* Horizontal Thread */}
                {nextRight && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={nextRight.x}
                    y2={nextRight.y}
                    stroke={lineStroke}
                    strokeWidth={interpolate(pt.depth, [0, gridDepth], [4.5, 0.8]) * scaleFactor}
                    opacity={depthFade}
                  />
                )}
                {/* Vertical Thread */}
                {nextDown && (
                  <line
                    x1={pt.x}
                    y1={pt.y}
                    x2={nextDown.x}
                    y2={nextDown.y}
                    stroke={lineStroke}
                    strokeWidth={interpolate(pt.depth, [0, gridDepth], [4.5, 0.8]) * scaleFactor}
                    opacity={depthFade}
                  />
                )}
              </React.Fragment>
            );
          })}
        </g>

        {/* 2. RENDERING MAPPED node.svg GRAPHIC AT VERTICES */}
        <g>
          {projectedPoints.map((pt) => {
            // Opacity curve mimicking real light reflection
            const opacity = interpolate(pt.depth, [0, gridDepth], [0.95, 0.1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            // Vertex Scaling based on 3D depth perspective
            const size = 64 * pt.scale;

            // Highlight peaks (crests) with clean high-contrast white reflection glow
            const isPeak = pt.yRaw < -40 * scaleFactor;
            const nodeFill = isPeak ? colors.foam : colors.primary;

            return (
              <g
                key={`node-${pt.row}-${pt.col}`}
                transform={`translate(${pt.x - size / 2}, ${pt.y - size / 2})`}
                opacity={opacity}
              >
                {/* Render the core system SVG shape overlaying the mesh junctions */}
                <image
                  href={staticFile('node.svg')}
                  width={size}
                  height={size}
                  style={{
                    filter: isPeak ? 'drop-shadow(0 0 12px #fff)' : 'drop-shadow(0 0 8px rgba(0, 242, 255, 0.7))',
                  }}
                />
                
                {/* Visual Vertex Highlight for additional depth accent */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={4 * pt.scale}
                  fill={nodeFill}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Futuristic Telemetry HUD overlays to align with existing visuals */}
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
        [ SIMULATION_SECTOR: CYBER_OCEAN_V1 ]
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
        [ WAVE_HEIGHT: MAX_SWELLS_4K ]
      </div>

      {/* Atmospheric Cinematic Vignette */}
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
