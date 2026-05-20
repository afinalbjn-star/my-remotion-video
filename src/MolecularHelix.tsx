import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
} from 'remotion';

// Elegant Medical Bio-Tech Palette
const colors = {
  bg: '#020916',           // Sterile Dark Teal-Navy
  mint: '#00e676',         // Vibrant Bio-Green
  teal: '#00e5ff',         // Luminous Cyan-Teal
  blue: '#00b0ff',         // Clean Medical Blue
  white: '#ffffff',        // Sterile Bright Light
  accent: '#0d2d5e',       // Shadow Medical Blue
};

export const MolecularHelix: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Seamless progress 0 to 1
  const progress = frame / durationInFrames;
  
  // Constant rotation of DNA: exactly 2 full rotations (4 * PI) to loop seamlessly
  const dnaRotation = progress * Math.PI * 4;

  const scaleFactor = height / 2160;

  // 1. Generate DNA Double Helix Nodes and Connections
  const dnaData = useMemo(() => {
    const nodes: any[] = [];
    const connections: any[] = [];

    const numPoints = 28; // Number of base pairs
    const radius = 260 * scaleFactor;
    const helixLength = height * 1.3;
    
    // Pitch / Tilt of DNA in 3D space
    const pitch = (35 * Math.PI) / 180; // 35 degrees tilt
    const yaw = (15 * Math.PI) / 180;   // 15 degrees yaw
    
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    for (let i = 0; i < numPoints; i++) {
      const percent = i / (numPoints - 1);
      
      // Vertical position along the DNA spine (unrotated)
      const yRaw = (percent - 0.5) * helixLength;
      
      // Helix twist angle
      const theta = percent * Math.PI * 4.5 + dnaRotation;

      // --- STRAND A ---
      const xA_raw = radius * Math.cos(theta);
      const zA_raw = radius * Math.sin(theta);
      
      // Apply 3D rotation
      // 1. Yaw (around Y axis)
      const xA_y = xA_raw * cosY - zA_raw * sinY;
      const zA_y = xA_raw * sinY + zA_raw * cosY;
      // 2. Pitch (around X axis)
      const xA = xA_y;
      const yA = yRaw * cosP - zA_y * sinP;
      const zA = yRaw * sinP + zA_y * cosP;

      // --- STRAND B ---
      const xB_raw = radius * Math.cos(theta + Math.PI);
      const zB_raw = radius * Math.sin(theta + Math.PI);
      
      // Apply 3D rotation
      const xB_y = xB_raw * cosY - zB_raw * sinY;
      const zB_y = xB_raw * sinY + zB_raw * cosY;
      const xB = xB_y;
      const yB = yRaw * cosP - zB_y * sinP;
      const zB = yRaw * sinP + zB_y * cosP;

      // Perspective Projection Setup
      const fov = 2200;
      const cameraDist = 3000;
      
      const scaleA = fov / (fov + zA + cameraDist);
      const screenXA = width / 2 + xA * scaleA;
      const screenYA = height / 2 + yA * scaleA;

      const scaleB = fov / (fov + zB + cameraDist);
      const screenXB = width / 2 + xB * scaleB;
      const screenYB = height / 2 + yB * scaleB;

      // Add Strand A node
      const nodeA = {
        id: `A-${i}`,
        x: screenXA,
        y: screenYA,
        depth: zA,
        scale: scaleA * scaleFactor,
        color: interpolateColors(percent, [0, 0.5, 1], [colors.mint, colors.teal, colors.blue]),
        type: 'A',
      };

      // Add Strand B node
      const nodeB = {
        id: `B-${i}`,
        x: screenXB,
        y: screenYB,
        depth: zB,
        scale: scaleB * scaleFactor,
        color: interpolateColors(percent, [0, 0.5, 1], [colors.teal, colors.blue, colors.mint]),
        type: 'B',
      };

      nodes.push(nodeA, nodeB);

      // Connective Base Pair Line
      const connDepth = (zA + zB) / 2;
      connections.push({
        id: `C-${i}`,
        x1: screenXA,
        y1: screenYA,
        x2: screenXB,
        y2: screenYB,
        depth: connDepth,
        scale: (scaleA + scaleB) / 2 * scaleFactor,
        colorA: nodeA.color,
        colorB: nodeB.color,
      });
    }

    return { nodes, connections };
  }, [frame, width, height, dnaRotation, scaleFactor]);

  // 2. Generate Floating Bio-Luminescent Particles (Seamless loop using 3D Sine waves)
  const particles = useMemo(() => {
    const list = [];
    const count = 70;
    
    // Pseudo-random but deterministic particle positions
    for (let i = 0; i < count; i++) {
      const seedX = Math.sin(i * 12.3) * 0.5 + 0.5;
      const seedY = Math.cos(i * 37.1) * 0.5 + 0.5;
      const seedZ = Math.sin(i * 84.7) * 0.5 + 0.5;
      
      const xBase = (seedX - 0.5) * width * 1.8;
      const yBase = (seedY - 0.5) * height * 1.5;
      const zBase = (seedZ - 0.5) * 1500;

      // Gentle orbital/wave drift (perfectly seamless over 10s using 1x or 2x speed)
      const speed = Math.sin(i * 5.7) > 0 ? 1 : 2;
      const driftAngle = progress * Math.PI * 2 * speed;
      const driftRadius = 90 * scaleFactor;
      
      const xDrift = Math.cos(driftAngle + i) * driftRadius;
      const yDrift = Math.sin(driftAngle * 1.5 + i) * driftRadius * 0.6;
      const zDrift = Math.sin(driftAngle + i) * driftRadius * 0.5;

      const x = xBase + xDrift;
      const y = yBase + yDrift;
      const z = zBase + zDrift;

      // Project particle
      const fov = 2200;
      const cameraDist = 3000;
      const scale = fov / (fov + z + cameraDist);
      
      const screenX = width / 2 + x * scale;
      const screenY = height / 2 + y * scale;

      list.push({
        id: `p-${i}`,
        x: screenX,
        y: screenY,
        depth: z,
        scale: scale * scaleFactor,
        size: (5 + seedX * 12) * scale * scaleFactor,
        color: seedY > 0.6 ? colors.mint : seedY > 0.3 ? colors.teal : colors.blue,
        opacity: interpolate(z, [-750, 750], [0.85, 0.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      });
    }
    return list;
  }, [progress, width, height, scaleFactor]);

  // 3. Sort Everything (Nodes, Connections, Particles) together by depth (painter's algorithm)
  const renderedElements = useMemo(() => {
    const list: any[] = [];
    
    // Add connections with lower priority than their nodes
    dnaData.connections.forEach(c => {
      list.push({ ...c, renderType: 'connection' });
    });

    // Add nodes
    dnaData.nodes.forEach(n => {
      list.push({ ...n, renderType: 'node' });
    });

    // Add particles
    particles.forEach(p => {
      list.push({ ...p, renderType: 'particle' });
    });

    // Sort back-to-front (descending depth value, since large positive Z is further away)
    return list.sort((a, b) => b.depth - a.depth);
  }, [dnaData, particles]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Bio-Tech Lab High-Tech Ambient Backdrop Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 65% 30%, rgba(0, 229, 255, 0.18) 0%, rgba(0, 230, 118, 0.08) 45%, transparent 100%)`,
          filter: 'blur(90px)',
          opacity: 0.9 + Math.sin(frame * 0.04) * 0.05,
          pointerEvents: 'none',
        }}
      />
      
      {/* Microscopic Grid Matrix Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${colors.accent} 1.5px, transparent 1.5px)`,
          backgroundSize: '80px 80px',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />

      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {renderedElements.map((el) => {
          if (el.renderType === 'connection') {
            // DNA Base Pair Line
            const depthFade = interpolate(el.depth, [-800, 800], [0.9, 0.15], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const strokeWidth = 5.0 * el.scale;

            return (
              <g key={el.id} opacity={depthFade}>
                {/* Dual color gradient line representation */}
                <line
                  x1={el.x1}
                  y1={el.y1}
                  x2={el.x2}
                  y2={el.y2}
                  stroke={el.colorA}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                {/* Thin overlay representing bio-electric bond */}
                <line
                  x1={el.x1}
                  y1={el.y1}
                  x2={el.x2}
                  y2={el.y2}
                  stroke="#ffffff"
                  strokeWidth={strokeWidth * 0.3}
                  opacity={0.8}
                />
              </g>
            );
          }

          if (el.renderType === 'node') {
            // DNA Helix Strand Node (Sugar-phosphate backbone markers)
            const depthFade = interpolate(el.depth, [-800, 800], [0.95, 0.25], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            
            const radius = 15.0 * el.scale;
            const coreRadius = 6.0 * el.scale;

            return (
              <g key={el.id} opacity={depthFade}>
                {/* Outer Glow Halo */}
                <circle
                  cx={el.x}
                  cy={el.y}
                  r={radius}
                  fill={el.color}
                  opacity={0.35}
                  style={{ filter: 'blur(2px)' }}
                />
                {/* Bright white core */}
                <circle
                  cx={el.x}
                  cy={el.y}
                  r={coreRadius}
                  fill={colors.white}
                  style={{
                    filter: 'drop-shadow(0 0 5px ' + el.color + ')',
                  }}
                />
              </g>
            );
          }

          if (el.renderType === 'particle') {
            // Floating Bio-Luminescent Particle
            return (
              <g key={el.id} opacity={el.opacity}>
                {/* Ambient Soft Glow */}
                <circle
                  cx={el.x}
                  cy={el.y}
                  r={el.size * 2.2}
                  fill={el.color}
                  opacity={0.16}
                  style={{ filter: 'blur(4px)' }}
                />
                {/* Particle Core */}
                <circle
                  cx={el.x}
                  cy={el.y}
                  r={el.size * 0.8}
                  fill={el.color}
                  opacity={0.7}
                />
                {/* Sharp Center Light */}
                <circle
                  cx={el.x}
                  cy={el.y}
                  r={el.size * 0.3}
                  fill={colors.white}
                  opacity={0.9}
                />
              </g>
            );
          }

          return null;
        })}
      </svg>

      {/* Cinematic Clinical Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, transparent 30%, rgba(2, 9, 22, 0.45) 70%, rgba(2, 9, 22, 0.95) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
