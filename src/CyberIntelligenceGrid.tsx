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
    bg: '#020617',
    primary: '#0ea5e9',
    secondary: '#22d3ee',
    accent: '#818cf8',
    text: '#f8fafc',
    grid: 'rgba(14, 165, 233, 0.3)',
};

export const CyberIntelligenceGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const scale = height / 2160;

    // Global loop progress (0 to 1)
    const loopProgress = frame / durationInFrames;

    // Generate deterministic nodes for the neural network
    const nodes = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: random(`node-x-${i}`) * width,
            y: random(`node-y-${i}`) * height,
            z: random(`node-z-${i}`),
            phase: random(`node-p-${i}`) * Math.PI * 2,
        }));
    }, [width, height]);

    // Generate random data packets moving along connections
    const packets = useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            from: Math.floor(random(`p-f-${i}`) * nodes.length),
            to: Math.floor(random(`p-t-${i}`) * nodes.length),
            speed: 0.1 + random(`p-s-${i}`) * 0.2,
            offset: random(`p-o-${i}`),
        }));
    }, [nodes]);

    // Generate 200 random particles for high-entropy background
    const backgroundParticles = useMemo(() => {
        return Array.from({ length: 200 }).map((_, i) => ({
            x: random(`bg-p-x-${i}`) * width,
            y: random(`bg-p-y-${i}`) * height,
            size: random(`bg-p-s-${i}`) * 3 + 1,
            speed: random(`bg-p-sp-${i}`) * 2 + 0.5,
            opacity: random(`bg-p-o-${i}`) * 0.5 + 0.2,
        }));
    }, [width, height]);

    return (
        <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden', fontFamily: 'monospace' }}>
            {/* 1. Deep Background Grid with Parallax */}
            <div style={{
                position: 'absolute',
                inset: -600,
                backgroundImage: `linear-gradient(${colors.grid} 3px, transparent 3px), linear-gradient(90deg, ${colors.grid} 3px, transparent 3px)`,
                backgroundSize: `${120 * scale}px ${120 * scale}px`,
                transform: `
                    perspective(1000px) 
                    rotateX(20deg) 
                    translateY(${(loopProgress * 480 * scale)}px)
                    translateX(${Math.sin(frame * 0.05) * 5 * scale}px)
                `,
                opacity: 0.5,
            }} />

            {/* Floating Particles - Memaksa Bitrate Tinggi */}
            {backgroundParticles.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: p.x,
                        top: (p.y + frame * p.speed) % height,
                        width: p.size * scale,
                        height: p.size * scale,
                        backgroundColor: colors.primary,
                        opacity: p.opacity,
                        borderRadius: '50%',
                    }}
                />
            ))}

            {/* 2. Neural Connections Layer */}
            <svg width={width} height={height} style={{ position: 'absolute', zIndex: 10 }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation={4 * scale} result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Drawing lines between close nodes */}
                {nodes.map((node, i) => {
                    return nodes.slice(i + 1, i + 4).map((target, j) => {
                        const opacity = interpolate(Math.sin(loopProgress * Math.PI * 2 + node.phase), [-1, 1], [0.15, 0.45]);
                        return (
                            <line
                                key={`l-${i}-${j}`}
                                x1={node.x} y1={node.y}
                                x2={target.x} y2={target.y}
                                stroke={colors.primary}
                                strokeWidth={1.5 * scale}
                                opacity={opacity}
                            />
                        );
                    });
                })}

                {/* 2.1 Neural Nodes and Numeric Data */}
                {nodes.map((node) => {
                    const pulse = interpolate(Math.sin(loopProgress * Math.PI * 2 + node.phase), [-1, 1], [0.8, 1.2]);
                    const dataValue = Math.floor(random(`node-val-${node.id}`) * 100 + Math.sin(loopProgress * Math.PI * 2 + node.id) * 5);
                    const isAlert = dataValue > 90;
                    const nodeColor = isAlert ? '#ef4444' : colors.primary;
                    const hexId = node.id.toString(16).padStart(2, '0').toUpperCase();

                    return (
                        <g key={`node-group-${node.id}`}>
                            <text
                                x={node.x - 15 * scale}
                                y={node.y - 30 * scale}
                                fill={colors.accent}
                                fontSize={12 * scale}
                                fontWeight="bold"
                                style={{ opacity: 0.6 }}
                            >
                                ID_0x{hexId}
                            </text>
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={6 * scale * pulse}
                                fill={nodeColor}
                                opacity={0.8}
                                filter="url(#glow)"
                            />
                            <text
                                x={node.x + 12 * scale}
                                y={node.y - 12 * scale}
                                fill={isAlert ? '#f87171' : colors.secondary}
                                fontSize={18 * scale}
                                fontWeight="bold"
                                style={{ textShadow: '0 0 5px rgba(0,0,0,0.8)' }}
                            >
                                {dataValue}
                            </text>
                            <text
                                x={node.x + 12 * scale}
                                y={node.y + 5 * scale}
                                fill={colors.text}
                                fontSize={10 * scale}
                                opacity={0.3}
                            >
                                [{Math.floor(node.x)}, {Math.floor(node.y)}]
                            </text>
                        </g>
                    );
                })}

                {/* Data Packets Animation */}
                {packets.map((packet) => {
                    const fromNode = nodes[packet.from];
                    const toNode = nodes[packet.to];
                    // Packets now travel much faster (15 cycles per loop)
                    const progress = (loopProgress * 15 + packet.offset) % 1;
                    const px = interpolate(progress, [0, 1], [fromNode.x, toNode.x]);
                    const py = interpolate(progress, [0, 1], [fromNode.y, toNode.y]);

                    return (
                        <circle
                            key={packet.id}
                            cx={px}
                            cy={py}
                            r={10 * scale}
                            fill={colors.secondary}
                            filter="url(#glow)"
                        />
                    );
                })}
            </svg>

            {/* 3. Floating HUD Panels */}
            <HUDPanel side="left" scale={scale} frame={frame} loopProgress={loopProgress} />
            <HUDPanel side="right" scale={scale} frame={frame} loopProgress={loopProgress} />

            {/* 4. Scanning Radar Effect */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 1800 * scale,
                height: 1800 * scale,
                border: `2px solid ${colors.primary}`,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.2,
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '50%',
                    height: 12 * scale,
                    background: `linear-gradient(90deg, transparent, ${colors.secondary})`,
                    transformOrigin: 'left center',
                    // Rotates 10 times per 20 seconds
                    transform: `rotate(${loopProgress * 3600}deg)`,
                }} />
            </div>

            {/* 4.2 DYNAMIC NOISE ENGINE - Memaksa setiap piksel berubah tiap frame */}
            <svg
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.15,
                    mixBlendMode: 'overlay',
                    pointerEvents: 'none',
                    zIndex: 999,
                }}
            >
                <filter id="heavyNoise">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.5"
                        seed={frame}
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#heavyNoise)" />
            </svg>

            {/* 4.1 Horizontal Scanline */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: 4 * scale,
                background: `linear-gradient(90deg, transparent, ${colors.secondary}, transparent)`,
                top: `${(loopProgress * 100)}%`,
                opacity: 0.3,
                zIndex: 200,
                filter: 'blur(2px)',
                pointerEvents: 'none',
            }} />

            {/* 5. Center Core Title */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: colors.text,
                zIndex: 100,
            }}>
                <div style={{ fontSize: 24 * scale, letterSpacing: 15 * scale, opacity: 0.6, marginBottom: 10 * scale }}>INTELLIGENCE_LAYER_V4</div>
                <div style={{ fontSize: 120 * scale, fontWeight: 900, letterSpacing: -2 * scale, textShadow: `0 0 ${40 * scale}px ${colors.primary}66` }}>
                    NEURAL NEXUS
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20 * scale, marginTop: 20 * scale }}>
                    <div style={{ padding: `${10 * scale}px ${20 * scale}px`, border: `1px solid ${colors.secondary}`, fontSize: 18 * scale, color: colors.secondary }}>
                        STATUS: OPTIMIZED
                    </div>
                    <div style={{ padding: `${10 * scale}px ${20 * scale}px`, border: `1px solid ${colors.accent}`, fontSize: 18 * scale, color: colors.accent }}>
                        ENCRYPTION: AES-256
                    </div>
                </div>
            </div>

            {/* Chromatic Aberration Overlay (Subtle, Corner-focused) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 200,
                // Using multiple inset box-shadows to simulate color fringing in corners
                boxShadow: `
                    inset ${-2 * scale}px ${-2 * scale}px 0px rgba(255, 0, 0, 0.08), /* Red shift top-left */
                    inset ${2 * scale}px ${2 * scale}px 0px rgba(0, 255, 255, 0.08)  /* Cyan shift bottom-right */
                `,
                // Mask to apply effect only to corners, fading out towards the center
                maskImage: 'radial-gradient(ellipse 80% 80% at center, transparent 50%, black 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at center, transparent 50%, black 100%)',
            }} />

            {/* Cinematic Vignette */}
            <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${600 * scale}px rgba(0,0,0,0.9)`, pointerEvents: 'none' }} />
        </AbsoluteFill>
    );
};

