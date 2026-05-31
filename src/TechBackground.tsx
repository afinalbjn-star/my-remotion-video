import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import React from 'react';

export const TechBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames, width, height } = useVideoConfig();

    // Seamless loop calculation
    const progress = (frame % durationInFrames) / durationInFrames;

    // Animated gradient background
    const gradientRotation = interpolate(progress, [0, 1], [0, 360]);

    // Floating particles
    const particles = Array.from({ length: 50 }, (_, i) => {
        const angle = (i / 50) * Math.PI * 2;
        const radius = 300 + (i % 5) * 100;
        // Speed harus bilangan bulat agar posisi akhir (progress=1) 
        // sama dengan posisi awal (progress=0)
        const speed = 1 + (i % 3);

        const currentAngle = angle + progress * speed * Math.PI * 2;
        const x = width / 2 + Math.cos(currentAngle) * radius;
        const y = height / 2 + Math.sin(currentAngle) * radius;

        const opacity = interpolate(
            Math.sin(progress * Math.PI * 2 + i),
            [-1, 1],
            [0.3, 0.8]
        );

        const scale = interpolate(
            Math.cos(progress * Math.PI * 2 + i * 0.5),
            [-1, 1],
            [0.5, 1.5]
        );

        return { x, y, opacity, scale, color: i };
    });

    // Grid lines animation
    const gridOffset = interpolate(progress, [0, 1], [0, 100]);

    // Hexagon pattern
    const hexagons = Array.from({ length: 20 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const hexSize = 80;
        const xOffset = col * hexSize * 1.5 + (row % 2) * hexSize * 0.75;
        const yOffset = row * hexSize * 1.3;

        const rotation = interpolate(
            progress,
            [0, 1],
            [0, 360]
        ) + i * 18;

        const pulseScale = 1 + Math.sin(progress * Math.PI * 4 + i * 0.5) * 0.1;

        return { x: xOffset, y: yOffset, rotation, scale: pulseScale };
    });

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(${gradientRotation}deg, 
          #0f0f23 0%, 
          #1a1a3e 25%, 
          #16213e 50%, 
          #0f3460 75%, 
          #0f0f23 100%)`,
            }}
        >
            {/* Animated grid */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    opacity: 0.15,
                }}
            >
                <defs>
                    <pattern
                        id="grid"
                        width="100"
                        height="100"
                        patternUnits="userSpaceOnUse"
                        x={gridOffset}
                        y={gridOffset}
                    >
                        <path
                            d="M 100 0 L 0 0 0 100"
                            fill="none"
                            stroke="cyan"
                            strokeWidth="0.5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Hexagon pattern */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    opacity: 0.2,
                }}
            >
                {hexagons.map((hex, i) => (
                    <g
                        key={i}
                        transform={`translate(${hex.x + 200}, ${hex.y + 200}) rotate(${hex.rotation}) scale(${hex.scale})`}
                    >
                        <polygon
                            points="30,0 15,26 -15,26 -30,0 -15,-26 15,-26"
                            fill="none"
                            stroke={`hsl(${(i * 30) % 360}, 70%, 60%)`}
                            strokeWidth="2"
                        />
                    </g>
                ))}
            </svg>

            {/* Floating particles */}
            {particles.map((particle, i) => {
                const hue = (particle.color * 360) / 50;
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: particle.x,
                            top: particle.y,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: `hsl(${hue}, 80%, 60%)`,
                            opacity: particle.opacity,
                            transform: `translate(-50%, -50%) scale(${particle.scale})`,
                            boxShadow: `0 0 20px hsl(${hue}, 80%, 60%)`,
                        }}
                    />
                );
            })}

            {/* Glowing orbs */}
            <div
                style={{
                    position: 'absolute',
                    left: '20%',
                    top: '30%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%)',
                    transform: `scale(${1 + Math.sin(progress * Math.PI * 2) * 0.2})`,
                    filter: 'blur(40px)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: '20%',
                    bottom: '30%',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,0,255,0.3) 0%, transparent 70%)',
                    transform: `scale(${1 + Math.cos(progress * Math.PI * 2) * 0.2})`,
                    filter: 'blur(40px)',
                }}
            />

            {/* Circuit lines */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    opacity: 0.3,
                }}
            >
                {Array.from({ length: 10 }).map((_, i) => {
                    const dashOffset = interpolate(progress, [0, 1], [0, -100]);
                    return (
                        <line
                            key={i}
                            x1={i * 200}
                            y1={0}
                            x2={i * 200 + 500}
                            y2={height}
                            stroke={`hsl(${180 + i * 20}, 70%, 50%)`}
                            strokeWidth="2"
                            strokeDasharray="20 30" // Total 50
                            strokeDashoffset={interpolate(progress, [0, 1], [0, -100])} // -100 adalah kelipatan 50 (seamless)
                        />
                    );
                })}
            </svg>
        </AbsoluteFill>
    );
};