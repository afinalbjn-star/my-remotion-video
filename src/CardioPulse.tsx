import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
} from 'remotion';

// Elegant Medical Clinical Cardio Palette
const colors = {
  bg: '#080204',           // Premium Clinic Deep Charcoal-Red
  crimson: '#d50000',      // Medical Vitality Crimson Red
  pink: '#ff4081',         // Luminous Energy Rose Pink
  white: '#ffffff',        // Sterile Light White
  shadow: '#2b0008',       // Deep Dark Red Shadow
};

export const CardioPulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Progress 0.0 to 1.0
  const progress = frame / durationInFrames;

  const scaleFactor = height / 2160;

  // 1. Generate EKG / ECG Heartbeat Waveform points in 3D
  // The waveform moves from left to right and loops seamlessly
  const ecgWaves = useMemo(() => {
    const wavesList: any[] = [];
    const numWaves = 3; // 3 parallel waveforms for 3D depth layers

    for (let w = 0; w < numWaves; w++) {
      const points = [];
      const numPoints = 80;
      const layerZ = (w - (numWaves - 1) / 2) * 500; // Depth spacing
      
      // Calculate depth factors
      const fov = 1800;
      const cameraDist = 2200;
      const scale = fov / (fov + layerZ + cameraDist) * scaleFactor;

      // Heartbeat signal speed (exactly 2 beats in 10s to loop perfectly)
      const numBeats = 2;
      const t = progress * numBeats;

      for (let i = 0; i < numPoints; i++) {
        const xPercent = i / (numPoints - 1);
        const xRaw = (xPercent - 0.5) * width * 1.5;

        // Waveform ECG shape math:
        // Position of the heartbeat peak along the X-axis (repeats with t)
        const waveX = (t % 1.0) * width * 1.8 - width * 0.9;
        const dx = xRaw - waveX;

        // Create standard P-Q-R-S-T wave pulse based on distance from peak `dx`
        let yOffset = 0;
        const sigma = 70 * scaleFactor; // wave width factor

        // R wave (main sharp spike)
        if (Math.abs(dx) < 180 * scaleFactor) {
          const factorR = Math.exp(-Math.pow(dx / (45 * scaleFactor), 2));
          yOffset -= 320 * factorR * scaleFactor;
        }
        
        // S wave (deep dip immediately following R wave)
        const dxS = dx - 60 * scaleFactor;
        if (Math.abs(dxS) < 100 * scaleFactor) {
          const factorS = Math.exp(-Math.pow(dxS / (35 * scaleFactor), 2));
          yOffset += 110 * factorS * scaleFactor;
        }

        // Q wave (small dip immediately preceding R wave)
        const dxQ = dx + 50 * scaleFactor;
        if (Math.abs(dxQ) < 80 * scaleFactor) {
          const factorQ = Math.exp(-Math.pow(dxQ / (25 * scaleFactor), 2));
          yOffset += 60 * factorQ * scaleFactor;
        }

        // T wave (medium wide dome following S wave)
        const dxT = dx - 170 * scaleFactor;
        if (Math.abs(dxT) < 220 * scaleFactor) {
          const factorT = Math.exp(-Math.pow(dxT / (90 * scaleFactor), 2));
          yOffset -= 85 * factorT * scaleFactor;
        }

        // P wave (small dome preceding Q wave)
        const dxP = dx + 140 * scaleFactor;
        if (Math.abs(dxP) < 150 * scaleFactor) {
          const factorP = Math.exp(-Math.pow(dxP / (70 * scaleFactor), 2));
          yOffset -= 40 * factorP * scaleFactor;
        }

        // Add 3D sine noise for a organic fluid wiggle
        const noise = Math.sin(xPercent * Math.PI * 12 + progress * Math.PI * 4) * 15 * scaleFactor;
        const yRaw = (w - 1) * 220 * scaleFactor + yOffset + noise;

        // Project to 2D
        const screenX = width / 2 + xRaw * scale;
        const screenY = height / 2 + yRaw * scale;

        points.push({ x: screenX, y: screenY });
      }

      wavesList.push({
        id: `wave-${w}`,
        points,
        depth: layerZ,
        scale,
        opacity: interpolate(layerZ, [-600, 600], [0.95, 0.3]),
        stroke: w === 1 ? colors.pink : colors.crimson,
      });
    }

    return wavesList;
  }, [progress, width, height, scaleFactor]);

  // 2. Generate Floating Blood Cells & Oxygen molecules
  const cells = useMemo(() => {
    const list = [];
    const count = 55;

    for (let i = 0; i < count; i++) {
      const seedX = Math.sin(i * 14.1) * 0.5 + 0.5;
      const seedY = Math.cos(i * 29.3) * 0.5 + 0.5;
      const seedZ = Math.sin(i * 72.5) * 0.5 + 0.5;

      const xBase = (seedX - 0.5) * width * 1.6;
      const yBase = (seedY - 0.5) * height * 1.3;
      const zBase = (seedZ - 0.5) * 1200;

      // Flow motion from left to right (perfectly looping using 1x or 2x speed)
      const flowProgress = (progress + seedX) % 1.0;
      const xFlow = (flowProgress - 0.5) * width * 1.8;

      // Gentle vertical/depth bobbing
      const bobAngle = progress * Math.PI * 4 + i;
      const bobRadius = 45 * scaleFactor;
      const yBob = Math.sin(bobAngle) * bobRadius;
      const zBob = Math.cos(bobAngle) * bobRadius * 0.5;

      const x = xFlow;
      const y = yBase + yBob;
      const z = zBase + zBob;

      // Projection
      const fov = 1800;
      const cameraDist = 2200;
      const scale = fov / (fov + z + cameraDist);

      const screenX = width / 2 + x * scale;
      const screenY = height / 2 + y * scale;

      // Classify as Red Blood Cell (cakram/ring) or Oxygen/Energy Molecule (light)
      const isRedCell = i % 2 === 0;

      list.push({
        id: `cell-${i}`,
        x: screenX,
        y: screenY,
        depth: z,
        scale: scale * scaleFactor,
        size: (isRedCell ? (28 + seedY * 20) : (8 + seedY * 10)) * scale * scaleFactor,
        isRedCell,
        color: isRedCell ? colors.crimson : colors.white,
        opacity: interpolate(z, [-600, 600], [0.9, 0.18], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      });
    }

    return list;
  }, [progress, width, height, scaleFactor]);

  // 3. Sort Everything by depth (Painter's algorithm)
  const renderedElements = useMemo(() => {
    const list: any[] = [];

    ecgWaves.forEach(w => {
      list.push({ ...w, renderType: 'wave' });
    });

    cells.forEach(c => {
      list.push({ ...c, renderType: 'cell' });
    });

    return list.sort((a, b) => b.depth - a.depth);
  }, [ecgWaves, cells]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Volumetric Cardio Cardiovascular Radial Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(213, 0, 0, 0.16) 0%, rgba(255, 64, 129, 0.05) 55%, transparent 100%)`,
          filter: 'blur(90px)',
          opacity: 0.92 + Math.sin(frame * 0.05) * 0.04,
          pointerEvents: 'none',
        }}
      />

      {/* Sterile Clinical Grid Matrix Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${colors.shadow} 1.5px, transparent 1.5px)`,
          backgroundSize: '80px 80px',
          opacity: 0.4,
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
          if (el.renderType === 'wave') {
            // Heartbeat ECG Wave Path
            // Build polyline points string
            const pointsString = el.points.map((p: any) => `${p.x},${p.y}`).join(' ');
            const strokeWidth = (el.id === 'wave-1' ? 7.5 : 4.0) * el.scale;

            return (
              <g key={el.id} opacity={el.opacity}>
                {/* Underlay glow */}
                <polyline
                  fill="none"
                  stroke={el.stroke}
                  strokeWidth={strokeWidth * 2.8}
                  points={pointsString}
                  opacity={0.15}
                  style={{ filter: 'blur(4px)' }}
                />
                
                {/* Main sharp line */}
                <polyline
                  fill="none"
                  stroke={el.stroke}
                  strokeWidth={strokeWidth}
                  points={pointsString}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* White core overlay for the prominent center wave */}
                {el.id === 'wave-1' && (
                  <polyline
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={strokeWidth * 0.28}
                    points={pointsString}
                    opacity={0.95}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </g>
            );
          }

          if (el.renderType === 'cell') {
            if (el.isRedCell) {
              // Red Blood Cell (biconcave disc shape using outer-ring + inner-shadow)
              return (
                <g key={el.id} opacity={el.opacity}>
                  {/* Outer glow ring */}
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={el.size}
                    fill={colors.crimson}
                    opacity={0.16}
                    style={{ filter: 'blur(3px)' }}
                  />
                  {/* Main disc body */}
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={el.size * 0.85}
                    fill={colors.shadow}
                    stroke={colors.crimson}
                    strokeWidth={el.size * 0.25}
                  />
                  {/* Biconcave inner dip circle */}
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={el.size * 0.3}
                    fill={colors.bg}
                    opacity={0.65}
                  />
                </g>
              );
            } else {
              // Oxygen / Energy Spark Molecule
              return (
                <g key={el.id} opacity={el.opacity}>
                  {/* Soft aura */}
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={el.size * 2.5}
                    fill={colors.pink}
                    opacity={0.15}
                    style={{ filter: 'blur(3px)' }}
                  />
                  {/* Glow core */}
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={el.size * 0.9}
                    fill={colors.pink}
                    opacity={0.8}
                  />
                  {/* Center spot */}
                  <circle
                    cx={el.x}
                    cy={el.y}
                    r={el.size * 0.4}
                    fill={colors.white}
                    opacity={0.95}
                  />
                </g>
              );
            }
          }

          return null;
        })}
      </svg>

      {/* Cinematic Clinical Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(8, 2, 4, 0.45) 60%, rgba(8, 2, 4, 0.96) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
