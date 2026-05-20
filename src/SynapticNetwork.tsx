import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
} from 'remotion';

// Elegant Calm Cognitive Palette
const colors = {
  bg: '#030514',           // Deep Cognitive Dark Indigo
  cobalt: '#0091ea',       // Luminous Cobalt Blue
  lavender: '#8e24aa',     // Rich Lavender Purple
  cyan: '#00e5ff',         // Electric Synapse Cyan
  white: '#ffffff',        // Spark White
  accent: '#121245',       // Shadow Indigo
};

export const SynapticNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Progress 0.0 to 1.0
  const progress = frame / durationInFrames;

  // Seamless rotation of the whole network: exactly 1 full rotation (2 * PI)
  const angle = progress * Math.PI * 2;

  const scaleFactor = height / 2160;

  // 1. Generate 3D Neural Nodes and Connections deterministically
  const network = useMemo(() => {
    const nodes: any[] = [];
    const connections: any[] = [];
    const numNodes = 45;

    // Distribute nodes in a 3D sphere/cylinder-like volume
    for (let i = 0; i < numNodes; i++) {
      // Deterministic coordinates using sine and cosine seeds
      const theta = i * 2.39996; // Golden angle
      const r = Math.sqrt(i / numNodes) * 650 * scaleFactor;
      const xBase = r * Math.cos(theta);
      const zBase = r * Math.sin(theta);
      const yBase = (Math.sin(i * 17.5) * 450) * scaleFactor;

      // Gentle individual breathing motion (seamless, 2 cycles)
      const breatheAngle = progress * Math.PI * 4 + i;
      const breatheDist = 25 * scaleFactor;
      const xRot = xBase + Math.cos(breatheAngle) * breatheDist;
      const yRot = yBase + Math.sin(breatheAngle * 1.5) * breatheDist * 0.7;
      const zRot = zBase + Math.sin(breatheAngle) * breatheDist;

      nodes.push({
        id: i,
        xRaw: xRot,
        yRaw: yRot,
        zRaw: zRot,
        color: i % 3 === 0 ? colors.cobalt : i % 3 === 1 ? colors.lavender : colors.cyan,
      });
    }

    // Connect close nodes to form synaptic pathways
    for (let i = 0; i < numNodes; i++) {
      const connectionsForI = [];
      for (let j = i + 1; j < numNodes; j++) {
        const dx = nodes[i].xRaw - nodes[j].xRaw;
        const dy = nodes[i].yRaw - nodes[j].yRaw;
        const dz = nodes[i].zRaw - nodes[j].zRaw;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Connect if within threshold distance
        if (dist < 400 * scaleFactor) {
          connectionsForI.push({
            id: `c-${i}-${j}`,
            fromIndex: i,
            toIndex: j,
            dist,
          });
        }
      }
      
      // Limit connections per node to keep it clean and neat
      connectionsForI
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3)
        .forEach(c => connections.push(c));
    }

    return { nodes, connections };
  }, [progress, scaleFactor]);

  // 2. Perform 3D Rotation & Camera projection on Nodes and Connections
  const projectedData = useMemo(() => {
    const nodesRotated = network.nodes.map((node) => {
      // Rotate around Y axis
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      const xRot = node.xRaw * cosA - node.zRaw * sinA;
      const zRot = node.xRaw * sinA + node.zRaw * cosA;
      const yRot = node.yRaw;

      // Perspective projection
      const fov = 1800;
      const cameraDist = 2500;
      const scale = fov / (fov + zRot + cameraDist);

      const screenX = width / 2 + xRot * scale;
      const screenY = height / 2 + yRot * scale;

      return {
        id: node.id,
        x: screenX,
        y: screenY,
        depth: zRot,
        scale: scale * scaleFactor,
        color: node.color,
      };
    });

    const nodeLookup = new Map(nodesRotated.map(n => [n.id, n]));

    const connectionsProjected = network.connections.map((c) => {
      const fromNode = nodeLookup.get(c.fromIndex)!;
      const toNode = nodeLookup.get(c.toIndex)!;
      const avgDepth = (fromNode.depth + toNode.depth) / 2;

      // Dynamic signal pulses (sparks) flying along the link
      // Perfectly seamless: the pulse travels from 'from' to 'to' based on time
      // 3 pulses per link over the 10 seconds
      const pulseFrequency = 3;
      const offset = (c.fromIndex * 13.7) % 1.0;
      const pulseProgress = (progress * pulseFrequency + offset) % 1.0;

      const px = fromNode.x + (toNode.x - fromNode.x) * pulseProgress;
      const py = fromNode.y + (toNode.y - fromNode.y) * pulseProgress;
      const pScale = fromNode.scale + (toNode.scale - fromNode.scale) * pulseProgress;

      return {
        id: c.id,
        x1: fromNode.x,
        y1: fromNode.y,
        x2: toNode.x,
        y2: toNode.y,
        depth: avgDepth,
        scale: (fromNode.scale + toNode.scale) / 2,
        colorFrom: fromNode.color,
        colorTo: toNode.color,
        pulse: {
          x: px,
          y: py,
          scale: pScale,
        },
      };
    });

    return { nodes: nodesRotated, connections: connectionsProjected };
  }, [network, angle, progress, width, height, scaleFactor]);

  // 3. Combine and sort everything by depth (Painter's algorithm)
  const renderedElements = useMemo(() => {
    const list: any[] = [];

    projectedData.connections.forEach(c => {
      list.push({ ...c, renderType: 'connection' });
    });

    projectedData.nodes.forEach(n => {
      list.push({ ...n, renderType: 'node' });
    });

    return list.sort((a, b) => b.depth - a.depth);
  }, [projectedData]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Dynamic Synaptic Energy Pulse Background Glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 45% 55%, rgba(142, 36, 170, 0.16) 0%, rgba(0, 145, 234, 0.08) 50%, transparent 100%)`,
          filter: 'blur(95px)',
          opacity: 0.9 + Math.sin(frame * 0.06) * 0.04,
          pointerEvents: 'none',
        }}
      />

      {/* Cybernetic Micro-Spars Network Backdrop Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${colors.accent} 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
          opacity: 0.35,
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
            // Neural Synaptic Path
            const depthFade = interpolate(el.depth, [-800, 800], [0.95, 0.15], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const strokeWidth = 3.5 * el.scale;

            // Make lines look glowing and futuristic
            return (
              <g key={el.id} opacity={depthFade}>
                {/* Connecting Line (Gradient effect using stroke colors) */}
                <line
                  x1={el.x1}
                  y1={el.y1}
                  x2={el.x2}
                  y2={el.y2}
                  stroke={el.colorFrom}
                  strokeWidth={strokeWidth}
                  opacity={0.35}
                />

                {/* Electric Sparks/Impulse (Glowing moving dot on line) */}
                <circle
                  cx={el.pulse.x}
                  cy={el.pulse.y}
                  r={8.0 * el.pulse.scale}
                  fill={colors.cyan}
                  opacity={0.3}
                  style={{ filter: 'blur(1px)' }}
                />
                <circle
                  cx={el.pulse.x}
                  cy={el.pulse.y}
                  r={3.5 * el.pulse.scale}
                  fill={colors.white}
                  style={{
                    filter: 'drop-shadow(0 0 4px ' + colors.cyan + ')',
                  }}
                />
              </g>
            );
          }

          if (el.renderType === 'node') {
            // Synapse Node (Cell body intersection)
            const depthFade = interpolate(el.depth, [-800, 800], [0.95, 0.25], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            
            const radius = 13.0 * el.scale;
            const coreRadius = 5.0 * el.scale;

            return (
              <g key={el.id} opacity={depthFade}>
                {/* Node Outer Glow */}
                <circle
                  cx={el.x}
                  cy={el.y}
                  r={radius}
                  fill={el.color}
                  opacity={0.28}
                  style={{ filter: 'blur(2px)' }}
                />
                {/* Inner Core */}
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

          return null;
        })}
      </svg>

      {/* Cinematic Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(3, 5, 20, 0.45) 60%, rgba(3, 5, 20, 0.95) 100%)`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
