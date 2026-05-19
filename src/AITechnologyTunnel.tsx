import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  random,
  Easing,
} from 'remotion';

// Cyberpunk Modern Tech / AI Color Palette
const colors = {
  bg: '#020208',
  primary: '#00f0ff',     // Cyber Teal/Cyan
  accent: '#9d00ff',      // Quantum Purple
  critical: '#ff007f',    // Laser Pink
  active: '#39ff14',      // Neon Active Green
  textMuted: 'rgba(0, 240, 255, 0.5)',
  textLight: '#ffffff',
  gridLine: 'rgba(0, 240, 255, 0.03)',
};

export const AITechnologyTunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Scale factor based on UHD/4K height (2160px) to keep proportions crisp
  const scaleFactor = height / 2160;

  // Progress of the current 10-second loop (0 to 1)
  const progress = frame / durationInFrames;

  // 1. Generate Static Coordinates for the Starfield (Data Particles)
  const starfield = useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
      const seed = `star-${i}`;
      return {
        id: i,
        angle: random(`${seed}-angle`) * Math.PI * 2,
        speed: 0.005 + random(`${seed}-speed`) * 0.015,
        offset: random(`${seed}-offset`),
        size: 1.5 + random(`${seed}-size`) * 3.5,
        color:
          i % 4 === 0
            ? colors.primary
            : i % 4 === 1
            ? colors.accent
            : i % 4 === 2
            ? colors.critical
            : colors.active,
      };
    });
  }, []);

  // 2. Generate Static Nodes for the Neural Connection Ring Web
  const webNodes = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i * 2 * Math.PI) / 12;
      return {
        id: i,
        angle,
        // Small radial perturbation to make it look organic
        rOffset: (random(`node-rad-${i}`) - 0.5) * 40,
      };
    });
  }, []);

  // 3. Define 20 Concentric Rings distributed across Z-depth
  const numRings = 20;

  // 4. Generate dynamic HUD logs and values
  const dynamicValues = useMemo(() => {
    return Array.from({ length: 10 }).map((_, idx) => {
      // Create changing hexadecimal identifiers
      const changeSeed = Math.floor(frame / 6 + idx * 7).toString();
      const valHex = Math.floor(random(changeSeed) * 0xffffff)
        .toString(16)
        .toUpperCase()
        .padStart(6, '0');
      return `0x${valHex}`;
    });
  }, [frame]);

  // Wave oscilloscope data
  const numBars = 64;
  const bars = Array.from({ length: numBars });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Share Tech Mono', 'Courier New', monospace",
        color: colors.primary,
      }}
    >
      {/* Google Fonts Import */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Outfit:wght@300;400;700;900&display=swap');
          
          .glow-effect {
            filter: drop-shadow(0 0 15px rgba(0, 240, 255, 0.6));
          }
          .glow-accent {
            filter: drop-shadow(0 0 20px rgba(157, 0, 255, 0.7));
          }
          .glow-critical {
            filter: drop-shadow(0 0 15px rgba(255, 0, 127, 0.6));
          }
        `}
      </style>

      {/* Background Matrix Grid */}
      <div
        style={{
          position: 'absolute',
          inset: -200,
          backgroundImage: `
            linear-gradient(${colors.gridLine} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: `${160 * scaleFactor}px ${160 * scaleFactor}px`,
          transform: `perspective(1000px) rotateX(60deg) translateY(${(progress * 320 * scaleFactor) % (160 * scaleFactor)}px)`,
          maskImage: 'radial-gradient(ellipse at center, black, transparent 70%)',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      />

      {/* 3D Starfield / Data Particles */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', pointerEvents: 'none' }}
      >
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {starfield.map((star) => {
            // Z depth animates from 1.0 (far away) down to 0.0 (past camera)
            const z = (1.0 - ((progress + star.offset) % 1.0));
            
            // Perspective project
            const zMin = 0.002;
            const scale = 1 / Math.max(zMin, z);
            
            // Particles expand outwards as Z decreases
            const dist = 350 * scale * scaleFactor;
            const x = Math.cos(star.angle) * dist;
            const y = Math.sin(star.angle) * dist;

            // Fading out in the very center and when zooming past screen boundaries
            const opacity = Math.sin(z * Math.PI) * (z < 0.25 ? z / 0.25 : 1);
            const r = star.size * scale * 0.7 * scaleFactor;

            // Draw data trail
            const trailLength = 0.03; // length in Z-space
            const trailZ = Math.min(1.0, z + trailLength);
            const trailScale = 1 / Math.max(zMin, trailZ);
            const trailDist = 350 * trailScale * scaleFactor;
            const tx = Math.cos(star.angle) * trailDist;
            const ty = Math.sin(star.angle) * trailDist;

            return (
              <g key={star.id}>
                {/* Motion trail line */}
                <line
                  x1={tx}
                  y1={ty}
                  x2={x}
                  y2={y}
                  stroke={star.color}
                  strokeWidth={r * 0.4}
                  opacity={opacity * 0.3}
                />
                {/* Glowing data head */}
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill={star.color}
                  opacity={opacity}
                  className="glow-effect"
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Main 3D Tunnel Geometry Layer */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', pointerEvents: 'none' }}
      >
        <defs>
          <filter id="hudGlow">
            <feGaussianBlur stdDeviation={8 * scaleFactor} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {Array.from({ length: numRings }).map((_, i) => {
            const offset = i / numRings;
            // Seamless looping Z depth (1.0 to 0.0)
            const z = (1.0 - ((progress + offset) % 1.0));
            const scale = 1 / Math.max(0.001, z);

            // Hide layers that are too close or too far to prevent popping
            if (scale > 20 || scale < 0.2) return null;

            // Opacity curve: rises smoothly and falls gracefully at the extreme boundaries
            const opacity = Math.sin(z * Math.PI);

            // Twist rotation - alternate direction of every other layer
            const direction = i % 2 === 0 ? 1 : -1;
            const twistAmount = 45; // rotation shift per depth layer
            const rotSpeed = progress * 360 * 0.5 * direction;
            const ringRotation = rotSpeed + i * twistAmount * direction;

            // Alternate between different geometric tunnel concepts
            const ringType = i % 5;

            // Dynamic scale-adjusted radius
            const baseRad = 280 * scaleFactor;
            const radius = baseRad * scale;

            if (ringType === 0) {
              // ================= RING 0: HEXAGONAL DATA CORES =================
              const hexPoints: string[] = [];
              for (let k = 0; k < 6; k++) {
                const angle = (k * Math.PI) / 3;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                hexPoints.push(`${px},${py}`);
              }
              const pointsStr = hexPoints.join(' ');

              return (
                <g
                  key={i}
                  transform={`rotate(${ringRotation})`}
                  opacity={opacity}
                  filter="url(#hudGlow)"
                >
                  {/* Outer hex outline */}
                  <polygon
                    points={pointsStr}
                    stroke={colors.primary}
                    strokeWidth={3 * scaleFactor}
                    fill="none"
                    strokeDasharray={`${radius * 0.15} ${radius * 0.08}`}
                  />
                  {/* Inner secondary hex outline */}
                  <polygon
                    points={pointsStr}
                    stroke={colors.accent}
                    strokeWidth={1.5 * scaleFactor}
                    fill="none"
                    transform={`scale(0.85)`}
                    opacity={0.6}
                  />
                  {/* Vertex nodes */}
                  {Array.from({ length: 6 }).map((_, k) => {
                    const angle = (k * Math.PI) / 3;
                    const px = Math.cos(angle) * radius;
                    const py = Math.sin(angle) * radius;
                    return (
                      <g key={k} transform={`translate(${px}, ${py})`}>
                        <circle r={7 * scaleFactor} fill={colors.textLight} />
                        <circle
                          r={14 * scaleFactor}
                          fill="none"
                          stroke={colors.primary}
                          strokeWidth={1.5 * scaleFactor}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            } else if (ringType === 1) {
              // ================= RING 1: ROTATING BINARY STRING =================
              const numChars = 18;
              const binRadius = radius * 0.95;

              return (
                <g
                  key={i}
                  transform={`rotate(${ringRotation})`}
                  opacity={opacity}
                >
                  <circle
                    r={binRadius}
                    stroke="rgba(0, 240, 255, 0.1)"
                    strokeWidth={1 * scaleFactor}
                    fill="none"
                  />
                  {Array.from({ length: numChars }).map((_, k) => {
                    const charAngle = (k * 2 * Math.PI) / numChars;
                    const px = Math.cos(charAngle) * binRadius;
                    const py = Math.sin(charAngle) * binRadius;
                    // Deterministic flickering binary value
                    const textSeed = `bin-${i}-${k}-${Math.floor(frame / 12)}`;
                    const binaryChar = random(textSeed) > 0.5 ? '1' : '0';
                    const activeColor =
                      random(`${textSeed}-color`) > 0.75
                        ? colors.critical
                        : colors.primary;

                    return (
                      <text
                        key={k}
                        x={px}
                        y={py}
                        fill={activeColor}
                        fontSize={Math.max(12, 28 * scale * scaleFactor)}
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          textShadow: `0 0 10px ${activeColor}`,
                          fontFamily: "'Share Tech Mono', monospace",
                        }}
                        transform={`rotate(${(charAngle * 180) / Math.PI + 90}, ${px}, ${py})`}
                      >
                        {binaryChar}
                      </text>
                    );
                  })}
                </g>
              );
            } else if (ringType === 2) {
              // ================= RING 2: CIRCUIT BOARD TRACES =================
              const numTraces = 8;
              const rStart = radius * 0.8;
              const rEnd = radius * 1.1;

              return (
                <g
                  key={i}
                  transform={`rotate(${ringRotation})`}
                  opacity={opacity * 0.8}
                >
                  {/* Concentric helper circle */}
                  <circle
                    r={rStart}
                    stroke={colors.accent}
                    strokeWidth={2 * scaleFactor}
                    strokeDasharray="5 20"
                    fill="none"
                  />
                  {Array.from({ length: numTraces }).map((_, k) => {
                    const traceAngle = (k * 2 * Math.PI) / numTraces;
                    const x1 = Math.cos(traceAngle) * rStart;
                    const y1 = Math.sin(traceAngle) * rStart;
                    const x2 = Math.cos(traceAngle) * rEnd;
                    const y2 = Math.sin(traceAngle) * rEnd;

                    // Branching L-bend coordinate
                    const bendAngle = traceAngle + 0.15 * direction;
                    const rOuter = rEnd + 50 * scale * scaleFactor;
                    const x3 = Math.cos(bendAngle) * rOuter;
                    const y3 = Math.sin(bendAngle) * rOuter;

                    // Signal current pulse traveling along the circuit trace
                    const pulseProgress = (progress * 5 + i * 0.3) % 1.0;
                    let pulseX = x1;
                    let pulseY = y1;

                    if (pulseProgress < 0.4) {
                      // Section 1: Center line
                      const factor = pulseProgress / 0.4;
                      pulseX = x1 + (x2 - x1) * factor;
                      pulseY = y1 + (y2 - y1) * factor;
                    } else {
                      // Section 2: Bent line
                      const factor = (pulseProgress - 0.4) / 0.6;
                      pulseX = x2 + (x3 - x2) * factor;
                      pulseY = y2 + (y3 - y2) * factor;
                    }

                    return (
                      <g key={k}>
                        {/* Copper trace path */}
                        <path
                          d={`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`}
                          stroke={colors.accent}
                          strokeWidth={2 * scaleFactor}
                          fill="none"
                          opacity={0.7}
                        />
                        {/* Interactive signal pulse */}
                        <circle
                          cx={pulseX}
                          cy={pulseY}
                          r={5 * scaleFactor}
                          fill={colors.active}
                          className="glow-effect"
                        />
                        {/* Endpoint component pad */}
                        <circle
                          cx={x3}
                          cy={y3}
                          r={4 * scaleFactor}
                          fill="none"
                          stroke={colors.accent}
                          strokeWidth={2 * scaleFactor}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            } else if (ringType === 3) {
              // ================= RING 3: NEURAL WEB NETWORK =================
              return (
                <g
                  key={i}
                  transform={`rotate(${ringRotation})`}
                  opacity={opacity}
                >
                  {/* Draw connection lines between nodes */}
                  {webNodes.map((n1) => {
                    const r1 = radius + n1.rOffset * scaleFactor * scale * 0.3;
                    const x1 = Math.cos(n1.angle) * r1;
                    const y1 = Math.sin(n1.angle) * r1;

                    // Draw web threads to neighboring 3 nodes
                    return webNodes.slice(n1.id + 1, n1.id + 4).map((n2, nidx) => {
                      const r2 = radius + n2.rOffset * scaleFactor * scale * 0.3;
                      const x2 = Math.cos(n2.angle) * r2;
                      const y2 = Math.sin(n2.angle) * r2;

                      return (
                        <line
                          key={nidx}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={colors.primary}
                          strokeWidth={1.2 * scaleFactor}
                          opacity={0.3}
                        />
                      );
                    });
                  })}

                  {/* Draw neural node intersections */}
                  {webNodes.map((n) => {
                    const rNode = radius + n.rOffset * scaleFactor * scale * 0.3;
                    const x = Math.cos(n.angle) * rNode;
                    const y = Math.sin(n.angle) * rNode;

                    // Alternating size and color of synaptic junctions
                    const nodeColor = n.id % 3 === 0 ? colors.critical : colors.primary;
                    const nodeRadius = (n.id % 2 === 0 ? 6 : 4) * scaleFactor;

                    return (
                      <circle
                        key={n.id}
                        cx={x}
                        cy={y}
                        r={nodeRadius}
                        fill={nodeColor}
                        stroke={colors.textLight}
                        strokeWidth={1 * scaleFactor}
                        className="glow-effect"
                      />
                    );
                  })}
                </g>
              );
            } else {
              // ================= RING 4: TECHNICAL HUD HUD-CALIBRATION =================
              return (
                <g
                  key={i}
                  transform={`rotate(${ringRotation})`}
                  opacity={opacity}
                  filter="url(#hudGlow)"
                >
                  {/* Outer solid perimeter ring */}
                  <circle
                    r={radius * 1.05}
                    stroke={colors.primary}
                    strokeWidth={2 * scaleFactor}
                    strokeDasharray="180 40 10 40"
                    fill="none"
                  />
                  {/* Inner calibration ring */}
                  <circle
                    r={radius * 0.75}
                    stroke={colors.critical}
                    strokeWidth={1 * scaleFactor}
                    strokeDasharray="5 15"
                    fill="none"
                    opacity={0.5}
                  />

                  {/* Short technical tick marks */}
                  {Array.from({ length: 24 }).map((_, tickIdx) => {
                    const tickAngle = (tickIdx * Math.PI) / 12;
                    const rStart = radius * 1.05;
                    const rLength = 15 * scaleFactor * Math.max(0.6, scale * 0.3);
                    const rEnd = rStart + rLength;

                    const x1 = Math.cos(tickAngle) * rStart;
                    const y1 = Math.sin(tickAngle) * rStart;
                    const x2 = Math.cos(tickAngle) * rEnd;
                    const y2 = Math.sin(tickAngle) * rEnd;

                    return (
                      <line
                        key={tickIdx}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={colors.primary}
                        strokeWidth={1.5 * scaleFactor}
                      />
                    );
                  })}

                  {/* Scientific metadata tags */}
                  {scale > 0.8 && scale < 3 && (
                    <text
                      x={0}
                      y={-radius * 1.08}
                      fill={colors.primary}
                      fontSize={Math.max(10, 18 * scale * scaleFactor)}
                      fontWeight="bold"
                      textAnchor="middle"
                      style={{ letterSpacing: 2 * scaleFactor }}
                    >
                      [ GRID_ALIGN_LOCK ]
                    </text>
                  )}
                </g>
              );
            }
          })}
        </g>
      </svg>

      {/* Central Glowing AI core / Neural Eye */}
      <div
        style={{
          position: 'absolute',
          left: width / 2,
          top: height / 2,
          transform: 'translate(-50%, -50%)',
          width: 500 * scaleFactor,
          height: 500 * scaleFactor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Deep ambient volumetric light source */}
        <div
          style={{
            position: 'absolute',
            width: 320 * scaleFactor,
            height: 320 * scaleFactor,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${colors.primary} 0%, rgba(157, 0, 255, 0.4) 50%, transparent 75%)`,
            filter: 'blur(50px)',
            opacity: 0.85 + Math.sin(frame * 0.15) * 0.1, // pulsing volumetric light
          }}
        />

        {/* Pulse expanding shockwaves radiating from core */}
        {[0, 0.33, 0.66].map((waveDelay, index) => {
          const waveProgress = (progress * 2 + waveDelay) % 1.0;
          const waveScale = interpolate(waveProgress, [0, 1], [0.15, 2.3], {
            easing: Easing.bezier(0.1, 0.8, 0.3, 1),
          });
          const waveOpacity = interpolate(waveProgress, [0, 0.7, 1], [0.9, 0.4, 0]);

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                width: 250 * scaleFactor,
                height: 250 * scaleFactor,
                borderRadius: '50%',
                border: `2.5px dashed ${index % 2 === 0 ? colors.primary : colors.accent}`,
                transform: `scale(${waveScale})`,
                opacity: waveOpacity,
                boxShadow: `0 0 20px ${index % 2 === 0 ? colors.primary : colors.accent}`,
              }}
            />
          );
        })}

        {/* Multi-orbit digital shell pathways */}
        <svg
          width={300 * scaleFactor}
          height={300 * scaleFactor}
          style={{ position: 'absolute' }}
        >
          <g transform={`translate(${150 * scaleFactor}, ${150 * scaleFactor})`}>
            {/* Orbit 1 */}
            <ellipse
              cx={0}
              cy={0}
              rx={110 * scaleFactor}
              ry={35 * scaleFactor}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2 * scaleFactor}
              strokeDasharray="40 10 10 10"
              transform={`rotate(${frame * 1.5})`}
            />
            {/* Orbit 2 */}
            <ellipse
              cx={0}
              cy={0}
              rx={125 * scaleFactor}
              ry={45 * scaleFactor}
              fill="none"
              stroke={colors.accent}
              strokeWidth={1.5 * scaleFactor}
              strokeDasharray="60 20"
              transform={`rotate(${-frame * 1.1 - 45})`}
            />
            {/* Orbit 3 (Warning Thread) */}
            <ellipse
              cx={0}
              cy={0}
              rx={140 * scaleFactor}
              ry={25 * scaleFactor}
              fill="none"
              stroke={colors.critical}
              strokeWidth={1.5 * scaleFactor}
              strokeDasharray="20 40 5 10"
              transform={`rotate(${frame * 0.8 + 60})`}
            />
          </g>
        </svg>

        {/* Central Core Eye Sphere */}
        <div
          style={{
            position: 'absolute',
            width: 130 * scaleFactor,
            height: 130 * scaleFactor,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${colors.primary} 30%, #0c005a 75%, #020208 100%)`,
            boxShadow: `0 0 40px 10px rgba(0, 240, 255, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.5)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Internal Geometric Core Grid */}
          <div
            style={{
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              border: `2px solid ${colors.textLight}`,
              opacity: 0.8,
              position: 'relative',
              transform: `rotate(${frame * 3.5}deg)`,
              backgroundImage: `
                linear-gradient(45deg, transparent 45%, ${colors.textLight} 45%, ${colors.textLight} 55%, transparent 55%),
                linear-gradient(-45deg, transparent 45%, ${colors.textLight} 45%, ${colors.textLight} 55%, transparent 55%)
              `,
            }}
          />
        </div>
      </div>

      {/* Cinematic Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 ${400 * scaleFactor}px rgba(0, 0, 0, 0.95), inset 0 0 ${200 * scaleFactor}px rgba(0, 0, 0, 0.8)`,
          pointerEvents: 'none',
          zIndex: 90,
        }}
      />

      {/* ========================================================================= */}
      {/*                    PROFESSIONAL TELEMETRY HUD OVERLAYS                    */}
      {/* ========================================================================= */}

      {/* HUD Telemetry Canvas Layer (Grid guides and UI highlights) */}
      <svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      >
        {/* Center alignment reticle / Target indicator */}
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          <circle
            r={280 * scaleFactor}
            stroke="rgba(0, 240, 255, 0.15)"
            strokeWidth={1 * scaleFactor}
            fill="none"
          />
          <line
            x1={-30 * scaleFactor}
            y1={0}
            x2={-15 * scaleFactor}
            y2={0}
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />
          <line
            x1={15 * scaleFactor}
            y1={0}
            x2={30 * scaleFactor}
            y2={0}
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />
          <line
            x1={0}
            y1={-30 * scaleFactor}
            x2={0}
            y2={-15 * scaleFactor}
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />
          <line
            x1={0}
            y1={15 * scaleFactor}
            x2={0}
            y2={30 * scaleFactor}
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />

          {/* Reticle Brackets */}
          <path
            d={`M ${-80 * scaleFactor} ${-50 * scaleFactor} L ${-80 * scaleFactor} ${-80 * scaleFactor} L ${-50 * scaleFactor} ${-80 * scaleFactor}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />
          <path
            d={`M ${80 * scaleFactor} ${-50 * scaleFactor} L ${80 * scaleFactor} ${-80 * scaleFactor} L ${50 * scaleFactor} ${-80 * scaleFactor}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />
          <path
            d={`M ${-80 * scaleFactor} ${50 * scaleFactor} L ${-80 * scaleFactor} ${80 * scaleFactor} L ${-50 * scaleFactor} ${80 * scaleFactor}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />
          <path
            d={`M ${80 * scaleFactor} ${50 * scaleFactor} L ${80 * scaleFactor} ${80 * scaleFactor} L ${50 * scaleFactor} ${80 * scaleFactor}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2 * scaleFactor}
          />
        </g>

        {/* 1. HUD Tech Corners */}
        {/* Top-Left Corner */}
        <g transform={`translate(${100 * scaleFactor}, ${100 * scaleFactor})`}>
          <path
            d="M 0 60 L 0 0 L 60 0"
            fill="none"
            stroke={colors.primary}
            strokeWidth={4 * scaleFactor}
          />
          <rect
            x={10 * scaleFactor}
            y={10 * scaleFactor}
            width={12 * scaleFactor}
            height={12 * scaleFactor}
            fill={colors.accent}
          />
          <line
            x1={0}
            y1={80 * scaleFactor}
            x2={0}
            y2={120 * scaleFactor}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
          <line
            x1={80 * scaleFactor}
            y1={0}
            x2={120 * scaleFactor}
            y2={0}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
        </g>

        {/* Top-Right Corner */}
        <g transform={`translate(${width - 100 * scaleFactor}, ${100 * scaleFactor})`}>
          <path
            d="M 0 60 L 0 0 L -60 0"
            fill="none"
            stroke={colors.primary}
            strokeWidth={4 * scaleFactor}
          />
          <rect
            x={-22 * scaleFactor}
            y={10 * scaleFactor}
            width={12 * scaleFactor}
            height={12 * scaleFactor}
            fill={colors.critical}
          />
          <line
            x1={0}
            y1={80 * scaleFactor}
            x2={0}
            y2={120 * scaleFactor}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
          <line
            x1={-80 * scaleFactor}
            y1={0}
            x2={-120 * scaleFactor}
            y2={0}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
        </g>

        {/* Bottom-Left Corner */}
        <g transform={`translate(${100 * scaleFactor}, ${height - 100 * scaleFactor})`}>
          <path
            d="M 0 -60 L 0 0 L 60 0"
            fill="none"
            stroke={colors.primary}
            strokeWidth={4 * scaleFactor}
          />
          <rect
            x={10 * scaleFactor}
            y={-22 * scaleFactor}
            width={12 * scaleFactor}
            height={12 * scaleFactor}
            fill={colors.active}
          />
          <line
            x1={0}
            y1={-80 * scaleFactor}
            x2={0}
            y2={-120 * scaleFactor}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
          <line
            x1={80 * scaleFactor}
            y1={0}
            x2={120 * scaleFactor}
            y2={0}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
        </g>

        {/* Bottom-Right Corner */}
        <g transform={`translate(${width - 100 * scaleFactor}, ${height - 100 * scaleFactor})`}>
          <path
            d="M 0 -60 L 0 0 L -60 0"
            fill="none"
            stroke={colors.primary}
            strokeWidth={4 * scaleFactor}
          />
          <rect
            x={-22 * scaleFactor}
            y={-22 * scaleFactor}
            width={12 * scaleFactor}
            height={12 * scaleFactor}
            fill={colors.primary}
          />
          <line
            x1={0}
            y1={-80 * scaleFactor}
            x2={0}
            y2={-120 * scaleFactor}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
          <line
            x1={-80 * scaleFactor}
            y1={0}
            x2={-120 * scaleFactor}
            y2={0}
            stroke={colors.textMuted}
            strokeWidth={1.5 * scaleFactor}
            strokeDasharray="4 4"
          />
        </g>
      </svg>

      {/* 2. Top-Left Tech Bar & Real-time Diagnostic Panel */}
      <div
        style={{
          position: 'absolute',
          top: 120 * scaleFactor,
          left: 120 * scaleFactor,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 6 * scaleFactor,
          fontSize: 20 * scaleFactor,
          letterSpacing: 2 * scaleFactor,
        }}
      >
        <div style={{ color: colors.textLight, fontWeight: 'bold' }}>
          SYSTEM_OPERATIONAL_MATRIX
        </div>
        <div style={{ color: colors.primary, fontSize: 16 * scaleFactor }}>
          LATENCY_CORE: {(1.12 + Math.sin(frame * 0.08) * 0.05).toFixed(4)} ms
        </div>
        <div style={{ color: colors.accent, fontSize: 16 * scaleFactor }}>
          THREAD_SECTOR: {dynamicValues[0]} // {dynamicValues[1]}
        </div>
        <div style={{ color: colors.active, fontSize: 14 * scaleFactor, display: 'flex', alignItems: 'center', gap: 10 * scaleFactor }}>
          <span style={{ display: 'inline-block', width: 10 * scaleFactor, height: 10 * scaleFactor, backgroundColor: colors.active, borderRadius: '50%' }}></span>
          COGNITIVE_CORE: STATUS_OK
        </div>
        
        {/* Rolling AI logs terminal style */}
        <div
          style={{
            marginTop: 20 * scaleFactor,
            padding: 10 * scaleFactor,
            backgroundColor: 'rgba(0, 240, 255, 0.04)',
            borderLeft: `3px solid ${colors.primary}`,
            fontSize: 14 * scaleFactor,
            width: 360 * scaleFactor,
            display: 'flex',
            flexDirection: 'column',
            gap: 4 * scaleFactor,
          }}
        >
          <div>&gt; INITIATING_EPOCH_LOCK...DONE</div>
          <div>&gt; SYNC_GRID_VECTOR: {dynamicValues[2]}</div>
          <div>&gt; MULTI_CHANNEL_THREAD: ACTIVE</div>
          <div style={{ color: colors.critical }}>&gt; WARNING: SYNAPSE_TEMP_RISE: 42.4C</div>
        </div>
      </div>

      {/* 3. Top-Right Timecode & Scientific Meta Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 120 * scaleFactor,
          right: 120 * scaleFactor,
          zIndex: 100,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          gap: 8 * scaleFactor,
        }}
      >
        {/* Master Timecode / Resolution Tag */}
        <div style={{ fontSize: 56 * scaleFactor, fontWeight: 900, color: colors.textLight, lineHeight: 1 }}>
          00:{Math.floor(frame / 60).toString().padStart(2, '0')}:{(frame % 60).toString().padStart(2, '0')}
        </div>
        <div style={{ fontSize: 18 * scaleFactor, letterSpacing: 4 * scaleFactor, color: colors.primary }}>
          RESOLUTION: 3840 x 2160 [4K_UHD]
        </div>
        <div style={{ fontSize: 16 * scaleFactor, color: colors.textMuted }}>
          FPS: 60.0 // RENDER_COMP_ID: AIT_TUNNEL_4K
        </div>
        
        {/* Dynamic Matrix indicator grids */}
        <div
          style={{
            display: 'flex',
            gap: 8 * scaleFactor,
            justifyContent: 'flex-end',
            marginTop: 15 * scaleFactor,
          }}
        >
          {Array.from({ length: 8 }).map((_, bIdx) => {
            const isActive = random(`bar-hud-${bIdx}-${Math.floor(frame / 8)}`) > 0.4;
            return (
              <div
                key={bIdx}
                style={{
                  width: 18 * scaleFactor,
                  height: 18 * scaleFactor,
                  border: `1.5px solid ${colors.primary}`,
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  boxShadow: isActive ? `0 0 10px ${colors.primary}` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Bottom-Left Active Status Panels */}
      <div
        style={{
          position: 'absolute',
          bottom: 120 * scaleFactor,
          left: 120 * scaleFactor,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 15 * scaleFactor,
          width: 380 * scaleFactor,
        }}
      >
        {/* Parameter: SYSTEM_LOAD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 * scaleFactor }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 * scaleFactor }}>
            <span style={{ color: colors.textLight }}>SYSTEM_LOAD</span>
            <span style={{ color: colors.primary, fontWeight: 'bold' }}>88.4%</span>
          </div>
          <div style={{ height: 6 * scaleFactor, width: '100%', backgroundColor: 'rgba(0, 240, 255, 0.1)', position: 'relative' }}>
            <div style={{ height: '100%', width: '88.4%', backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.primary}` }}></div>
          </div>
        </div>

        {/* Parameter: SYNC_ACCURACY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 * scaleFactor }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 * scaleFactor }}>
            <span style={{ color: colors.textLight }}>SYNC_ACCURACY</span>
            <span style={{ color: colors.active, fontWeight: 'bold' }}>99.98%</span>
          </div>
          <div style={{ height: 6 * scaleFactor, width: '100%', backgroundColor: 'rgba(57, 255, 20, 0.1)', position: 'relative' }}>
            <div style={{ height: '100%', width: '99.98%', backgroundColor: colors.active, boxShadow: `0 0 8px ${colors.active}` }}></div>
          </div>
        </div>

        {/* Parameter: NEURAL_BANDWIDTH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 * scaleFactor }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 * scaleFactor }}>
            <span style={{ color: colors.textLight }}>NEURAL_BANDWIDTH</span>
            <span style={{ color: colors.critical, fontWeight: 'bold' }}>67.2 GB/s</span>
          </div>
          <div style={{ height: 6 * scaleFactor, width: '100%', backgroundColor: 'rgba(255, 0, 127, 0.1)', position: 'relative' }}>
            <div style={{ height: '100%', width: '67.2%', backgroundColor: colors.critical, boxShadow: `0 0 8px ${colors.critical}` }}></div>
          </div>
        </div>
      </div>

      {/* 5. Bottom-Right Security & Active Systems readouts */}
      <div
        style={{
          position: 'absolute',
          bottom: 120 * scaleFactor,
          right: 120 * scaleFactor,
          zIndex: 100,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          gap: 6 * scaleFactor,
        }}
      >
        <div style={{ fontSize: 24 * scaleFactor, fontWeight: 'bold', letterSpacing: 6 * scaleFactor, color: colors.textLight }}>
          QUANTUM_CORE_ONLINE
        </div>
        <div style={{ fontSize: 16 * scaleFactor, color: colors.textMuted }}>
          SECURE_AI_SHIELD: COGNITIVE_V.9.42
        </div>
        <div style={{ fontSize: 14 * scaleFactor, color: colors.active, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 * scaleFactor }}>
          SECURE_LINK: ENCRYPTED_TLS_1.3
          <span style={{ width: 8 * scaleFactor, height: 8 * scaleFactor, backgroundColor: colors.active, display: 'inline-block' }}></span>
        </div>
      </div>

      {/* 6. Dynamic Wave Oscilloscope (Bottom center border) */}
      <div
        style={{
          position: 'absolute',
          bottom: 25 * scaleFactor,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800 * scaleFactor,
          height: 80 * scaleFactor,
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: `0 ${10 * scaleFactor}px`,
          borderBottom: `2px solid rgba(0, 240, 255, 0.3)`,
          pointerEvents: 'none',
        }}
      >
        {bars.map((_, barIdx) => {
          // Complex sine wave modulated by frame to look like authentic active diagnostics
          const waveVal1 = Math.sin(frame * 0.15 + barIdx * 0.2);
          const waveVal2 = Math.cos(frame * 0.08 - barIdx * 0.05);
          const noiseFactor = random(`noise-osc-${barIdx}-${Math.floor(frame / 4)}`) * 0.3;

          const rawHeight = interpolate(
            waveVal1 * waveVal2 + noiseFactor,
            [-1.3, 1.3],
            [6, 74]
          );

          const barHeight = rawHeight * scaleFactor;

          // Color gradient logic: items closer to top turn red/purple
          const barColor =
            barHeight > 55 * scaleFactor
              ? colors.critical
              : barHeight > 35 * scaleFactor
              ? colors.accent
              : colors.primary;

          return (
            <div
              key={barIdx}
              style={{
                width: 8 * scaleFactor,
                height: barHeight,
                backgroundColor: barColor,
                transition: 'height 0.05s ease-out',
                opacity: 0.8,
                boxShadow: `0 0 6px ${barColor}`,
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
