import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';

// Animated tech background with complex grid, particles, and data streams
export const TechBackgroundComplex: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Slow scrolling offset for the grid
    const gridOffset = interpolate(frame, [0, durationInFrames], [0, 120]);

    // Pulsing glow for accent nodes
    const pulse = (Math.sin(frame / 12) + 1) / 2;

    // Secondary slower pulse
    const slowPulse = (Math.sin(frame / 30) + 1) / 2;

    const gridSize = 60;
    const cols = Math.ceil(width / gridSize) + 2;
    const rows = Math.ceil(height / gridSize) + 2;

    // Data stream particles
    const particleCount = 30;
    const particles = Array.from({ length: particleCount }).map((_, i) => {
        const seed = i * 137.5;
        const x = ((seed * 1.3) % width);
        const y = ((seed * 2.7 + frame * 2) % (height + 100)) - 50;
        const size = 2 + (i % 3);
        const opacity = 0.3 + ((Math.sin(seed + frame / 20) + 1) / 2) * 0.5;
        return { x, y, size, opacity };
    });

    // Floating data lines (horizontal scan lines)
    const scanLineY = (frame * 3) % height;

    return (
        <AbsoluteFill style={{ backgroundColor: '#050a18' }}>
            {/* Multiple radial glow layers */}
            <AbsoluteFill
                style={{
                    background:
                        'radial-gradient(circle at 30% 30%, rgba(0,180,255,0.12), transparent 50%), radial-gradient(circle at 70% 60%, rgba(100,0,255,0.08), transparent 40%)',
                }}
            />

            {/* Grid lines */}
            <svg
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="rgba(0,180,255,0.05)" />
                        <stop offset="50%" stopColor="rgba(0,180,255,0.15)" />
                        <stop offset="100%" stopColor="rgba(0,180,255,0.05)" />
                    </linearGradient>
                </defs>

                {/* Vertical lines */}
                {Array.from({ length: cols }).map((_, i) => {
                    const x = i * gridSize - (gridOffset % gridSize);
                    return (
                        <line
                            key={`v-${i}`}
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={height}
                            stroke="url(#lineGrad)"
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Horizontal lines */}
                {Array.from({ length: rows }).map((_, j) => {
                    const y = j * gridSize - (gridOffset % gridSize);
                    return (
                        <line
                            key={`h-${j}`}
                            x1={0}
                            y1={y}
                            x2={width}
                            y2={y}
                            stroke="url(#lineGrad)"
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Glowing accent nodes at grid intersections */}
                {Array.from({ length: 20 }).map((_, k) => {
                    const gx = (k * 137) % cols;
                    const gy = (k * 89) % rows;
                    const x = gx * gridSize - (gridOffset % gridSize);
                    const y = gy * gridSize - (gridOffset % gridSize);
                    const r = 2 + pulse * 5;
                    const isBright = k % 3 === 0;
                    return (
                        <circle
                            key={`node-${k}`}
                            cx={x}
                            cy={y}
                            r={r}
                            fill={isBright ? 'rgba(0,255,200,0.9)' : 'rgba(0,180,255,0.7)'}
                            style={{
                                filter: isBright
                                    ? 'drop-shadow(0 0 12px rgba(0,255,200,0.8))'
                                    : 'drop-shadow(0 0 6px rgba(0,180,255,0.6))',
                            }}
                        />
                    );
                })}

                {/* Connection lines between nearby nodes */}
                {Array.from({ length: 8 }).map((_, k) => {
                    const gx1 = (k * 137) % cols;
                    const gy1 = (k * 89) % rows;
                    const gx2 = ((k + 3) * 137) % cols;
                    const gy2 = ((k + 3) * 89) % rows;
                    const x1 = gx1 * gridSize - (gridOffset % gridSize);
                    const y1 = gy1 * gridSize - (gridOffset % gridSize);
                    const x2 = gx2 * gridSize - (gridOffset % gridSize);
                    const y2 = gy2 * gridSize - (gridOffset % gridSize);
                    const opacity = 0.2 + slowPulse * 0.3;
                    return (
                        <line
                            key={`conn-${k}`}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={`rgba(0,200,255,${opacity})`}
                            strokeWidth={0.5}
                            strokeDasharray="4 4"
                        />
                    );
                })}

                {/* Floating particles */}
                {particles.map((p, i) => (
                    <circle
                        key={`particle-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r={p.size}
                        fill={`rgba(0,200,255,${p.opacity})`}
                        style={{
                            filter: 'drop-shadow(0 0 4px rgba(0,200,255,0.4))',
                        }}
                    />
                ))}

                {/* Scan line */}
                <line
                    x1={0}
                    y1={scanLineY}
                    x2={width}
                    y2={scanLineY}
                    stroke="rgba(0,255,255,0.15)"
                    strokeWidth={2}
                    style={{
                        filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.3))',
                    }}
                />
            </svg>

            {/* Vignette overlay */}
            <AbsoluteFill
                style={{
                    background:
                        'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.6) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};

export default TechBackgroundComplex;