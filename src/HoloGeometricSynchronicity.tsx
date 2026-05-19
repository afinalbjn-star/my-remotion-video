import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
    Easing,
} from 'remotion';

const colors = {
    bg: '#020617',
    primary: '#22d3ee', // Cyan
    secondary: '#1e293b',
    accent: '#ffffff',
    grid: 'rgba(34, 211, 238, 0.05)',
    sales: '#10b981',   // Emerald untuk Penjualan
    revenue: '#fbbf24', // Amber untuk Pendapatan 
    market: '#f472b6',  // Pink untuk Market
};

export const HoloGeometricSynchronicity: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const scale = height / 2160;

    // Loop progress 0 to 1
    const progress = frame / durationInFrames;

    // Generate deterministic 3D-like points for a complex mesh
    const points = useMemo(() => {
        const pts = [];
        const numPoints = 80;
        const categories = [
            { label: 'MAX_SALES', color: colors.sales },
            { label: 'TOP_REVENUE', color: colors.revenue },
            { label: 'MARKET_LEAD', color: colors.market },
        ];

        for (let i = 0; i < numPoints; i++) {
            const isKeyNode = i % 25 === 0; // Tentukan beberapa node sebagai node kunci
            pts.push({
                phi: Math.acos(-1 + (2 * i) / numPoints),
                theta: Math.sqrt(numPoints * Math.PI) * Math.acos(-1 + (2 * i) / numPoints),
                id: i,
                isCore: i % 4 === 0, // Identifikasi beberapa titik sebagai bagian dari core
                isKeyNode,
                category: isKeyNode ? categories[(i / 25) % categories.length] : null,
            });
        }
        return pts;
    }, []);

    // Background floating data particles
    const particles = useMemo(() => {
        return Array.from({ length: 120 }).map((_, i) => ({
            id: i,
            x: random(`p-x-${i}`) * width,
            y: random(`p-y-${i}`) * height,
            z: random(`p-z-${i}`),
            speed: 0.5 + random(`p-s-${i}`) * 2,
        }));
    }, [width, height]);

    // Camera Dynamics (Subtle Sway)
    const cameraSwayX = Math.sin(frame * 0.01) * 20 * scale;
    const cameraSwayY = Math.cos(frame * 0.015) * 15 * scale;
    const cameraZoom = interpolate(Math.sin(frame * 0.005), [-1, 1], [0.98, 1.02]);

    return (
        <AbsoluteFill style={{ backgroundColor: colors.bg, overflow: 'hidden', fontFamily: 'Inter, monospace' }}>
            {/* 1. Perspective Floor Grid */}
            <div style={{
                position: 'absolute',
                inset: -500,
                backgroundImage: `
                    linear-gradient(${colors.grid} 2px, transparent 2px),
                    linear-gradient(90deg, ${colors.grid} 2px, transparent 2px)
                `,
                backgroundSize: `${150 * scale}px ${150 * scale}px`,
                transform: `perspective(1200px) rotateX(75deg) translateY(${(progress * 600 * scale) % (150 * scale)}px)`,
                maskImage: 'linear-gradient(to bottom, transparent, black 50%)',
                opacity: 0.5,
            }} />

            {/* 2. Floating Background Particles */}
            {particles.map((p) => {
                const yPos = (p.y - frame * p.speed) % height;
                const opacity = interpolate(p.z, [0, 1], [0.1, 0.4]);
                const blur = interpolate(p.z, [0, 1], [2, 8]) * scale;

                return (
                    <div key={p.id} style={{
                        position: 'absolute',
                        left: p.x,
                        top: yPos < 0 ? yPos + height : yPos,
                        width: 4 * scale,
                        height: 4 * scale,
                        backgroundColor: colors.primary,
                        borderRadius: '50%',
                        filter: `blur(${blur}px)`,
                        opacity,
                    }} />
                );
            })}

            {/* 3. Central 3D Mesh Structure */}
            <svg width={width} height={height} style={{ position: 'absolute' }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation={15 * scale} result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <g transform={`translate(${width / 2 + cameraSwayX}, ${height / 2 + cameraSwayY}) scale(${cameraZoom})`}>
                    {points.map((pt, i) => {
                        // Rotate points in 3D space with complex modulation
                        const rotationSpeed = progress * Math.PI * 2;
                        const breathe = Math.sin(frame * 0.05) * 0.05; // Titik bergerak sedikit membesar/mengecil
                        const radiusMult = pt.isCore ? 0.4 : (1 + breathe);

                        const x = Math.sin(pt.phi + rotationSpeed) * Math.cos(pt.theta + rotationSpeed * 0.5) * radiusMult;
                        const y = Math.cos(pt.phi + rotationSpeed) * radiusMult;
                        const z = Math.sin(pt.phi + rotationSpeed) * Math.sin(pt.theta + rotationSpeed * 0.5) * radiusMult;

                        // Project to 2D
                        const size = 900 * scale * (z + 2) / 2;
                        const px = x * size;
                        const py = y * size;
                        const opacity = interpolate(z, [-1, 1], [0.1, 0.8]);

                        const nodeColor = pt.isKeyNode ? pt.category?.color : colors.primary;

                        return (
                            <React.Fragment key={pt.id}>
                                {/* Professional mesh lines with selective connection */}
                                {points.slice(i + 1, i + (pt.isCore ? 2 : 3)).map((nextPt, j) => {
                                    const nRadiusMult = nextPt.isCore ? 0.4 : (1 + breathe);
                                    const nx = Math.sin(nextPt.phi + rotationSpeed) * Math.cos(nextPt.theta + rotationSpeed * 0.5) * nRadiusMult;
                                    const ny = Math.cos(nextPt.phi + rotationSpeed) * nRadiusMult;
                                    const nz = Math.sin(nextPt.phi + rotationSpeed) * Math.sin(nextPt.theta + rotationSpeed * 0.5) * nRadiusMult;
                                    const nSize = 900 * scale * (nz + 2) / 2;

                                    return (
                                        <line
                                            key={`l-${i}-${j}`}
                                            x1={px} y1={py}
                                            x2={nx * nSize} y2={ny * nSize}
                                            stroke={colors.primary}
                                            strokeWidth={4 * scale}
                                            opacity={opacity * 0.3}
                                        />
                                    );
                                })}
                                <circle
                                    cx={px} cy={py}
                                    r={4 * scale * (z + 2)}
                                    fill={nodeColor}
                                    opacity={opacity}
                                    filter="url(#glow)"
                                />

                                {/* 3.1 Data Labels for Key Nodes */}
                                {pt.isKeyNode && pt.category && opacity > 0.5 && (
                                    <g>
                                        {/* Callout Line */}
                                        <path
                                            d={`M ${px},${py} L ${px + 40 * scale * (x > 0 ? 1 : -1)},${py - 40 * scale} L ${px + 120 * scale * (x > 0 ? 1 : -1)},${py - 40 * scale}`}
                                            fill="none"
                                            stroke={pt.category.color}
                                            strokeWidth={2 * scale}
                                            opacity={opacity}
                                        />
                                        {/* Label Text */}
                                        <text
                                            x={px + 45 * scale * (x > 0 ? 1 : -1)}
                                            y={py - 50 * scale}
                                            fill={pt.category.color}
                                            fontSize={16 * scale}
                                            fontWeight="900"
                                            textAnchor={x > 0 ? "start" : "end"}
                                            opacity={opacity}
                                            style={{ fontFamily: 'monospace', letterSpacing: 2 * scale }}
                                        >
                                            {pt.category.label}
                                        </text>
                                    </g>
                                )}
                            </React.Fragment>
                        );
                    })}
                </g>
            </svg>

            {/* Horizon Scanner Line (Subtle Static) */}
            <div style={{
                position: 'absolute',
                top: '50%',
                width: '100%',
                height: 3 * scale,
                backgroundColor: colors.primary,
                opacity: 0.1,
                boxShadow: `0 0 ${20 * scale}px ${colors.primary}`,
            }} />

            {/* 4. Professional HUD Overlays */}
            <HUDCorner position="top-left" scale={scale} frame={frame} />
            <HUDCorner position="top-right" scale={scale} frame={frame} />
            <HUDCorner position="bottom-left" scale={scale} frame={frame} />
            <div style={{ position: 'absolute', top: 100 * scale, right: 100 * scale, opacity: 0.3, color: colors.primary, fontSize: 14 * scale, letterSpacing: 4 * scale }}>
                SCAN_TYPE: VOLUMETRIC_MESH_v.8.2
            </div>

            {/* Central Data Readout */}
            <div style={{
                position: 'absolute',
                bottom: 100 * scale,
                right: 100 * scale,
                textAlign: 'right',
                color: colors.accent,
                borderRight: `4px solid ${colors.primary}`,
                paddingRight: 40 * scale,
            }}>
                <div style={{ fontSize: 24 * scale, fontWeight: 'bold', letterSpacing: 10 * scale, opacity: 0.5 }}>SYSTEM_CALIBRATION</div>
                <div style={{ fontSize: 64 * scale, fontWeight: 900 }}>CORE_STABLE_4K</div>
                <div style={{ fontSize: 18 * scale, opacity: 0.7, marginTop: 10 * scale }}>
                    LAT: 35.6895° N // LONG: 139.6917° E // FR: 60FPS
                </div>
            </div>

            {/* Cinematic Vignette & Grain */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: `inset 0 0 ${800 * scale}px rgba(0,0,0,1)`,
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};

const HUDCorner: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left', scale: number, frame: number }> = ({ position, scale, frame }) => {
    const isTopLeft = position === 'top-left';
    const isTopRight = position === 'top-right';

    const dynamicVal = Math.floor(random(Math.floor(frame / 3).toString()) * 1000000).toString(16).toUpperCase();

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: position.includes('top') ? 100 * scale : 'auto',
        bottom: position.includes('bottom') ? 100 * scale : 'auto',
        left: position.includes('left') ? 100 * scale : 'auto',
        right: position.includes('right') ? 100 * scale : 'auto',
        color: colors.primary,
        fontSize: 16 * scale,
        letterSpacing: 2 * scale,
        zIndex: 100,
    };

    if (isTopLeft) {
        return (
            <div style={containerStyle}>
                <div style={{ fontWeight: 'bold', marginBottom: 10 * scale, fontFamily: 'monospace' }}>
                    NODE_ID: 0x{dynamicVal}
                </div>
                <div style={{ width: 100 * scale, height: 2, backgroundColor: colors.primary, opacity: 0.3 }} />
                <div style={{ marginTop: 10 * scale, opacity: 0.6, fontSize: 12 * scale }}>INITIALIZING_SEQUENCE...</div>
            </div>
        );
    }

    if (isTopRight) {
        return (
            <div style={{ ...containerStyle, textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: 10 * scale, justifyContent: 'flex-end' }}>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} style={{
                            width: 15 * scale,
                            height: 15 * scale,
                            border: `1px solid ${colors.primary}`,
                            backgroundColor: random(`block-${i}-${Math.floor(frame / 10)}`) > 0.5 ? colors.primary : 'transparent'
                        }} />
                    ))}
                </div>
                <div style={{ marginTop: 20 * scale, fontWeight: 900, fontSize: 32 * scale }}>99.9% SYNC</div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 * scale }}>
                {Array.from({ length: 12 }).map((_, i) => {
                    const h = interpolate(Math.sin(frame * 0.1 + i), [-1, 1], [10, 50]) * scale;
                    return (
                        <div key={i} style={{
                            width: 6 * scale,
                            height: h,
                            backgroundColor: colors.primary,
                            opacity: interpolate(i, [0, 12], [1, 0.2]),
                        }} />
                    );
                })}
                <div style={{ marginLeft: 10 * scale }}>
                    <div style={{ fontSize: 12 * scale, opacity: 0.5 }}>FREQ_MOD</div>
                    <div style={{ fontWeight: 'bold' }}>2.484 GHz</div>
                </div>
            </div>
        </div>
    );
};