const HUDPanel: React.FC<{ side: 'left' | 'right', scale: number, frame: number, loopProgress: number }> = ({ side, scale, frame, loopProgress }) => {
    const lines = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        val: Math.floor(random(`hud-${side}-${i}`) * 1000000).toString(16).toUpperCase()
    })), [side]);

    return (
        <div style={{
            position: 'absolute',
            [side]: 100 * scale,
            top: '20%',
            width: 400 * scale,
            padding: 40 * scale,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.grid}`,
            color: colors.primary,
            fontSize: 16 * scale,
            lineHeight: 1.6,
            zIndex: 50,
        }}>
            <div style={{ borderBottom: `1px solid ${colors.primary}`, marginBottom: 20 * scale, fontWeight: 'bold', paddingBottom: 10 * scale }}>
                {side === 'left' ? 'SYS_LOG_STREAM' : 'NODE_MATRIX_STATE'}
            </div>
            {lines.map((line, i) => {
                // Shift lines based on loopProgress
                const shiftedIndex = (i + Math.floor(frame / 10)) % lines.length;
                const currentLine = lines[shiftedIndex];
                return (
                    <div key={i} style={{ opacity: 1 - (i / 15), display: 'flex', justifyContent: 'space-between' }}>
                        <span>0x{currentLine.val}</span>
                        <span style={{ color: colors.secondary }}>{(random(currentLine.val) * 100).toFixed(1)}%</span>
                    </div>
                );
            })}

            {/* Bottom mini graph decoration */}
            <div style={{ marginTop: 30 * scale, height: 60 * scale, display: 'flex', alignItems: 'flex-end', gap: 4 * scale }}>
                {Array.from({ length: 20 }).map((_, i) => {
                    const h = interpolate(
                        Math.sin(loopProgress * Math.PI * 4 + i * 0.5),
                        [-1, 1],
                        [10, 50]
                    ) * scale;
                    return (
                        <div key={i} style={{
                            flex: 1,
                            height: h,
                            backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary,
                            opacity: 0.6
                        }} />
                    );
                })}
            </div>
        </div>
    );
};