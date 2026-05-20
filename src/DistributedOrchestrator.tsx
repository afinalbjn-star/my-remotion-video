import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';

// Premium Slate Obsidian Dashboard Color Palette
const colors = {
  bg: '#05070f',           // Obsidian Void
  emerald: '#10b981',      // Core Database / Healthy
  cyan: '#06b6d4',         // Caching Tier / Active Data
  amber: '#f59e0b',        // API Gateway / Network Routing
  slate: '#64748b',        // Telemetry readout / Muted Slate
  slateLight: '#94a3b8',   // Secondary text
  white: '#f8fafc',        // Technical White / Peak Highlight
  purple: '#8b5cf6',       // Secondary routing flow
  blue: '#3b82f6',         // Diagnostic highlight
};

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface NodeItem {
  id: string;
  name: string;
  ip: string;
  tier: 'core' | 'cache' | 'gateway';
  basePos: Point3D;
  color: string;
  details: string;
}

export const DistributedOrchestrator: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Scale factor to keep 4K UHD elements crisp and perfectly proportioned
  const scaleFactor = height / 2160;

  // Seamless progress 0.0 to 1.0
  const progress = frame / durationInFrames;

  // Perfect 10-second loop time value (2 * PI)
  const t = progress * Math.PI * 2;

  // Camera sway (3D Parallax movement) linked to loop
  const cameraYaw = Math.sin(t) * 0.08;
  const cameraPitch = Math.cos(t) * 0.06;

  // 1. GENERATE STATIC 3D SYSTEM NODES
  const systemNodes = useMemo<NodeItem[]>(() => {
    const nodes: NodeItem[] = [];

    // Core Database Tier (Center) - 3 nodes in a small triangle
    const coreRadius = 300;
    const coreLabels = ['DB_CORE_MAIN', 'DB_REPLICA_01', 'DB_REPLICA_02'];
    const coreIps = ['10.0.1.10', '10.0.1.11', '10.0.1.12'];
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      nodes.push({
        id: `core-${i}`,
        name: coreLabels[i],
        ip: coreIps[i],
        tier: 'core',
        basePos: {
          x: Math.cos(angle) * coreRadius,
          y: Math.sin(angle) * coreRadius * 0.4, // squashed on Y to look tilted
          z: 0,
        },
        color: colors.emerald,
        details: i === 0 ? 'ROLE: PRIMARY' : 'ROLE: REPLICA',
      });
    }

    // Caching Tier (Middle) - 4 nodes rotating in a horizontal ring
    const cacheRadius = 680;
    const cacheLabels = ['REDIS_CACHE_01', 'REDIS_CACHE_02', 'REDIS_CACHE_03', 'REDIS_CACHE_04'];
    const cacheIps = ['10.0.2.20', '10.0.2.21', '10.0.2.22', '10.0.2.23'];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4;
      nodes.push({
        id: `cache-${i}`,
        name: cacheLabels[i],
        ip: cacheIps[i],
        tier: 'cache',
        basePos: {
          x: Math.cos(angle) * cacheRadius,
          y: Math.sin(angle) * cacheRadius * 0.35,
          z: 0,
        },
        color: colors.cyan,
        details: 'HIT_RATIO: 94%',
      });
    }

    // Edge Gateway Tier (Outer) - 6 nodes in a wide concentric ring
    const gatewayRadius = 1300;
    const gatewayLabels = [
      'API_GATEWAY_US_E',
      'API_GATEWAY_US_W',
      'API_GATEWAY_EU_W',
      'API_GATEWAY_AP_S',
      'API_GATEWAY_AP_E',
      'API_GATEWAY_SA_E',
    ];
    const gatewayIps = [
      '184.22.1.2',
      '184.22.2.4',
      '195.42.1.8',
      '203.11.3.1',
      '210.55.2.9',
      '200.12.8.5',
    ];
    const gatewayLoads = ['LOAD: 24%', 'LOAD: 38%', 'LOAD: 65%', 'LOAD: 12%', 'LOAD: 45%', 'LOAD: 18%'];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      nodes.push({
        id: `gateway-${i}`,
        name: gatewayLabels[i],
        ip: gatewayIps[i],
        tier: 'gateway',
        basePos: {
          x: Math.cos(angle) * gatewayRadius,
          y: Math.sin(angle) * gatewayRadius * 0.3,
          z: 0,
        },
        color: colors.amber,
        details: gatewayLoads[i],
      });
    }

    return nodes;
  }, []);

  // 2. PROJECT SYSTEM NODES WITH DYNAMIC 3D ROTATION & CAMERA PARALLAX
  const projectedNodes = useMemo(() => {
    // slow rotation over time (1 full circle)
    const baseRotation = t;

    return systemNodes.map((n) => {
      let xRaw = n.basePos.x;
      let yRaw = n.basePos.y;
      let zRaw = n.basePos.z;

      // Apply rotation on Y-axis based on tier
      let rotSpeed = 0;
      if (n.tier === 'cache') {
        rotSpeed = baseRotation;
      } else if (n.tier === 'gateway') {
        rotSpeed = -baseRotation * 0.5; // rotates in opposite direction
      } else {
        rotSpeed = baseRotation * 0.2;  // subtle core breath rotation
      }

      const cosR = Math.cos(rotSpeed);
      const sinR = Math.sin(rotSpeed);

      // Rotate around vertical Y-axis (which is Z in actual 3D layout, but here we tilt X/Y)
      const xRot = xRaw * cosR - yRaw * sinR;
      const yRot = xRaw * sinR + yRaw * cosR;

      // Apply camera yaw & pitch tilt
      const cosC = Math.cos(cameraYaw), sinC = Math.sin(cameraYaw);
      const cosP = Math.cos(cameraPitch), sinP = Math.sin(cameraPitch);

      const xCam = xRot * cosC - zRaw * sinC;
      const zCam1 = xRot * sinC + zRaw * cosC;

      const yCam = yRot * cosP - zCam1 * sinP;
      const zFinal = yRot * sinP + zCam1 * cosP;

      // Camera Perspective Projection
      const fov = 1800;
      const cameraDist = 1400;
      const scale = fov / (fov + zFinal + cameraDist);

      // Squish Y slightly to give a 3D isometric technical grid layout look
      const screenX = width / 2 + xCam * scale;
      const screenY = height / 2 + yCam * scale * 1.3;

      // Stable core pulse breathing animation
      let pulse = 1.0;
      if (n.tier === 'core') {
        pulse = 1.0 + Math.sin(t * 3 + parseFloat(n.id.split('-')[1]) * 1.5) * 0.08;
      } else if (n.tier === 'cache') {
        pulse = 1.0 + Math.sin(t * 2 + parseFloat(n.id.split('-')[1]) * 1.0) * 0.04;
      }

      return {
        ...n,
        x: screenX,
        y: screenY,
        scale: scale * scaleFactor * pulse,
        depth: zFinal,
      };
    });
  }, [systemNodes, t, cameraYaw, cameraPitch, width, height, scaleFactor]);

  // Sort nodes from back to front for proper rendering stack
  const sortedNodes = useMemo(() => {
    return [...projectedNodes].sort((a, b) => b.depth - a.depth);
  }, [projectedNodes]);

  // 3. BUILD BEZIER FLOW PIPES BETWEEN CONCENTRIC TIERS
  // Link each Gateway to its closest Caches, and Caches to the Core DB
  const dataPipes = useMemo(() => {
    const pipes: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      ctrlX: number;
      ctrlY: number;
      color: string;
      packetOffset: number;
    }> = [];

    const gateways = projectedNodes.filter((n) => n.tier === 'gateway');
    const caches = projectedNodes.filter((n) => n.tier === 'cache');
    const cores = projectedNodes.filter((n) => n.tier === 'core');

    // API Gateway to Caching Tier pipes
    gateways.forEach((gw, gIdx) => {
      // Connect each gateway to the 2 nearest Cache nodes
      caches.forEach((ch, cIdx) => {
        if ((gIdx + cIdx) % 2 === 0) {
          const dx = ch.x - gw.x;
          const dy = ch.y - gw.y;
          // Calculate high-quality quadratic control point to form technical curved lines
          const ctrlX = gw.x + dx * 0.5 - dy * 0.15;
          const ctrlY = gw.y + dy * 0.5 + dx * 0.15;

          pipes.push({
            id: `pipe-gw-${gIdx}-ch-${cIdx}`,
            x1: gw.x,
            y1: gw.y,
            x2: ch.x,
            y2: ch.y,
            ctrlX,
            ctrlY,
            color: colors.amber,
            packetOffset: (gIdx * 0.15 + cIdx * 0.25) % 1.0,
          });
        }
      });
    });

    // Cache to Database Core pipes
    caches.forEach((ch, cIdx) => {
      // Connect each cache to all core database replicas
      cores.forEach((cr, rIdx) => {
        const dx = cr.x - ch.x;
        const dy = cr.y - ch.y;
        const ctrlX = ch.x + dx * 0.5 - dy * 0.1;
        const ctrlY = ch.y + dy * 0.5 + dx * 0.1;

        pipes.push({
          id: `pipe-ch-${cIdx}-cr-${rIdx}`,
          x1: ch.x,
          y1: ch.y,
          x2: cr.x,
          y2: cr.y,
          ctrlX,
          ctrlY,
          color: colors.cyan,
          packetOffset: (cIdx * 0.22 + rIdx * 0.35) % 1.0,
        });
      });
    });

    return pipes;
  }, [projectedNodes]);

  // 4. ANIMATE DATA PACKET COORDINATES ALONG BEZIER CURVES USING HERMITE SPLINES
  const animatedPackets = useMemo(() => {
    return dataPipes.map((pipe) => {
      // Perfect Ease-In-Out looping offset
      const localProgress = (progress * 2 + pipe.packetOffset) % 1.0;

      // Hermite Ease-In-Out spline factor: S(t) = 3t^2 - 2t^3
      const ease = 3 * Math.pow(localProgress, 2) - 2 * Math.pow(localProgress, 3);

      // Quadratic Bezier Interpolation: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
      const t1 = 1 - ease;
      const x = Math.pow(t1, 2) * pipe.x1 + 2 * t1 * ease * pipe.ctrlX + Math.pow(ease, 2) * pipe.x2;
      const y = Math.pow(t1, 2) * pipe.y1 + 2 * t1 * ease * pipe.ctrlY + Math.pow(ease, 2) * pipe.y2;

      return {
        id: `packet-${pipe.id}`,
        x,
        y,
        color: pipe.color === colors.amber ? colors.amber : colors.white,
        size: pipe.color === colors.amber ? 12 * scaleFactor : 10 * scaleFactor,
      };
    });
  }, [dataPipes, progress, scaleFactor]);

  // 5. DEVELOPER LOG CONSOLE SCRIPTS (LOOP SEAMLESSLY)
  const logs = useMemo(() => {
    const rawLogs = [
      '⚡ [OK] GATEWAY_HEALTH_CHECK - ping: 1.02ms',
      '💾 [INFO] DB_REPLICA_SYNCED_OK - status: stable',
      '📈 [HIT] REDIS_CACHE_02 - ratio: 94.8%',
      '⚡ [OK] GATEWAY_HEALTH_CHECK - ping: 1.15ms',
      '📦 [INFO] API_GATEWAY_US_EAST - active_conn: 14.8k',
      '⚙️ [SYS] MEMORY_DEFRAGMENTATION - core: 02 - freed: 120MB',
      '🔥 [INFO] DB_PRIMARY - QPS: 8,421 - load: 22%',
      '📈 [HIT] REDIS_CACHE_04 - ratio: 96.1%',
      '⚡ [OK] GATEWAY_HEALTH_CHECK - ping: 0.98ms',
      '💾 [INFO] DB_REPLICA_SYNCED_OK - status: stable',
      '⚠️ [WARN] AP_EAST_RTT_ELEVATED - latency: 45.4ms',
      '📦 [INFO] API_GATEWAY_EU_WEST - active_conn: 22.4k',
      '📈 [HIT] REDIS_CACHE_01 - ratio: 93.5%',
      '💾 [INFO] DB_REPLICA_SYNCED_OK - status: stable',
      '⚙️ [SYS] GARBAGE_COLLECTOR_RUN - node: API_03 - freed: 45MB',
    ];

    const list: Array<{ text: string; key: string }> = [];
    // Repeat logs multiple times to ensure enough vertical span for looping
    for (let r = 0; r < 3; r++) {
      rawLogs.forEach((l, idx) => {
        list.push({
          text: l,
          key: `log-${r}-${idx}`,
        });
      });
    }
    return list;
  }, []);

  const logLineHeight = 38 * scaleFactor;
  // Calculate seamless vertical scrolling offset
  const logScrollY = progress * logLineHeight * 15;

  // 6. RESOURCE METRIC DIAL PERCENTAGES (LOOP SEAMLESSLY)
  const metricValues = useMemo(() => {
    // Generate organic undulating numbers that return to original at t=0 / t=2PI
    const dbLoad = Math.floor(22.4 + Math.sin(t) * 3.8);
    const redisHit = (94.8 + Math.cos(t * 2) * 1.2).toFixed(1);
    const cacheMemory = (42.1 + Math.sin(t) * 2.1).toFixed(1);
    const globalQps = Math.floor(18420 + Math.sin(t * 2) * 1250);

    return {
      dbLoad: `${dbLoad}%`,
      dbBarWidth: dbLoad * 2.8 * scaleFactor,
      redisHit: `${redisHit}%`,
      redisBarWidth: (parseFloat(redisHit) - 90) * 28 * scaleFactor, // focus on 90-100% range
      cacheMemory: `${cacheMemory}GB`,
      cacheMemoryBar: (parseFloat(cacheMemory) - 35) * 25 * scaleFactor,
      globalQps: globalQps.toLocaleString(),
    };
  }, [t, scaleFactor]);

  // 7. BOTTOM Spline-based Bandwidth Spectrum graph path
  const areaChartPath = useMemo(() => {
    const chartWidth = 920 * scaleFactor;
    const startX = width / 2 - chartWidth / 2;
    const startY = height - 120 * scaleFactor;

    const points = [];
    const steps = 60;
    
    for (let i = 0; i <= steps; i++) {
      const pct = i / steps;
      const x = startX + pct * chartWidth;
      
      // Superposition of looping waves
      const w1 = Math.sin(pct * Math.PI * 4 + t) * 30 * scaleFactor;
      const w2 = Math.cos(pct * Math.PI * 10 - t * 2) * 12 * scaleFactor;
      const w3 = Math.sin(pct * Math.PI * 18 + t * 3) * 5 * scaleFactor;
      
      const windowFactor = Math.sin(pct * Math.PI); // Keep graph edges anchored at 0 height
      const y = startY - (40 * scaleFactor + (w1 + w2 + w3) * windowFactor);
      
      points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }

    // Close the shape to fill the area nicely
    const fillPath = `${points.join(' ')} L ${startX + chartWidth} ${startY} L ${startX} ${startY} Z`;
    const linePath = points.join(' ');

    return { fillPath, linePath };
  }, [t, width, height, scaleFactor]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Share Tech Mono', monospace",
        color: colors.cyan,
      }}
    >
      {/* Load fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
          @keyframes glowPulse {
            0% { filter: drop-shadow(0 0 4px ${colors.cyan}88); }
            50% { filter: drop-shadow(0 0 10px ${colors.cyan}ff); }
            100% { filter: drop-shadow(0 0 4px ${colors.cyan}88); }
          }
        `}
      </style>

      {/* Background Micro-Mesh Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(rgba(6, 182, 212, 0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.012) 1px, transparent 1px)`,
          backgroundSize: `${90 * scaleFactor}px ${90 * scaleFactor}px`,
          backgroundPosition: 'center center',
          pointerEvents: 'none',
        }}
      />

      {/* Atmospheric Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          width: 1400 * scaleFactor,
          height: 700 * scaleFactor,
          left: width / 2 - 700 * scaleFactor,
          top: height / 2 - 350 * scaleFactor,
          background: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.04) 45%, transparent 75%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: `inset 0 0 ${400 * scaleFactor}px rgba(5, 7, 15, 0.96)`,
          pointerEvents: 'none',
        }}
      />

      {/* MAIN DATA NETWORK CANVAS */}
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
          {/* Cyber glow filters */}
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation={6 * scaleFactor} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. DRAW BEZIER SYSTEM DATA PIPES */}
        <g opacity="0.68">
          {dataPipes.map((pipe) => (
            <path
              key={pipe.id}
              d={`M ${pipe.x1} ${pipe.y1} Q ${pipe.ctrlX} ${pipe.ctrlY} ${pipe.x2} ${pipe.y2}`}
              fill="none"
              stroke={pipe.color}
              strokeWidth={3.2 * scaleFactor}
              strokeDasharray="4, 6"
            />
          ))}
        </g>

        {/* 2. RENDER ACTIVE DATA PACKETS */}
        <g style={{ filter: 'url(#neonGlow)' }}>
          {animatedPackets.map((packet) => (
            <circle
              key={packet.id}
              cx={packet.x}
              cy={packet.y}
              r={packet.size}
              fill={packet.color}
            />
          ))}
        </g>

        {/* 3. DRAW INFRASTRUCTURE NODES (Back-to-Front depth) */}
        {sortedNodes.map((n) => {
          const outerSize = (n.tier === 'core' ? 75 : n.tier === 'cache' ? 55 : 40) * n.scale;
          const innerSize = (n.tier === 'core' ? 30 : n.tier === 'cache' ? 22 : 16) * n.scale;

          return (
            <g key={n.id} opacity={interpolate(n.depth, [-250, 250], [0.98, 0.65])}>
              {/* Outer soft ring */}
              <circle
                cx={n.x}
                cy={n.y}
                r={outerSize}
                fill="none"
                stroke={n.color}
                strokeWidth={2 * scaleFactor}
                opacity={0.35}
              />
              <circle
                cx={n.x}
                cy={n.y}
                r={outerSize * 1.5}
                fill="none"
                stroke={n.color}
                strokeWidth={1 * scaleFactor}
                strokeDasharray="4, 4"
                opacity={0.15}
              />

              {/* Inner active node core */}
              <circle
                cx={n.x}
                cy={n.y}
                r={innerSize}
                fill={n.color}
                style={{ filter: 'url(#neonGlow)' }}
              />

              {/* Server Name Label Bracket (Only for caching and gate layers to prevent core overlap) */}
              {n.tier !== 'core' && (
                <g transform={`translate(${n.x}, ${n.y})`}>
                  {/* Small pointer tick line */}
                  <line
                    x1={0}
                    y1={outerSize}
                    x2={0}
                    y2={outerSize + 25 * scaleFactor}
                    stroke={n.color}
                    strokeWidth={2 * scaleFactor}
                    opacity={0.4}
                  />
                  {/* Floating Tech Data Text Panel */}
                  <text
                    x={0}
                    y={outerSize + 50 * scaleFactor}
                    fill={colors.white}
                    fontSize={20 * scaleFactor}
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity={0.9}
                  >
                    {n.name}
                  </text>
                  <text
                    x={0}
                    y={outerSize + 70 * scaleFactor}
                    fill={colors.slate}
                    fontSize={16 * scaleFactor}
                    textAnchor="middle"
                    opacity={0.8}
                  >
                    {n.ip}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* ========================================================================= */}
      {/* HUD INTERFACE CONTAINERS */}

      {/* TOP HEADER STATUS PANEL */}
      <div
        style={{
          position: 'absolute',
          top: 70 * scaleFactor,
          left: 90 * scaleFactor,
          right: 90 * scaleFactor,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 34 * scaleFactor,
              fontWeight: 'bold',
              letterSpacing: 2 * scaleFactor,
              color: colors.white,
              display: 'flex',
              alignItems: 'center',
              gap: 12 * scaleFactor,
            }}
          >
            <span style={{ color: colors.emerald }}>●</span> DISTRIBUTED SYSTEMS ORCHESTRATOR
          </div>
          <div style={{ fontSize: 18 * scaleFactor, color: colors.slate, marginTop: 4 * scaleFactor }}>
            SYS_TOPOLOGY: ACTIVE // LOAD_BALANCE: NORMAL // QPS: {metricValues.globalQps}
          </div>
        </div>

        {/* Global telemetry tickers */}
        <div style={{ display: 'flex', gap: 40 * scaleFactor, textAlign: 'right' }}>
          <div>
            <div style={{ fontSize: 12 * scaleFactor, color: colors.slate }}>ACTIVE CORE NODES</div>
            <div style={{ fontSize: 26 * scaleFactor, color: colors.emerald, fontWeight: 'bold' }}>13 / 13 ONLINE</div>
          </div>
          <div>
            <div style={{ fontSize: 12 * scaleFactor, color: colors.slate }}>GLOBAL HIT RATIO</div>
            <div style={{ fontSize: 26 * scaleFactor, color: colors.cyan, fontWeight: 'bold' }}>{metricValues.redisHit}</div>
          </div>
          <div>
            <div style={{ fontSize: 12 * scaleFactor, color: colors.slate }}>CLUSTER HEALTH</div>
            <div style={{ fontSize: 26 * scaleFactor, color: colors.white, fontWeight: 'bold' }}>99.982%</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEFT TERMINAL LOG CONSOLE */}
      <div
        style={{
          position: 'absolute',
          top: 240 * scaleFactor,
          left: 90 * scaleFactor,
          width: 580 * scaleFactor,
          height: 600 * scaleFactor,
          border: `1.5px solid rgba(6, 182, 212, 0.15)`,
          backgroundColor: 'rgba(5, 7, 15, 0.75)',
          padding: 24 * scaleFactor,
          boxSizing: 'border-box',
          overflow: 'hidden',
          borderRadius: 4 * scaleFactor,
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            borderBottom: `1.5px solid rgba(6, 182, 212, 0.15)`,
            paddingBottom: 12 * scaleFactor,
            marginBottom: 16 * scaleFactor,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 15 * scaleFactor, fontWeight: 'bold', color: colors.white }}>
            💻 LIVE_ORCHESTRATOR_CONSOLE
          </span>
          <span style={{ fontSize: 11 * scaleFactor, color: colors.emerald }}>● ENGINE RUNNING</span>
        </div>

        {/* Seamless scrolling log lines container */}
        <div style={{ position: 'relative', width: '100%', height: 480 * scaleFactor, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: -logScrollY,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {logs.map((log) => (
              <div
                key={log.key}
                style={{
                  height: logLineHeight,
                  fontSize: 14 * scaleFactor,
                  color: log.text.includes('WARN')
                    ? colors.amber
                    : log.text.includes('OK') || log.text.includes('HIT')
                    ? colors.cyan
                    : colors.slateLight,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {log.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT METRICS TELEMETRY PANELS */}
      <div
        style={{
          position: 'absolute',
          top: 240 * scaleFactor,
          right: 90 * scaleFactor,
          width: 580 * scaleFactor,
          height: 600 * scaleFactor,
          border: `1.5px solid rgba(6, 182, 212, 0.15)`,
          backgroundColor: 'rgba(5, 7, 15, 0.75)',
          padding: 24 * scaleFactor,
          boxSizing: 'border-box',
          borderRadius: 4 * scaleFactor,
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            borderBottom: `1.5px solid rgba(6, 182, 212, 0.15)`,
            paddingBottom: 12 * scaleFactor,
            marginBottom: 24 * scaleFactor,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 15 * scaleFactor, fontWeight: 'bold', color: colors.white }}>
            📊 SYSTEM_RESOURCE_MONITOR
          </span>
          <span style={{ fontSize: 11 * scaleFactor, color: colors.cyan }}>SECURE // VERIFIED</span>
        </div>

        {/* METRICS STACK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 * scaleFactor }}>
          {/* Metric 1: CPU load */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 * scaleFactor, marginBottom: 8 * scaleFactor }}>
              <span style={{ color: colors.slateLight }}>CORE_DB_LOAD (PRIMARY)</span>
              <span style={{ color: colors.emerald, fontWeight: 'bold' }}>{metricValues.dbLoad}</span>
            </div>
            <div style={{ height: 8 * scaleFactor, backgroundColor: '#0f172a', borderRadius: 4 * scaleFactor, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: metricValues.dbBarWidth,
                  backgroundColor: colors.emerald,
                  borderRadius: 4 * scaleFactor,
                  filter: `drop-shadow(0 0 4px ${colors.emerald})`,
                }}
              />
            </div>
          </div>

          {/* Metric 2: Cache hits */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 * scaleFactor, marginBottom: 8 * scaleFactor }}>
              <span style={{ color: colors.slateLight }}>REDIS_CLUSTER_HIT_RATIO</span>
              <span style={{ color: colors.cyan, fontWeight: 'bold' }}>{metricValues.redisHit}</span>
            </div>
            <div style={{ height: 8 * scaleFactor, backgroundColor: '#0f172a', borderRadius: 4 * scaleFactor, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: metricValues.redisBarWidth,
                  backgroundColor: colors.cyan,
                  borderRadius: 4 * scaleFactor,
                  filter: `drop-shadow(0 0 4px ${colors.cyan})`,
                }}
              />
            </div>
          </div>

          {/* Metric 3: Memory footprint */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 * scaleFactor, marginBottom: 8 * scaleFactor }}>
              <span style={{ color: colors.slateLight }}>REDIS_MEMORY_UTILIZATION</span>
              <span style={{ color: colors.purple, fontWeight: 'bold' }}>{metricValues.cacheMemory}</span>
            </div>
            <div style={{ height: 8 * scaleFactor, backgroundColor: '#0f172a', borderRadius: 4 * scaleFactor, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: metricValues.cacheMemoryBar,
                  backgroundColor: colors.purple,
                  borderRadius: 4 * scaleFactor,
                  filter: `drop-shadow(0 0 4px ${colors.purple})`,
                }}
              />
            </div>
          </div>

          {/* Infrastructure Metrics Table */}
          <div
            style={{
              marginTop: 20 * scaleFactor,
              padding: 16 * scaleFactor,
              backgroundColor: '#070a13',
              border: '1px solid rgba(6, 182, 212, 0.08)',
              borderRadius: 4 * scaleFactor,
            }}
          >
            <div style={{ fontSize: 12 * scaleFactor, color: colors.slate, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 8 * scaleFactor }}>
              CLUSTER GLOBAL LATENCY READOUTS
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 * scaleFactor, fontSize: 13 * scaleFactor }}>
              <span style={{ color: colors.slateLight }}>API_GATEWAY_US_EAST</span>
              <span style={{ color: colors.white }}>1.04 ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 * scaleFactor, fontSize: 13 * scaleFactor }}>
              <span style={{ color: colors.slateLight }}>API_GATEWAY_EU_WEST</span>
              <span style={{ color: colors.white }}>14.28 ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 * scaleFactor, fontSize: 13 * scaleFactor }}>
              <span style={{ color: colors.slateLight }}>API_GATEWAY_SA_EAST</span>
              <span style={{ color: colors.amber }}>32.14 ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM BANDWIDTH SPECTROGRAM PLOT */}
      <div
        style={{
          position: 'absolute',
          bottom: 40 * scaleFactor,
          left: 90 * scaleFactor,
          right: 90 * scaleFactor,
          height: 180 * scaleFactor,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Graph title */}
        <div
          style={{
            width: 920 * scaleFactor,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12 * scaleFactor,
            color: colors.slate,
            marginBottom: 4 * scaleFactor,
          }}
        >
          <span>📉 CLUSTER_BANDWIDTH_SPECTRUM_ANALYSIS</span>
          <span>MAX_CAPACITY: 40.0 Gbps</span>
        </div>

        {/* Vector SVG curves for the chart */}
        <svg
          width={width}
          height={height}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Fill shape */}
          <path
            d={areaChartPath.fillPath}
            fill={`url(#areaGrad)`}
            opacity={0.08}
          />
          {/* Top thick neon line */}
          <path
            d={areaChartPath.linePath}
            fill="none"
            stroke={colors.cyan}
            strokeWidth={3 * scaleFactor}
            style={{ filter: 'url(#neonGlow)' }}
          />

          <defs>
            {/* Soft gradient fill for the chart area */}
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.cyan} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtle grid border coordinates */}
        <div
          style={{
            position: 'absolute',
            bottom: 30 * scaleFactor,
            left: 0,
            right: 0,
            borderBottom: '1px solid rgba(6, 182, 212, 0.08)',
          }}
        />
      </div>

      {/* Top-right corner tech design elements */}
      <div
        style={{
          position: 'absolute',
          top: 30 * scaleFactor,
          right: 90 * scaleFactor,
          fontSize: 12 * scaleFactor,
          color: colors.slate,
          letterSpacing: 2 * scaleFactor,
          pointerEvents: 'none',
        }}
      >
        ORCHESTRATE_OS_v4.8 // UTC: {new Date().toISOString().slice(11, 19)}
      </div>
    </AbsoluteFill>
  );
};
