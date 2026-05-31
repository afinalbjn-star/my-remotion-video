import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const AdvancedTechBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames, width, height } = useVideoConfig();

    const progress = (frame % durationInFrames) / durationInFrames;
    const loopProgress = progress * Math.PI * 2;

    // Complex wave calculations
    const wave1 = Math.sin(loopProgress) * 100;
    const wave2 = Math.cos(loopProgress * 2) * 150;
    const wave3 = Math.sin(loopProgress * 1) * 80;

    // Rotating gradient
    const gradientAngle = interpolate(progress, [0, 1], [0, 360]);

    // Generate complex particle system
    const particleCount = 200;
    const particles = Array.from({ length: particleCount }, (_, i) => {
        const angle = (i / particleCount) * Math.PI * 2;
        const layer = Math.floor(i / 40);
        const speed = 1 + layer;
        const radius = 400 + layer * 200;

        const spiralAngle = angle + progress * speed * Math.PI * 2;
        const spiralRadius = radius + Math.sin(progress * Math.PI * 4 + i * 0.1) * 100;

        const x = width / 2 + Math.cos(spiralAngle) * spiralRadius;
        const y = height / 2 + Math.sin(spiralAngle) * spiralRadius * 0.6;

        const opacity = interpolate(
            Math.sin(progress * Math.PI * 4 + i * 0.2),
            [-1, 1],
            [0.2, 1]
        );

        const scale = interpolate(
            Math.cos(progress * Math.PI * 4 + i * 0.15),
            [-1, 1],
            [0.3, 2]
        );

        const hue = (i * 360 / particleCount + progress * 360) % 360;

        return { x, y, opacity, scale, hue, layer };
    });

    // DNA helix strands
    const helixPoints = Array.from({ length: 100 }, (_, i) => {
        const t = i / 100;
        const helixProgress = (t + progress) % 1;

        const x1 = width / 2 - 300 + helixProgress * 600;
        const y1 = height / 2 + Math.sin(helixProgress * Math.PI * 8) * 200;

        const x2 = width / 2 - 300 + helixProgress * 600;
        const y2 = height / 2 + Math.sin(helixProgress * Math.PI * 8 + Math.PI) * 200;

        return { x1, y1, x2, y2, t: helixProgress };
    });

    // Geometric shapes floating
    const geometricShapes = Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const orbitRadius = 600 + (i % 3) * 200;
        const orbitSpeed = 1 + (i % 3);

        const orbitAngle = angle + progress * orbitSpeed * Math.PI * 2;

        const x = width / 2 + Math.cos(orbitAngle) * orbitRadius;
        const y = height / 2 + Math.sin(orbitAngle) * orbitRadius * 0.7;

        const rotation = progress * 360 * (i % 2 === 0 ? 1 : -1) + i * 45;
        const scale = 1 + Math.sin(progress * Math.PI * 4 + i) * 0.5;
        const hue = (i * 360 / 30 + progress * 360) % 360;

        return { x, y, rotation, scale, hue, type: i % 4 };
    });

    // Neural network nodes
    const neuralNodes = Array.from({ length: 50 }, (_, i) => {
        const gridX = (i % 10) / 9;
        const gridY = Math.floor(i / 10) / 4;

        const x = gridX * width + Math.sin(progress * Math.PI * 2 + i * 0.5) * 100;
        const y = gridY * height + Math.cos(progress * Math.PI * 2 + i * 0.3) * 100;

        const pulse = 0.5 + Math.sin(progress * Math.PI * 4 + i * 0.4) * 0.5;

        return { x, y, pulse, id: i };
    });

    // Energy rings
    const energyRings = Array.from({ length: 8 }, (_, i) => {
        const ringProgress = (progress + i / 8) % 1;
        const scale = interpolate(ringProgress, [0, 1], [0.5, 3]);
        const opacity = interpolate(ringProgress, [0, 0.5, 1], [0, 1, 0]);
        const hue = (i * 45 + progress * 360) % 360;

        return { scale, opacity, hue };
    });

    // Matrix rain effect
    const matrixColumns = Array.from({ length: 40 }, (_, i) => {
        const x = (i / 40) * width;
        const offset = (progress * (height + 500) + i * 50) % (height + 500);

        return { x, offset };
    });

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(${gradientAngle}deg, 
          #000000 0%, 
          #0a0a1f 20%,
          #1a0a2e 40%, 
          #16003b 60%,
          #0a0a1f 80%,
          #000000 100%)`,
            }}
        >
            {/* Animated radial gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle at ${50 + wave1 / 10}% ${50 + wave2 / 10}%, 
            rgba(138, 43, 226, 0.2) 0%, 
            transparent 50%)`,
                }}
            />

            {/* Energy rings */}
            {energyRings.map((ring, i) => (
                <div
                    key={`ring-${i}`}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: 400,
                        height: 400,
                        transform: `translate(-50%, -50%) scale(${ring.scale})`,
                        border: `3px solid hsla(${ring.hue}, 100%, 60%, ${ring.opacity})`,
                        borderRadius: '50%',
                        boxShadow: `0 0 40px hsla(${ring.hue}, 100%, 60%, ${ring.opacity})`,
                    }}
                />
            ))}

            {/* Matrix rain */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    opacity: 0.15,
                }}
            >
                {matrixColumns.map((col, i) => (
                    <text
                        key={`matrix-${i}`}
                        x={col.x}
                        y={col.offset - 200}
                        fill={`hsl(${120 + i * 5}, 100%, 50%)`}
                        fontSize="20"
                        fontFamily="monospace"
                        opacity={0.6}
                    >
                        {Array.from({ length: 10 }, (_, j) => (
                            <tspan key={j} x={col.x} dy="25">
                                {String.fromCharCode(0x30A0 + ((i + j) % 96))}
                            </tspan>
                        ))}
                    </text>
                ))}
            </svg>

            {/* Neural network connections */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    opacity: 0.3,
                }}
            >
                {neuralNodes.map((node, i) => {
                    return neuralNodes.slice(i + 1).map((targetNode, j) => {
                        const distance = Math.sqrt(
                            Math.pow(node.x - targetNode.x, 2) +
                            Math.pow(node.y - targetNode.y, 2)
                        );

                        if (distance < 400) {
                            const opacity = 1 - distance / 400;
                            const flowProgress = (progress * 2 + i * 0.1) % 1;
                            const flowX = node.x + (targetNode.x - node.x) * flowProgress;
                            const flowY = node.y + (targetNode.y - node.y) * flowProgress;

                            return (
                                <g key={`connection-${i}-${j}`}>
                                    <line
                                        x1={node.x}
                                        y1={node.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke={`hsla(${200 + i * 10}, 80%, 60%, ${opacity * 0.5})`}
                                        strokeWidth="1"
                                    />
                                    <circle
                                        cx={flowX}
                                        cy={flowY}
                                        r="3"
                                        fill={`hsl(${180 + i * 10}, 100%, 70%)`}
                                        opacity={opacity}
                                    />
                                </g>
                            );
                        }
                        return null;
                    });
                })}

                {/* Neural nodes */}
                {neuralNodes.map((node, i) => (
                    <circle
                        key={`node-${i}`}
                        cx={node.x}
                        cy={node.y}
                        r={5 + node.pulse * 5}
                        fill={`hsl(${180 + i * 7}, 100%, 60%)`}
                        opacity={node.pulse}
                        filter="url(#glow)"
                    />
                ))}

                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            {/* DNA Helix */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    opacity: 0.4,
                }}
            >
                <defs>
                    <linearGradient id="helixGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00ffff" />
                        <stop offset="50%" stopColor="#ff00ff" />
                        <stop offset="100%" stopColor="#00ffff" />
                    </linearGradient>
                </defs>

                {helixPoints.slice(0, -1).map((point, i) => {
                    const nextPoint = helixPoints[i + 1];
                    return (
                        <g key={`helix-${i}`}>
                            <line
                                x1={point.x1}
                                y1={point.y1}
                                x2={nextPoint.x1}
                                y2={nextPoint.y1}
                                stroke="url(#helixGradient)"
                                strokeWidth="3"
                                opacity={0.8}
                            />
                            <line
                                x1={point.x2}
                                y1={point.y2}
                                x2={nextPoint.x2}
                                y2={nextPoint.y2}
                                stroke="url(#helixGradient)"
                                strokeWidth="3"
                                opacity={0.8}
                            />
                            {i % 5 === 0 && (
                                <line
                                    x1={point.x1}
                                    y1={point.y1}
                                    x2={point.x2}
                                    y2={point.y2}
                                    stroke={`hsl(${point.t * 360}, 100%, 60%)`}
                                    strokeWidth="2"
                                    opacity={0.6}
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Geometric shapes */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    opacity: 0.6,
                }}
            >
                {geometricShapes.map((shape, i) => {
                    const size = 40 * shape.scale;

                    return (
                        <g
                            key={`shape-${i}`}
                            transform={`translate(${shape.x}, ${shape.y}) rotate(${shape.rotation}) scale(${shape.scale})`}
                        >
                            {shape.type === 0 && (
                                <rect
                                    x={-size / 2}
                                    y={-size / 2}
                                    width={size}
                                    height={size}
                                    fill="none"
                                    stroke={`hsla(${shape.hue}, 80%, 60%, 0.8)`}
                                    strokeWidth="2"
                                />
                            )}
                            {shape.type === 1 && (
                                <circle
                                    r={size / 2}
                                    fill="none"
                                    stroke={`hsla(${shape.hue}, 80%, 60%, 0.8)`}
                                    strokeWidth="2"
                                />
                            )}
                            {shape.type === 2 && (
                                <polygon
                                    points={`0,${-size / 2} ${size / 2},${size / 2} ${-size / 2},${size / 2}`}
                                    fill="none"
                                    stroke={`hsla(${shape.hue}, 80%, 60%, 0.8)`}
                                    strokeWidth="2"
                                />
                            )}
                            {shape.type === 3 && (
                                <path
                                    d={`M ${-size / 2} 0 L 0 ${-size / 2} L ${size / 2} 0 L 0 ${size / 2} Z`}
                                    fill="none"
                                    stroke={`hsla(${shape.hue}, 80%, 60%, 0.8)`}
                                    strokeWidth="2"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Particle System */}
            {particles.map((particle, i) => (
                <div
                    key={`particle-${i}`}
                    style={{
                        position: 'absolute',
                        left: particle.x,
                        top: particle.y,
                        width: 4,
                        height: 4,
                        backgroundColor: `hsl(${particle.hue}, 100%, 70%)`,
                        borderRadius: '50%',
                        opacity: particle.opacity,
                        transform: `translate(-50%, -50%) scale(${particle.scale})`,
                        boxShadow: `0 0 10px hsl(${particle.hue}, 100%, 70%)`,
                    }}
                />
            ))}
        </AbsoluteFill>
    );
};