import React, { useMemo } from 'react';
import {
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    Easing,
} from 'remotion';

const CELL_COUNT = 40;
const PARTICLE_COUNT = 60;

const BloodCell: React.FC<{ seed: number; layer: 'back' | 'mid' | 'front' }> = ({ seed, layer }) => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();

    const random = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    const config = useMemo(() => {
        const r = random(seed);
        return {
            x: random(seed * 1.1) * width,
            y: random(seed * 2.2) * height,
            size: layer === 'front' ? 400 + r * 200 : layer === 'mid' ? 150 + r * 150 : 50 + r * 100,
            speed: 0.5 + r * 1.5,
            offset: r * durationInFrames,
            rotation: r * 360,
            drift: (r - 0.5) * 300,
        };
    }, [seed, width, height, durationInFrames, layer]);

    const progression = ((frame * config.speed + config.offset) % durationInFrames) / durationInFrames;
    const t = frame / 60;

    // Pergerakan melayang (Organic drift)
    const driftX = Math.sin(t * 0.5 + seed) * 50;
    const driftY = Math.cos(t * 0.3 + seed) * 30;

    const scale = layer === 'front'
        ? interpolate(progression, [0, 1], [1.5, 4])
        : interpolate(progression, [0, 1], [0.5, 1.5]);

    const opacity = interpolate(progression, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const posX = interpolate(progression, [0, 1], [config.x - 400, config.x + 400]) + driftX;

    // Efek Blur berdasarkan layer untuk kedalaman sinematik
    const blur = layer === 'front' ? 15 : layer === 'back' ? 8 : 0;

    return (
        <div
            style={{
                position: 'absolute',
                width: config.size,
                height: config.size,
                left: `${posX}px`,
                top: `${config.y + driftY}px`,
                backgroundColor: '#b30000',
                borderRadius: '50%',
                boxShadow: `inset 20px 20px 60px rgba(0,0,0,0.8), inset -20px -20px 60px rgba(255,50,50,0.3), 0 0 40px rgba(150,0,0,0.2)`,
                opacity,
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${config.rotation + progression * 90}deg)`,
                filter: `blur(${blur}px)`,
            }}
        >
            <div style={{
                position: 'absolute',
                top: '25%',
                left: '25%',
                width: '50%',
                height: '50%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, transparent 70%)',
            }} />
        </div>
    );
};

const MicroParticle: React.FC<{ seed: number }> = ({ seed }) => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();
    const progression = ((frame + seed * 100) % durationInFrames) / durationInFrames;
    const x = (seed * 137.5) % 1 * width;
    const y = (seed * 243.1) % 1 * height;
    const opacity = interpolate(progression, [0, 0.5, 1], [0, 0.6, 0]);

    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y + Math.sin(frame * 0.05 + seed) * 100,
            width: 4,
            height: 4,
            backgroundColor: '#ff9999',
            borderRadius: '50%',
            opacity,
            filter: 'blur(1px)',
        }} />
    );
};

export const BloodStream: React.FC = () => {
    const frame = useCurrentFrame();
    const t = frame / 60;

    // Efek "Pulsing Light" di latar belakang
    const lightPulse = interpolate(Math.sin(t * 0.5), [-1, 1], [0.3, 0.7]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#050000' }}>
            {/* Plasma Backdrop */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at ${50 + Math.sin(t) * 10}% ${50 + Math.cos(t) * 10}%, #2a0000 0%, #050000 100%)`,
                opacity: lightPulse,
            }} />

            {/* Back Layer (Small, Blurry) */}
            {new Array(CELL_COUNT / 2).fill(0).map((_, i) => (
                <BloodCell key={`back-${i}`} seed={i + 100} layer="back" />
            ))}

            {/* Micro Particles (The mystery detail) */}
            {new Array(PARTICLE_COUNT).fill(0).map((_, i) => (
                <MicroParticle key={i} seed={i} />
            ))}

            {/* Mid Layer (Focus) */}
            {new Array(CELL_COUNT).fill(0).map((_, i) => (
                <BloodCell key={`mid-${i}`} seed={i} layer="mid" />
            ))}

            {/* Front Layer (Large, Out of focus bokeh) */}
            {new Array(5).fill(0).map((_, i) => (
                <BloodCell key={`front-${i}`} seed={i + 500} layer="front" />
            ))}

            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 30%, rgba(0, 0, 0, 0.8) 100%)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};