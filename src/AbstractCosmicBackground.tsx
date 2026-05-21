import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

// Hook Kunci untuk Seamless Loop
const useSeamlessLoop = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const t = frame / durationInFrames;
    const angle = t * Math.PI * 2; // 0 to 2π
    return { t, angle };
};

export const AbstractCosmicBackground: React.FC = () => {
    const { width, height } = useVideoConfig();
    const { angle } = useSeamlessLoop();

    // Pre-generate data statis agar tidak berubah setiap frame (deterministic)
    const stars = useMemo(() => {
        return Array.from({ length: 2000 }).map((_, i) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            phase: Math.random() * Math.PI * 2,
        }));
    }, [width, height]);

    const orbitalParticles = useMemo(() => {
        return Array.from({ length: 40 }).map((_, i) => ({
            radiusX: Math.random() * 1000 + 400,
            radiusY: Math.random() * 600 + 200,
            speed: (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1), // Integer speed for loop
            size: Math.random() * 15 + 5,
            color: i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#9d00ff' : '#ff007f',
            offset: Math.random() * Math.PI * 2,
        }));
    }, []);

    const cosmicDust = useMemo(() => {
        return Array.from({ length: 800 }).map((_, i) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.2,
            // Menggunakan integer speed agar loop tetap seamless
            speed: Math.floor(Math.random() * 2) + 1,
            offset: Math.random() * Math.PI * 2,
        }));
    }, [width, height]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#010208', overflow: 'hidden' }}>
            {/* LAYER 1: Background Deep Space Gradient */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at ${50 + Math.sin(angle) * 5}% ${50 + Math.cos(angle) * 5}%, #0c005a 0%, #010208 85%)`,
                opacity: 0.8
            }} />

            {/* LAYER 2: Nebula Canvas 2D (Simplified via SVG for performance consistency) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                filter: 'blur(120px)',
                opacity: 0.4
            }}>
                <div style={{
                    position: 'absolute',
                    width: '120%', height: '120%',
                    top: '-10%', left: '-10%',
                    background: 'radial-gradient(ellipse at center, #4c1d95 0%, transparent 70%)',
                    transform: `translate(${Math.sin(angle) * 100}px, ${Math.cos(angle) * 80}px)`
                }} />
            </div>

            {/* LAYER 3, 4, 5 menggunakan SVG Canvas */}
            <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Dynamic Aurora Filter */}
                    <filter id="auroraFilter" x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence
                            type="fractalNoise"
                            // Mengubah frekuensi secara halus untuk efek riak air/gas
                            baseFrequency={`${0.002 + Math.sin(angle) * 0.001} ${0.01 + Math.cos(angle) * 0.005}`}
                            numOctaves="3"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            // Mengontrol intensitas distorsi aurora
                            scale={150 + Math.sin(angle) * 50}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                        <feGaussianBlur stdDeviation="15" />
                    </filter>
                </defs>

                {/* LAYER 3: Aurora SVG Rays */}
                <g opacity={0.4} filter="url(#auroraFilter)">
                    {[1, 2, 3].map((i) => (
                        <path
                            key={i}
                            d={`M ${width * 0.1} ${height * 1.1} Q ${width * 0.5} ${height * (0.1 * i)} ${width * 0.9} ${height * 1.1}`}
                            fill="none"
                            stroke={i === 1 ? '#00f0ff' : '#39ff14'}
                            strokeWidth={150 / i}
                            strokeDasharray="20 30"
                            transform={`translate(${Math.sin(angle + i) * 50}, ${Math.cos(angle * 0.5 + i) * 30})`}
                        />
                    ))}

                    {/* Partikel Debu Kosmik yang mengikuti arus filter Aurora */}
                    {cosmicDust.map((dust, i) => {
                        const driftX = Math.sin(angle * dust.speed + dust.offset) * 40;
                        const driftY = Math.cos(angle * 0.5 * dust.speed + dust.offset) * 30;

                        return (
                            <circle
                                key={`dust-${i}`}
                                cx={dust.x}
                                cy={dust.y}
                                r={dust.size}
                                fill="white"
                                opacity={0.5}
                                transform={`translate(${driftX}, ${driftY})`}
                            />
                        );
                    })}
                </g>

                {/* LAYER 4: Starfield (~2000 Bintang) */}
                {stars.map((star, i) => (
                    <circle
                        key={i}
                        cx={star.x}
                        cy={star.y}
                        r={star.size}
                        fill="white"
                        // Twinkle effect yang seamless
                        opacity={0.2 + (Math.sin(angle * 3 + star.phase) * 0.5 + 0.5) * 0.8}
                    />
                ))}

                {/* LAYER 5: Floating Orbital Particles */}
                {orbitalParticles.map((p, i) => {
                    // Gerakan orbit elips yang sempurna looping
                    const x = width / 2 + Math.cos(angle * p.speed + p.offset) * p.radiusX;
                    const y = height / 2 + Math.sin(angle * p.speed + p.offset) * p.radiusY;

                    return (
                        <g key={i} filter="url(#glow)">
                            <circle
                                cx={x}
                                cy={y}
                                r={p.size}
                                fill={p.color}
                                opacity={0.6}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* LAYER 5.5: Periodic Lens Flare (Center) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // Muncul secara periodik dengan kurva tajam menggunakan Math.pow
                opacity: Math.pow(Math.max(0, Math.sin(angle)), 6),
                pointerEvents: 'none',
                mixBlendMode: 'screen',
            }}>
                {/* Horizontal Flare Streak */}
                <div style={{
                    position: 'absolute',
                    width: width * 0.7,
                    height: 4,
                    background: 'radial-gradient(ellipse at center, #ffffff 0%, #00f0ff 50%, transparent 100%)',
                    filter: 'blur(4px)',
                }} />
                {/* Central Flare Glow */}
                <div style={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    background: 'radial-gradient(circle, #ffffff 0%, #00f0ff 25%, transparent 70%)',
                    filter: 'blur(40px)',
                }} />
            </div>

            {/* LAYER 6: Vignette / Depth Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none'
            }} />

            {/* Technical HUD Overlay (Optional) */}
            <div style={{
                position: 'absolute',
                bottom: 100, left: 100,
                color: '#00f0ff', fontFamily: 'monospace', fontSize: 24,
                borderLeft: '4px solid #00f0ff', paddingLeft: 20, opacity: 0.5
            }}>
                COSMIC_ENGINE_STABLE: 4K_60FPS // LOOP_ACTIVE
            </div>
        </AbsoluteFill>
    );
};