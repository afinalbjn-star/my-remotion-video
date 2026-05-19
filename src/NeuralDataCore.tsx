import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
} from 'remotion';

const colors = {
    bg: '#02040a',
    primary: '#00f2ff',
    secondary: '#7000ff',
    accent: '#3b82f6',
    danger: '#ef4444', // Added for alert states in HUD
    text: 'rgba(0, 242, 255, 0.7)',
};

export const NeuralDataCore: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const scale = height / 2160;

    const progress = frame / durationInFrames;

    const maxParticleZ = 4000; // Increased Z-depth for particles
    // Generate Hex Data Particles
    const hexStrings = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            val: Math.floor(random(`hex-${i}`) * 0xFFFFFFF).toString(16).toUpperCase(), // More hex digits for variety
            x: random(`x-${i}`) * width,
            y: random(`y-${i}`) * height,
            z: random(`z-${i}`) * maxParticleZ, // Spread particles across larger Z-depth
            speed: 2 + random(`s-${i}`) * 5,
        }));
    }, [width, height]);

    // Circuit Lines
    const circuits = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            points: Array.from({ length: 4 }).map((__, j) => ({
                x: random(`c-x-${i}-${j}`) * width,
                y: random(`c-y-${i}-${j}`) * height,
            })),
            delay: random(`c-d-${i}`) * 100,
        }));
    }, [width, height]);

    return (
        <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden', fontFamily: 'monospace' }}>
            {/* 1. Infinite Moving Perspective Grid */}
            <div style={{
                position: 'absolute',
                inset: -1000,
                backgroundImage: `
                    linear-gradient(${colors.primary}22 2px, transparent 2px),
                    linear-gradient(90deg, ${colors.primary}44 2px, transparent 2px) // Increased opacity for grid lines
                `,
                backgroundSize: `${300 * scale}px ${300 * scale}px`, // Larger grid cells
                transform: `perspective(1000px) rotateX(65deg) translateY(${(progress * 800 * scale) % (400 * scale)}px)`, // More pronounced movement
                maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)',
            }} />

            {/* 2. Circuit Path Pulses */}
            <svg width={width} height={height} style={{ position: 'absolute', opacity: 0.7 }}> {/* Increased opacity */}
                {circuits.map((c) => {
                    const path = `M ${c.points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                    return (
                        <path
                            key={c.id}
                            d={path}
                            fill="none"
                            stroke={colors.accent} // Changed color for better contrast
                            strokeWidth={4 * scale} // Increased stroke width
                            strokeDasharray="100 1000"
                            strokeDashoffset={-frame * 10 - c.delay}
                        />
                    );
                })}
            </svg>

            {/* 3. Floating Hex Data Clouds */}
            {hexStrings.map((h) => {
                const zPos = (h.z - frame * h.speed) % 1000;
                const opacity = interpolate(zPos, [0, 500, 1000], [0, 0.8, 0]);
                const fontSize = interpolate(zPos, [0, 1000], [80, 20]) * scale;

                return (
                    <div
                        key={h.id}
                        style={{
                            position: 'absolute',
                            left: h.x,
                            top: h.y,
                            color: colors.primary,
                            fontSize,
                            opacity,
                            transform: `translateZ(${zPos}px)`,
                            textShadow: `0 0 ${10 * scale}px ${colors.primary}`,
                            pointerEvents: 'none',
                        }}
                    >
                        0x{h.val}
                    </div>
                );
            })}

            {/* 4. Central Core Glow */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 800 * scale,
                height: 800 * scale,
                background: `radial-gradient(circle, ${colors.secondary}33 0%, transparent 70%)`,
                transform: `translate(-50%, -50%) scale(${1 + Math.sin(frame * 0.02) * 0.05})`, // Subtle pulse animation
                filter: `blur(${100 * scale}px)`,
                opacity: interpolate(Math.sin(frame * 0.05), [-1, 1], [0.3, 0.7]),
            }} />

            {/* Vignette & Grain */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: `inset 0 0 ${600 * scale}px rgba(0,0,0,0.9)`,
                pointerEvents: 'none',
            }} />

            {/* Dynamic Noise Engine (Pseudo-Grain) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none',
            }} />

            {/* Final Border UI */}
            <div style={{
                position: 'absolute',
                inset: 80 * scale,
                border: `1px solid ${colors.primary}22`,
                pointerEvents: 'none',
                zIndex: 100, // Ensure border is on top of other elements
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 40 * scale, height: 40 * scale, borderTop: `4px solid ${colors.primary}`, borderLeft: `4px solid ${colors.primary}` }} />
                <div style={{ position: 'absolute', top: 0, right: 0, width: 40 * scale, height: 40 * scale, borderTop: `4px solid ${colors.primary}`, borderRight: `4px solid ${colors.primary}` }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 40 * scale, height: 40 * scale, borderBottom: `4px solid ${colors.primary}`, borderLeft: `4px solid ${colors.primary}` }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40 * scale, height: 40 * scale, borderBottom: `4px solid ${colors.primary}`, borderRight: `4px solid ${colors.primary}` }} />
            </div>

            {/* Left HUD Panel */}
            <HUDPanel side="left" scale={scale} frame={frame} colors={colors} />

            {/* Right HUD Panel */}
            <HUDPanel side="right" scale={scale} frame={frame} colors={colors} />
        </AbsoluteFill>
    );
};

interface HUDPanelProps {
    side: 'left' | 'right';
    scale: number;
    frame: number;
    colors: typeof colors; // Pass the colors object
}

const HUDPanel: React.FC<HUDPanelProps> = ({ side, scale, frame, colors }) => {
    const dataPoints = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        initialValue: random(`hud-val-${side}-${i}`) * 100,
        speed: random(`hud-speed-${side}-${i}`) * 0.1 + 0.05,
        label: side === 'left' ? `PROC_UNIT_${i.toString().padStart(2, '0')}` : `MEM_ALLOC_${i.toString().padStart(2, '0')}`,
    })), [side]);

    const title = side === 'left' ? 'SYSTEM_STATUS_LOG' : 'RESOURCE_MONITOR';

    return (
        <div style={{
            position: 'absolute',
            top: 100 * scale,
            [side]: 100 * scale,
            width: 400 * scale,
            padding: 30 * scale,
            background: 'rgba(15, 23, 42, 0.6)', // Darker, semi-transparent background
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.primary}88`, // More visible border
            color: colors.text,
            fontSize: 18 * scale,
            lineHeight: 1.5,
            zIndex: 50,
            boxShadow: `0 0 ${20 * scale}px ${colors.primary}33`, // Added subtle glow to HUD
        }}>
            <div style={{
                fontWeight: 'bold',
                letterSpacing: 5 * scale,
                marginBottom: 20 * scale,
                borderBottom: `1px solid ${colors.primary}44`,
                paddingBottom: 10 * scale,
                color: colors.primary,
                textAlign: side === 'right' ? 'right' : 'left', // Align title based on side
            }}>
                {title}
            </div>
            {dataPoints.map((dp) => {
                const animatedValue = (dp.initialValue + Math.sin(frame * dp.speed + dp.id) * 20);
                const barWidth = interpolate(animatedValue, [0, 100], [0, 100]);
                const isAlert = animatedValue > 80;
                const valueColor = isAlert ? colors.danger : colors.accent; // Use danger color for high values

                return (
                    <div key={dp.id} style={{ marginBottom: 10 * scale }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 * scale }}>
                            <span>{dp.label}</span>
                            <span style={{ color: valueColor }}>{animatedValue.toFixed(2)}%</span>
                        </div>
                        <div style={{ width: '100%', height: 6 * scale, backgroundColor: `${colors.primary}22`, marginTop: 5 * scale }}>
                            <div style={{
                                width: `${barWidth}%`,
                                height: '100%',
                                backgroundColor: valueColor,
                                boxShadow: `0 0 ${5 * scale}px ${valueColor}88`, // Glow for bars
                            }} />
                        </div>
                    </div>
                );
            })}
            <div style={{
                marginTop: 20 * scale,
                fontSize: 14 * scale,
                color: colors.text,
                opacity: 0.7,
                textAlign: side === 'right' ? 'right' : 'left', // Align status text based on side
            }}>
                STATUS: <span style={{ color: colors.primary }}>ONLINE</span> | UPTIME: {Math.floor(frame / (60 * 60))}H {Math.floor((frame / 60) % 60)}M
            </div>
        </div>
    );
};