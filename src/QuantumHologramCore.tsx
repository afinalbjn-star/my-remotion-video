import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

// Premium Neon Cyberpunk Sci-Fi Color Palette
const colors = {
  bg: '#010106',
  cyan: '#00f3ff',      // Hologram primary
  magenta: '#ff007f',   // High energy warning/accent
  gold: '#ffd700',      // Stable core / warning secondary
  green: '#39ff14',     // Telemetry readout
  blue: '#0066ff',      // Depth background rings
  white: '#ffffff',     // Extreme core peak highlights
};

export const QuantumHologramCore: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Scale factor to keep 4K UHD elements crisp and perfectly proportioned
  const scaleFactor = height / 2160;

  // Seamless progress 0.0 to 1.0
  const progress = frame / durationInFrames;

  // Perfect 10-second loop time value
  const t = progress * Math.PI * 2;

  // 1. GENERATE STATIC 3D CORE LATTICE NODES
  // Double-helix spherical shell structure of 44 quantum nodes
  const latticeNodes = useMemo(() => {
    const nodes = [];
    // Outer Shell (32 nodes)
    const latitudeRings = 4;
    const nodesPerRing = 8;
    const outerRadius = 260;

    for (let r = 0; r < latitudeRings; r++) {
      const latPct = (r + 0.5) / latitudeRings;
      const phi = Math.acos(2 * latPct - 1); // Polar angle

      for (let n = 0; n < nodesPerRing; n++) {
        const lonPct = n / nodesPerRing;
        const theta = lonPct * Math.PI * 2; // Azimuthal angle

        const x = outerRadius * Math.sin(phi) * Math.cos(theta);
        const y = outerRadius * Math.sin(phi) * Math.sin(theta);
        const z = outerRadius * Math.cos(phi);

        nodes.push({
          id: `out-${r}-${n}`,
          x,
          y,
          z,
          radius: 12,
          color: (r + n) % 3 === 0 ? colors.cyan : (r + n) % 3 === 1 ? colors.magenta : colors.gold,
          isInner: false,
        });
      }
    }

    // Inner Core (12 nodes)
    const innerRadius = 110;
    const innerRings = 3;
    const nodesPerInnerRing = 4;

    for (let r = 0; r < innerRings; r++) {
      const latPct = (r + 0.5) / innerRings;
      const phi = Math.acos(2 * latPct - 1);

      for (let n = 0; n < nodesPerInnerRing; n++) {
        const lonPct = n / nodesPerInnerRing;
        const theta = lonPct * Math.PI * 2;

        const x = innerRadius * Math.sin(phi) * Math.cos(theta);
        const y = innerRadius * Math.sin(phi) * Math.sin(theta);
        const z = innerRadius * Math.cos(phi);

        nodes.push({
          id: `in-${r}-${n}`,
          x,
          y,
          z,
          radius: 8,
          color: colors.white,
          isInner: true,
        });
      }
    }

    return nodes;
  }, []);

  // 2. GENERATE CONNECTING LATTICE THREADS
  // Connect closest points to form a beautiful holographic wireframe mesh
  const latticeThreads = useMemo(() => {
    const threads = [];
    const maxDist = 180; // Distance threshold to connect points

    for (let i = 0; i < latticeNodes.length; i++) {
      for (let j = i + 1; j < latticeNodes.length; j++) {
        const n1 = latticeNodes[i];
        const n2 = latticeNodes[j];

        // Connect nodes if within threshold and of similar group
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dz = n1.z - n2.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDist && (n1.isInner === n2.isInner || dist < 120)) {
          threads.push({
            id: `thread-${i}-${j}`,
            fromIndex: i,
            toIndex: j,
            type: n1.isInner && n2.isInner ? 'inner' : 'outer',
          });
        }
      }
    }
    return threads;
  }, [latticeNodes]);

  // 3. PROJECT 3D CORE NODES TO 2D VIEWPORT WITH PITCH/YAW/ROLL ROTATIONS
  const projectedCore = useMemo(() => {
    // Pitch (X), Yaw (Y), Roll (Z) rotations synced to a perfect loop cycle
    const rotX = t * 1;
    const rotY = t * 2;
    const rotZ = t * 1;

    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    // Dynamic core pulse oscillation
    const pulseScale = 1.0 + Math.sin(t * 4) * 0.06;

    // Transform points
    const points2D = latticeNodes.map((n) => {
      const xRaw = n.x * pulseScale;
      const yRaw = n.y * pulseScale;
      const zRaw = n.z * pulseScale;

      // Rotate around X (pitch)
      const y1 = yRaw * cosX - zRaw * sinX;
      const z1 = yRaw * sinX + zRaw * cosX;

      // Rotate around Y (yaw)
      const x2 = xRaw * cosY - z1 * sinY;
      const z2 = xRaw * sinY + z1 * cosY;

      // Rotate around Z (roll)
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;

      // Camera Perspective Projection
      const fov = 1800;
      const cameraDist = 2200;
      const scale = fov / (fov + z2 + cameraDist);

      const screenX = width / 2 + x3 * scale;
      const screenY = height / 2 + y3 * scale;

      return {
        id: n.id,
        x: screenX,
        y: screenY,
        scale: scale * scaleFactor,
        depth: z2, // For Painter's sorting
        color: n.color,
        radius: n.radius,
        isInner: n.isInner,
      };
    });

    return points2D;
  }, [latticeNodes, t, width, height, scaleFactor]);



  // 3D Projected Threads for Painter's Sorting
  const projectedThreads = useMemo(() => {
    return latticeThreads.map((th) => {
      const n1 = projectedCore[th.fromIndex];
      const n2 = projectedCore[th.toIndex];

      return {
        id: th.id,
        x1: n1.x,
        y1: n1.y,
        x2: n2.x,
        y2: n2.y,
        depth: (n1.depth + n2.depth) / 2, // Average depth
        type: th.type,
        color: th.type === 'inner' ? colors.white : colors.cyan,
      };
    });
  }, [latticeThreads, projectedCore]);

  // Combined sorting for proper Z-buffer depth layout (Nodes & Wireframes interleaved)
  const zBufferDepthItems = useMemo(() => {
    const items = [
      ...projectedCore.map((p) => ({ type: 'node' as const, data: p, depth: p.depth })),
      ...projectedThreads.map((t) => ({ type: 'thread' as const, data: t, depth: t.depth })),
    ];
    // Sort back-to-front
    return items.sort((a, b) => b.depth - a.depth);
  }, [projectedCore, projectedThreads]);

  // 4. MATHEMATICAL 3D SPINNING GYROSCOPIC HUD RINGS
  // Function to calculate SVG Path of a 3D-rotated circle
  const getProjectedCirclePath = (radius: number, pitchDeg: number, yawDeg: number, rollDeg: number) => {
    const points = [];
    const steps = 96;
    const p = (pitchDeg * Math.PI) / 180;
    const y = (yawDeg * Math.PI) / 180;
    const r = (rollDeg * Math.PI) / 180;

    const cosP = Math.cos(p), sinP = Math.sin(p);
    const cosY = Math.cos(y), sinY = Math.sin(y);
    const cosR = Math.cos(r), sinR = Math.sin(r);

    for (let i = 0; i <= steps; i++) {
      const theta = (i * 2 * Math.PI) / steps;
      const x0 = Math.cos(theta) * radius;
      const y0 = Math.sin(theta) * radius;
      const z0 = 0;

      // Pitch (X)
      const y1 = y0 * cosP - z0 * sinP;
      const z1 = y0 * sinP + z0 * cosP;
      // Yaw (Y)
      const x2 = x0 * cosY - z1 * sinY;
      const z2 = x0 * sinY + z1 * cosY;
      // Roll (Z)
      const x3 = x2 * cosR - y1 * sinR;
      const y3 = x2 * sinR + y1 * cosR;

      // Project
      const fov = 1800;
      const cameraDist = 2200;
      const pScale = fov / (fov + z2 + cameraDist);
      const sx = width / 2 + x3 * pScale;
      const sy = height / 2 + y3 * pScale;

      points.push(`${i === 0 ? 'M' : 'L'} ${sx.toFixed(1)} ${sy.toFixed(1)}`);
    }
    return points.join(' ');
  };

  // Helper to find a specific orbiting coordinate on a 3D ring
  const getProjectedPointOnRing = (radius: number, pitchDeg: number, yawDeg: number, rollDeg: number, angleRad: number) => {
    const p = (pitchDeg * Math.PI) / 180;
    const y = (yawDeg * Math.PI) / 180;
    const r = (rollDeg * Math.PI) / 180;

    const cosP = Math.cos(p), sinP = Math.sin(p);
    const cosY = Math.cos(y), sinY = Math.sin(y);
    const cosR = Math.cos(r), sinR = Math.sin(r);

    const x0 = Math.cos(angleRad) * radius;
    const y0 = Math.sin(angleRad) * radius;
    const z0 = 0;

    const y1 = y0 * cosP - z0 * sinP;
    const z1 = y0 * sinP + z0 * cosP;
    const x2 = x0 * cosY - z1 * sinY;
    const z2 = x0 * sinY + z1 * cosY;
    const x3 = x2 * cosR - y1 * sinR;
    const y3 = x2 * sinR + y1 * cosR;

    const fov = 1800;
    const cameraDist = 2200;
    const pScale = fov / (fov + z2 + cameraDist);
    const sx = width / 2 + x3 * pScale;
    const sy = height / 2 + y3 * pScale;

    return { x: sx, y: sy, scale: pScale * scaleFactor };
  };

  // Gyroscope setup (distinct angles rotating at even multiples of 2PI)
  const gyroRings = useMemo(() => {
    const angleOffset = progress * 360;

    return [
      {
        id: 'ring-1',
        radius: 360,
        pitch: 35,
        yaw: angleOffset * 2,
        roll: 10,
        color: colors.cyan,
        dasharray: `8, 12, 160, 12, 8, 12`,
        width: 3,
        glow: true,
      },
      {
        id: 'ring-2',
        radius: 410,
        pitch: -40,
        yaw: -angleOffset,
        roll: 30,
        color: colors.magenta,
        dasharray: `100, 30, 20, 30`,
        width: 2.5,
        glow: false,
      },
      {
        id: 'ring-3',
        radius: 480,
        pitch: 65,
        yaw: angleOffset * 1,
        roll: -angleOffset * 1,
        color: colors.gold,
        dasharray: `3, 8`,
        width: 1.8,
        glow: true,
      },
      {
        id: 'ring-4',
        radius: 540,
        pitch: 0,
        yaw: 0,
        roll: -angleOffset * 0.5,
        color: colors.cyan,
        dasharray: `400, 60, 20, 60`,
        width: 4,
        glow: true,
      },
      {
        id: 'ring-5',
        radius: 610,
        pitch: -75,
        yaw: angleOffset * 1.5,
        roll: 45,
        color: colors.blue,
        dasharray: `50, 150`,
        width: 1.5,
        glow: false,
      },
    ];
  }, [progress]);

  // Orbiting Satellite Nodes on selected HUD rings
  const satellites = useMemo(() => {
    // Node orbits at integer loops
    const orbitAngle1 = t * 4;
    const orbitAngle2 = -t * 2;

    const sat1 = getProjectedPointOnRing(360, 35, progress * 360 * 2, 10, orbitAngle1);
    const sat2 = getProjectedPointOnRing(540, 0, 0, -progress * 360 * 0.5, orbitAngle2);

    return [
      { id: 'sat-1', coords: sat1, color: colors.cyan, size: 14 },
      { id: 'sat-2', coords: sat2, color: colors.magenta, size: 16 },
    ];
  }, [t, progress]);

  // 5. DIAGNOSTIC telemetry variables that cycle seamlessly
  const telemetry = useMemo(() => {
    // Core entropy indices
    const entropyVal = (4.821 + Math.sin(t * 3) * 0.145).toFixed(4);
    const loadVal = Math.floor(82.4 + Math.sin(t * 2) * 5.2);
    const latencyVal = (1.042 + Math.cos(t * 4) * 0.082).toFixed(3);
    const coherenceVal = (0.9994 + Math.sin(t * 1) * 0.0004).toFixed(6);

    return {
      entropy: `ENTROPY_INDEX: ${entropyVal}e-34`,
      load: `CPU_CORE_LOAD: ${loadVal}% // STABLE`,
      latency: `NODE_LATENCY: ${latencyVal} ms`,
      coherence: `Q_COHERENCE: ${coherenceVal}`,
      hash: `BLOCK_ID: 0x${Math.floor(8412999 + Math.sin(t * 5) * 5000).toString(16).toUpperCase()}`,
    };
  }, [frame, t]);

  // Oscilloscope wave paths for bottom-left diagnostic HUD
  const oscWavePath = useMemo(() => {
    const wavePoints = [];
    const waveWidth = 380 * scaleFactor;
    const startX = 140 * scaleFactor;
    const startY = height - 240 * scaleFactor;

    for (let i = 0; i <= 60; i++) {
      const pct = i / 60;
      const x = startX + pct * waveWidth;
      
      // Multi-frequency wave formula looping seamlessly
      const waveVal1 = Math.sin(pct * Math.PI * 8 + t * 4) * 35 * scaleFactor;
      const waveVal2 = Math.cos(pct * Math.PI * 18 - t * 2) * 12 * scaleFactor;
      const windowFactor = Math.sin(pct * Math.PI); // Pin ends to 0
      
      const y = startY + (waveVal1 + waveVal2) * windowFactor;
      wavePoints.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return wavePoints.join(' ');
  }, [t, height, scaleFactor]);

  // 6. CASCADING BINARY STREAMS
  // Beautiful matrix-style scrolling codes down the edges
  const binaryStreams = useMemo(() => {
    const colsCount = 4;
    const streamItems = [];
    const chars = ['0', '1', 'Q', 'X', 'Ø', 'Δ', '1', '0'];

    for (let col = 0; col < colsCount; col++) {
      const isLeft = col < 2;
      const xOffset = isLeft ? 100 + col * 80 : width - 180 - (col - 2) * 80;
      
      // Floating speed multiplier
      const speed = 420 * scaleFactor;
      const totalHeight = height + 400 * scaleFactor;
      
      // Loop vertical offset seamlessly
      const yScroll = (progress * speed * (1 + col * 0.25)) % 600 * scaleFactor;

      const numChars = 32;
      for (let i = 0; i < numChars; i++) {
        const charIndex = Math.floor((i + Math.floor(frame / 6) + col * 5) % chars.length);
        const y = -100 * scaleFactor + i * 55 * scaleFactor + yScroll;
        
        // Wrap coordinates vertically
        const wrappedY = y > height + 100 * scaleFactor ? y - totalHeight : y;

        // Opacity fade based on position
        const opacity = interpolate(wrappedY, [0, height / 2, height], [0.15, 0.75, 0.15], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        streamItems.push({
          key: `bin-${col}-${i}`,
          x: xOffset * scaleFactor,
          y: wrappedY,
          char: chars[charIndex],
          opacity,
          color: col % 2 === 0 ? colors.cyan : colors.magenta,
        });
      }
    }
    return streamItems;
  }, [frame, progress, width, height, scaleFactor]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Share Tech Mono', monospace",
        color: colors.cyan,
      }}
    >
      {/* Import share tech mono font */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Inter:wght@300;400;600;900&display=swap');
        `}
      </style>

      {/* Volumetric Central Holographic Core Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(0, 243, 255, 0.22) 0%, rgba(255, 0, 127, 0.08) 45%, transparent 75%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient Pulsing Tech Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 ${350 * scaleFactor}px rgba(1, 1, 6, 0.98)`,
          opacity: 0.9 + Math.sin(t * 4) * 0.08,
          pointerEvents: 'none',
        }}
      />

      {/* 2D HUD Graphics Grid Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(rgba(0, 243, 255, 0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 243, 255, 0.015) 1px, transparent 1px)`,
          backgroundSize: `${80 * scaleFactor}px ${80 * scaleFactor}px`,
          backgroundPosition: 'center center',
          pointerEvents: 'none',
        }}
      />

      {/* SCI-FI VECTOR CANVAS */}
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
          {/* Intense holographic bloom filter */}
          <filter id="holoGlow">
            <feGaussianBlur stdDeviation={10 * scaleFactor} result="blur1" />
            <feGaussianBlur stdDeviation={4 * scaleFactor} result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. RENDER 3D GYROSCOPIC HUD RINGS */}
        <g style={{ filter: 'url(#holoGlow)' }}>
          {gyroRings.map((ring) => {
            const path = getProjectedCirclePath(ring.radius, ring.pitch, ring.yaw, ring.roll);
            return (
              <path
                key={ring.id}
                d={path}
                fill="none"
                stroke={ring.color}
                strokeWidth={ring.width * scaleFactor}
                strokeDasharray={ring.dasharray}
                opacity={ring.glow ? 0.75 : 0.35}
              />
            );
          })}
        </g>

        {/* 2. RENDER Z-SORTED 3D QUANTUM CORE ITEMS (Painter's Algorithm) */}
        <g style={{ filter: 'url(#holoGlow)' }}>
          {zBufferDepthItems.map((item) => {
            if (item.type === 'thread') {
              const th = item.data as typeof projectedThreads[0];
              // Deeper wires fade out dramatically
              const opacity = interpolate(th.depth, [-280, 280], [0.9, 0.18], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              return (
                <line
                  key={th.id}
                  x1={th.x1}
                  y1={th.y1}
                  x2={th.x2}
                  y2={th.y2}
                  stroke={th.color}
                  strokeWidth={(th.type === 'inner' ? 2 : 4) * scaleFactor}
                  opacity={opacity}
                />
              );
            } else {
              const pt = item.data as typeof projectedCore[0];
              const opacity = interpolate(pt.depth, [-280, 280], [0.95, 0.25], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });

              // Active glowing node bubbles
              return (
                <g key={pt.id} opacity={opacity}>
                  {/* Outer glowing halo */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.radius * 2.2 * pt.scale}
                    fill={pt.color}
                    opacity={0.25}
                  />
                  {/* Core solid sphere */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.radius * pt.scale}
                    fill={pt.isInner ? colors.white : pt.color}
                  />
                </g>
              );
            }
          })}
        </g>

        {/* 3. ORBITING RING SATELLITES */}
        <g style={{ filter: 'url(#holoGlow)' }}>
          {satellites.map((sat) => (
            <g key={sat.id} transform={`translate(${sat.coords.x}, ${sat.coords.y})`}>
              <circle
                r={sat.size * sat.coords.scale}
                fill="none"
                stroke={sat.color}
                strokeWidth={2 * scaleFactor}
              />
              <circle
                r={sat.size * 0.45 * sat.coords.scale}
                fill={sat.color}
              />
              {/* Outer crosshairs */}
              <line
                x1={-sat.size * 1.5 * sat.coords.scale}
                y1={0}
                x2={sat.size * 1.5 * sat.coords.scale}
                y2={0}
                stroke={sat.color}
                strokeWidth={1.5 * scaleFactor}
              />
              <line
                x1={0}
                y1={-sat.size * 1.5 * sat.coords.scale}
                x2={0}
                y2={sat.size * 1.5 * sat.coords.scale}
                stroke={sat.color}
                strokeWidth={1.5 * scaleFactor}
              />
            </g>
          ))}
        </g>

        {/* 4. SCI-FI HUD DECORATIONS & SIDE PANELS */}
        <g>
          {/* Top-Left Telemetry Brackets */}
          <path
            d={`M ${100 * scaleFactor} ${180 * scaleFactor} L ${60 * scaleFactor} ${180 * scaleFactor} L ${60 * scaleFactor} ${80 * scaleFactor} L ${180 * scaleFactor} ${80 * scaleFactor} L ${180 * scaleFactor} ${100 * scaleFactor}`}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={3 * scaleFactor}
          />
          <text
            x={90 * scaleFactor}
            y={135 * scaleFactor}
            fill={colors.white}
            fontSize={36 * scaleFactor}
            fontWeight="bold"
            letterSpacing={3 * scaleFactor}
          >
            QUANTUM COHERENCE CORE
          </text>
          <text
            x={90 * scaleFactor}
            y={170 * scaleFactor}
            fill={colors.cyan}
            fontSize={20 * scaleFactor}
            opacity="0.8"
          >
            SYS_STATUS: ACTIVE // QUANTUM_LATTICE_STABLE
          </text>

          {/* Top-Right Diagnostic Metrics */}
          <path
            d={`M ${width - 180 * scaleFactor} ${80 * scaleFactor} L ${width - 60 * scaleFactor} ${80 * scaleFactor} L ${width - 60 * scaleFactor} ${180 * scaleFactor} L ${width - 100 * scaleFactor} ${180 * scaleFactor}`}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={3 * scaleFactor}
          />
          <text
            x={width - 550 * scaleFactor}
            y={125 * scaleFactor}
            fill={colors.cyan}
            fontSize={20 * scaleFactor}
            textAnchor="end"
          >
            {telemetry.entropy}
          </text>
          <text
            x={width - 550 * scaleFactor}
            y={160 * scaleFactor}
            fill={colors.magenta}
            fontSize={20 * scaleFactor}
            textAnchor="end"
          >
            {telemetry.load}
          </text>
          <text
            x={width - 90 * scaleFactor}
            y={125 * scaleFactor}
            fill={colors.gold}
            fontSize={20 * scaleFactor}
            textAnchor="end"
          >
            {telemetry.latency}
          </text>
          <text
            x={width - 90 * scaleFactor}
            y={160 * scaleFactor}
            fill={colors.white}
            fontSize={20 * scaleFactor}
            textAnchor="end"
          >
            {telemetry.coherence}
          </text>

          {/* Bottom-Left Cyber Wave Diagnostics */}
          <path
            d={`M ${180 * scaleFactor} ${height - 80 * scaleFactor} L ${60 * scaleFactor} ${height - 80 * scaleFactor} L ${60 * scaleFactor} ${height - 180 * scaleFactor} L ${100 * scaleFactor} ${height - 180 * scaleFactor}`}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={3 * scaleFactor}
          />
          <text
            x={90 * scaleFactor}
            y={height - 140 * scaleFactor}
            fill={colors.cyan}
            fontSize={22 * scaleFactor}
            fontWeight="bold"
          >
            WAVEFORM INTERFERENCE
          </text>
          <path
            d={oscWavePath}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={4 * scaleFactor}
            style={{ filter: 'url(#holoGlow)' }}
          />

          {/* Bottom-Right Core Diagnostics Matrix */}
          <path
            d={`M ${width - 100 * scaleFactor} ${height - 180 * scaleFactor} L ${width - 60 * scaleFactor} ${height - 180 * scaleFactor} L ${width - 60 * scaleFactor} ${height - 80 * scaleFactor} L ${width - 180 * scaleFactor} ${height - 80 * scaleFactor}`}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={3 * scaleFactor}
          />
          <text
            x={width - 420 * scaleFactor}
            y={height - 135 * scaleFactor}
            fill={colors.gold}
            fontSize={22 * scaleFactor}
            fontWeight="bold"
            textAnchor="end"
          >
            TELEMETRY MATRIX
          </text>
          <text
            x={width - 420 * scaleFactor}
            y={height - 100 * scaleFactor}
            fill={colors.cyan}
            fontSize={20 * scaleFactor}
            textAnchor="end"
          >
            {telemetry.hash}
          </text>

          {/* Hexagonal corner tech decals */}
          <polygon
            points={`${80 * scaleFactor},${90 * scaleFactor} ${100 * scaleFactor},${110 * scaleFactor} ${80 * scaleFactor},${130 * scaleFactor}`}
            fill={colors.magenta}
          />
          <polygon
            points={`${width - 80 * scaleFactor},${90 * scaleFactor} ${width - 100 * scaleFactor},${110 * scaleFactor} ${width - 80 * scaleFactor},${130 * scaleFactor}`}
            fill={colors.gold}
          />
        </g>

        {/* 5. FLOATING BINARY MATRIX TEXT */}
        <g opacity="0.85">
          {binaryStreams.map((b) => (
            <text
              key={b.key}
              x={b.x}
              y={b.y}
              fill={b.color}
              fontSize={24 * scaleFactor}
              fontWeight="bold"
              opacity={b.opacity}
              textAnchor="middle"
            >
              {b.char}
            </text>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
