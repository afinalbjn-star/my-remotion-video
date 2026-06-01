import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

export const SeamlessLoopBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();

    // 1. Logika Seamless Loop (0 ke 1)
    const progress = frame / durationInFrames;

    // 2. Animasi Grid (Bergerak maju)
    // Kita menggerakkan background-position sejauh ukuran grid (100px)
    const gridOffset = interpolate(progress, [0, 1], [0, 100]);

    // 3. Partikel Floating (Berbasis Sinus agar loop sempurna)
    const particles = Array.from({ length: 20 }).map((_, i) => {
        const seed = i * 123.45;
        const x = (Math.sin(seed) * 0.5 + 0.5) * width;
        const y = (Math.cos(seed) * 0.5 + 0.5) * height;

        // Opacity berdenyut: sin(progress * PI * 2) akan mulai di 0, naik, dan kembali ke 0
        const opacity = Math.sin(progress * Math.PI * 2 + seed) * 0.3 + 0.4;
        const scale = Math.sin(progress * Math.PI * 2 + seed) * 0.5 + 1;

        return { x, y, opacity, scale };
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#020617',
                overflow: 'hidden',
            }}
        >
            {/* Layer 1: Radial Glow Background */}
            <div
                style={{
                    position: 'absolute',
                    inset: -200,
                    background: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 70%)',
                    opacity: 0.8,
                }}
            />

            {/* Layer 2: 3D Perspective Grid */}
            <div
                style={{
                    position: 'absolute',
                    width: '200%',
                    height: '200%',
                    top: '-50%',
                    left: '-50%',
                    backgroundImage: `
						linear-gradient(to right, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
						linear-gradient(to bottom, rgba(99, 102, 241, 0.2) 1px, transparent 1px)
					`,
                    backgroundSize: '100px 100px',
                    backgroundPosition: `0px ${gridOffset}px`,
                    transform: 'perspective(800px) rotateX(60deg)',
                    maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 80%, transparent)',
                }}
            />

            {/* Layer 3: Floating Bokeh Particles */}
            <svg
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                }}
            >
                {particles.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={10 * p.scale}
                        fill="#818cf8"
                        style={{
                            opacity: p.opacity,
                            filter: 'blur(8px)',
                        }}
                    />
                ))}
            </svg>

            {/* Layer 4: Vignette & Bloom Effect */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 150px 50px #020617',
                    pointerEvents: 'none',
                }}
            />

            {/* Overlay Text (Optional for Preview) */}
            <div style={{
                position: 'absolute',
                width: '100%',
                bottom: 100,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.1)',
                fontFamily: 'sans-serif',
                letterSpacing: '10px'
            }}>ABSTRACT FLOW</div>
        </AbsoluteFill>
    );
};
