import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
    random,
} from 'remotion';

const colors = {
    bg: '#010409',
    primary: '#0ea5e9',
    secondary: '#22d3ee',
    accent: '#818cf8',
    text: '#f8fafc',
    grid: 'rgba(14, 165, 233, 0.15)',
};

export const CognitiveArchitecture: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const scale = height / 2160;

    // Loop progress 0 to 1 over 1200 frames (20s @ 60fps)
    const loopProgress = frame / durationInFrames;

    // Generasi data statis untuk konsistensi profesional
    const nodes = useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: random(`node-x-${i}`) * width,
            y: random(`node-y-${i}`) * height,
            z: random(`node-z-${i}`),
            size: random(`node-s-${i}`) * 4 + 2,
            speedX: (random(`node-sx-${i}`) - 0.5) * 200,
            speedY: (random(`node-sy-${i}`) - 0.5) * 200,
        }));
    }, [width, height]);

    const dataPackets = useMemo(() => {
        return Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            from: Math.floor(random(`p-f-${i}`) * nodes.length),
            to: Math.floor(random(`p-t-${i}`) * nodes.length),
            offset: random(`p-o-${i}`),
        }));
    }, [nodes]);

    return (
        <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden', fontFamily: 'Inter, system-ui' }}>
            {/* 1. Deep Perspective Grid (Infinite Zoom Effect) */}
            <div style={{
                position: 'absolute',
                inset: -500,
                backgroundImage: `
                    linear-gradient(${colors.grid} 1px, transparent 1px),
                    linear-gradient(90deg, ${colors.grid} 1px, transparent 1px)
                `,
                backgroundSize: `${200 * scale}px ${200 * scale}px`,
                transform: `
                    perspective(1000px) 
                    rotateX(60deg) 
                    translateY(${(loopProgress * 400 * scale) % (200 * scale)}px)
                `,
                maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
                opacity: 0.6,
            }} />

            {/* 2. Neural Connection Network */}
            <svg width={width} height={height} style={{ position: 'absolute' }}>
                <defs>
                    <filter id="nodeGlow">
                        <feGaussianBlur stdDeviation={10 * scale} result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Garis Koneksi (Rendering selektif untuk estetika profesional) */}
                {nodes.map((node, i) => {
                    return nodes.slice(i + 1, i + 3).map((target, j) => {
                        // Gerakan mengayun halus
                        const x1 = node.x + Math.sin(frame * 0.01 + node.id) * 30 * scale;
                        const y1 = node.y + Math.cos(frame * 0.01 + node.id) * 30 * scale;
                        const x2 = target.x + Math.sin(frame * 0.01 + target.id) * 30 * scale;
                        const y2 = target.y + Math.cos(frame * 0.01 + target.id) * 30 * scale;

                        return (
                            <line
                                key={`line-${i}-${j}`}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke={colors.primary}
                                strokeWidth={2 * scale}
                                opacity={0.15}
                            />
                        );
                    });
                })}

                {/* Nodes dan Data Pulses */}
                {nodes.map((node) => {
                    const x = node.x + Math.sin(frame * 0.01 + node.id) * 30 * scale;
                    const y = node.y + Math.cos(frame * 0.01 + node.id) * 30 * scale;
                    const pulse = interpolate(Math.sin(frame * 0.05 + node.id), [-1, 1], [0.5, 1]);

                    return (
                        <g key={node.id}>
                            <circle
                                cx={x} cy={y}
                                r={node.size * scale}
                                fill={colors.secondary}
                                opacity={pulse}
                                filter="url(#nodeGlow)"
                            />
                        </g>
                    );
                })}

                {/* High-speed Data Packets */}
                {dataPackets.map((p) => {
                    const from = nodes[p.from];
                    const to = nodes[p.to];
                    const progress = (loopProgress * 10 + p.offset) % 1;
                    const x = interpolate(progress, [0, 1], [from.x, to.x]);
                    const y = interpolate(progress, [0, 1], [from.y, to.y]);

                    return (
                        <circle
                            key={`packet-${p.id}`}
                            cx={x} cy={y}
                            r={5 * scale}
                            fill={colors.text}
                            filter="url(#nodeGlow)"
                        />
                    );
                })}
            </svg>

            {/* 3. Floating HUD Elements */}
            <div style={{
                position: 'absolute',
                top: 100 * scale,
                left: 100 * scale,
                borderLeft: `4px solid ${colors.primary}`,
                paddingLeft: 30 * scale,
                color: colors.text,
            }}>
                <div style={{ fontSize: 24 * scale, fontWeight: 'bold', letterSpacing: 8 * scale, color: colors.primary }}>
                    COGNITIVE_CORE_V8
                </div>
                <div style={{ fontSize: 80 * scale, fontWeight: 900, lineHeight: 1.1 }}>
                    NEURAL<br />INTERFACE
                </div>
            </div>

            {/* 4. Bottom Metric Panel (Glassmorphism) */}
            <div style={{
                position: 'absolute',
                bottom: 100 * scale,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: 120 * scale,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 20 * scale,
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: `0 ${60 * scale}px`,
            }}>
                <StatItem label="SYNC_RATE" value="99.98%" scale={scale} />
                <StatItem label="LATENCY" value="0.4ms" scale={scale} />
                <StatItem label="NODES_ACTIVE" value="4,096" scale={scale} />
                <StatItem label="BUFFER_HEALTH" value="STABLE" scale={scale} color={colors.secondary} />
            </div>

            {/* 5. Cinematic Overlays */}
            {/* Vignette */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: `inset 0 0 ${600 * scale}px rgba(0,0,0,0.9)`,
                pointerEvents: 'none',
            }} />

            {/* Subtle Noise */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.02,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};

const StatItem: React.FC<{ label: string, value: string, scale: number, color?: string }> = ({ label, value, scale, color }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 * scale, fontWeight: 'bold', letterSpacing: 2 * scale }}>
            {label}
        </div>
        <div style={{ color: color || colors.text, fontSize: 36 * scale, fontWeight: 900 }}>
            {value}
        </div>
    </div>
);