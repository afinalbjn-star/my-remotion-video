import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

// Animated tech grid background composition
export const TechBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Slow scrolling offset for the grid
  const gridOffset = interpolate(frame, [0, durationInFrames], [0, 80]);

  // Pulsing glow for accent nodes
  const pulse = (Math.sin(frame / 12) + 1) / 2; // 0..1

  const gridSize = 60;
  const cols = Math.ceil(width / gridSize) + 2;
  const rows = Math.ceil(height / gridSize) + 2;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050a18' }}>
      {/* Radial glow background */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(0,180,255,0.15), rgba(5,10,24,0) 60%)',
        }}
      />

      {/* Grid lines */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {Array.from({ length: cols }).map((_, i) => {
          const x = i * gridSize - (gridOffset % gridSize);
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke="rgba(0,180,255,0.12)"
              strokeWidth={1}
            />
          );
        })}
        {Array.from({ length: rows }).map((_, j) => {
          const y = j * gridSize - (gridOffset % gridSize);
          return (
            <line
              key={`h-${j}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(0,180,255,0.12)"
              strokeWidth={1}
            />
          );
        })}

        {/* Glowing accent nodes at grid intersections */}
        {Array.from({ length: 14 }).map((_, k) => {
          const gx = (k * 137) % cols;
          const gy = (k * 89) % rows;
          const x = gx * gridSize - (gridOffset % gridSize);
          const y = gy * gridSize - (gridOffset % gridSize);
          const r = 3 + pulse * 4;
          return (
            <circle
              key={`node-${k}`}
              cx={x}
              cy={y}
              r={r}
              fill="rgba(0,220,255,0.9)"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(0,220,255,0.9))',
              }}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export default TechBackground;
