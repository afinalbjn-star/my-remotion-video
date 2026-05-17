import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const SwirlingVortex: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // 1. Logika Loop (0 ke 360 derajat)
    const rotation = interpolate(frame, [0, durationInFrames], [0, 360]);
    const pulse = Math.sin((frame / durationInFrames) * Math.PI * 2);

    // Warna Retro Pop
    const colors = ['#ff007f', '#7df9ff', '#ffff00', '#3f00ff'];

    return (
        <AbsoluteFill style={{ backgroundColor: '#05051a', overflow: 'hidden' }}>
            {/* Filter SVG untuk efek 'Liquid/Tsunami' */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="vortexFilter">
                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.01"
                            numOctaves="3"
                            seed="5"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale={200 + pulse * 100}
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="displaced"
                        />
                        <feColorMatrix
                            in="displaced"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.5 0"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Layer Pusaran Utma */}
            <div
                style={{
                    position: 'absolute',
                    width: width * 2,
                    height: width * 2,
                    left: -width * 0.5,
                    top: -height * 0.7,
                    filter: 'url(#vortexFilter) blur(2px)',
                    transform: `rotate(${rotation}deg)`,
                }}
            >
                {/* Membuat pita-pita warna yang memutar */}
                {Array.from({ length: 16 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            inset: i * 40,
                            border: `60px solid ${colors[i % colors.length]}`,
                            borderRadius: '45% 55% 40% 60% / 55% 45% 55% 45%', // Organik shape
                            transform: `rotate(${i * 20 + rotation * (i % 2 === 0 ? 1 : -0.8)}deg) scale(${1 + i * 0.02})`,
                            opacity: 0.9,
                            boxShadow: `0 0 60px ${colors[i % colors.length]}, inset 0 0 30px ${colors[i % colors.length]}`,
                            mixBlendMode: 'plus-lighter'
                        }}
                    />
                ))}
            </div>

            {/* Pusat Suction (Lubang Hitam Pusaran) */}
            <div
                style={{
                    position: 'absolute',
                    width: 600,
                    height: 600,
                    left: width / 2 - 200,
                    top: height / 2 - 200,
                    background: 'radial-gradient(circle, #000 0%, transparent 80%)',
                    zIndex: 10,
                }}
            />

            {/* Overlay Chromatic Aberration */}
            <div
                style={{
                    position: 'absolute',
                    inset: -100,
                    boxShadow: 'inset 0 0 200px rgba(255, 0, 127, 0.2)',
                    pointerEvents: 'none',
                    mixBlendMode: 'hard-light',
                }}
            />

            {/* Frame Border ala Retro Pop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 40,
                    border: '2px solid rgba(125, 249, 255, 0.3)',
                    pointerEvents: 'none',
                }}
            />

            {/* Overlay Gradient tambahan untuk kedalaman warna */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 20%, rgba(5, 5, 26, 0.8) 90%)',
                pointerEvents: 'none',
            }} />

            <div style={{
                position: 'absolute',
                bottom: 60,
                width: '100%',
                textAlign: 'center',
                color: 'white',
                fontFamily: 'system-ui',
                letterSpacing: '20px',
                opacity: 0.4,
                fontSize: 24,
            }}>RETRO VORTEX</div>
        </AbsoluteFill>
    );
};