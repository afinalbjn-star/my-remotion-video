import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

const PARTICLE_COUNT = 350;
const CYAN_COLOR = '#00ffff';
const WHITE_COLOR = '#ffffff';
const DEEP_BLUE_START = '#020617';
const DEEP_BLUE_END = '#041d45';

interface Particle {
    id: number;
    x: number;
    yInitial: number;
    size: number;
    depth: number; // 0 = depan (tajam), 1 = belakang (bokeh blur)
    blinkSpeed: number;
    blinkPhase: number;
    driftSpeed: number;
    color: string;
}

const GlowCircle: React.FC<{ particle: Particle }> = ({ particle }) => {
    const frame = useCurrentFrame();
    const { height, durationInFrames } = useVideoConfig();

    // Seamless vertical movement
    const yProgress = (frame / durationInFrames) * particle.driftSpeed;
    const yPos = (particle.yInitial + yProgress * height) % (height + 400) - 200;

    // Seamless flickering logic
    // Menggunakan Math.sin dengan kelipatan PI*2 agar loop sempurna
    const flicker = Math.sin((frame / durationInFrames) * Math.PI * 2 * particle.blinkSpeed + particle.blinkPhase);
    const opacity = interpolate(flicker, [-1, 1], [0.1, 0.8]);

    // Depth of Field Logic:
    // Partikel terjauh (depth dekat 1) = sangat buram, ukuran visual lebih besar (bokeh)
    // Partikel terdekat (depth dekat 0) = sangat tajam, ukuran lebih kecil/terfokus
    const blurAmount = interpolate(particle.depth, [0, 0.5, 1], [0, 4, 55]);
    const scale = interpolate(particle.depth, [0, 1], [0.8, 2.5]);
    const finalSize = particle.size * scale;

    return (
        <div
            style={{
                position: 'absolute',
                left: particle.x,
                top: yPos,
                width: finalSize,
                height: finalSize,
                backgroundColor: particle.color,
                borderRadius: '50%',
                opacity: opacity,
                filter: `blur(${blurAmount}px)`,
                boxShadow: `0 0 ${finalSize * 0.5}px ${particle.color}`,
                transform: 'translate(-50%, -50%)',
            }}
        />
    );
};

export const RoyalChristmasBackground: React.FC = () => {
    const { width, height } = useVideoConfig();

    const particles = useMemo(() => {
        return new Array(PARTICLE_COUNT).fill(0).map((_, i) => {
            const seed = i * 9.55;
            const depth = random(seed + 1); // Random depth 0 to 1

            return {
                id: i,
                x: random(seed + 2) * width,
                yInitial: random(seed + 3) * height,
                size: interpolate(random(seed + 4), [0, 1], [15, 60]),
                depth: depth,
                // Blink speed harus integer agar seamless loop
                blinkSpeed: Math.floor(random(seed + 5) * 3) + 1,
                blinkPhase: random(seed + 6) * Math.PI * 2,
                // Drift speed harus integer per durasi video agar seamless
                driftSpeed: (Math.floor(random(seed + 7) * 2) + 1) * (random(seed + 8) > 0.5 ? 1 : -1),
                color: random(seed + 9) > 0.6 ? WHITE_COLOR : CYAN_COLOR,
            };
        });
    }, [width, height]);

    return (
        <AbsoluteFill style={{ backgroundColor: DEEP_BLUE_START }}>
            {/* Gradasi Royal Blue yang Kaya dan Elegan */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at center, ${DEEP_BLUE_END} 0%, ${DEEP_BLUE_START} 100%)`,
                }}
            />

            {/* Layering Partikel berdasarkan Depth (Z-Index simulasi) */}
            {/* Kita urutkan agar yang blur (bokeh) berada di belakang yang tajam */}
            {particles
                .sort((a, b) => b.depth - a.depth)
                .map((p) => (
                    <GlowCircle key={p.id} particle={p} />
                ))}

            {/* Overlay Vignette untuk kesan mewah */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.6) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Soft Glow Overlay untuk atmosfer Natal */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 500px rgba(0, 255, 255, 0.05)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};