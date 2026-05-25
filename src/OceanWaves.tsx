import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';
import { noise2D } from '@remotion/noise';

interface WaveLayerProps {
    color: string;
    opacity: number;
    amplitude: number;
    frequency: number;
    speed: number;
    yBase: number;
    seed: number;
}

const Wave: React.FC<WaveLayerProps> = ({ color, opacity, amplitude, frequency, speed, yBase, seed }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // t dari 0 ke 2PI untuk seamless loop
    const t = (frame / durationInFrames) * Math.PI * 2;

    const path = useMemo(() => {
        const points: string[] = [];
        const steps = 120; // Resolusi path lebih tinggi untuk 4K agar tidak terlihat patah-patah
        const stepSize = width / steps;

        for (let i = 0; i <= steps; i++) {
            const x = i * stepSize;

            // Sampling noise dalam lingkaran (cos/sin) memastikan nilai awal dan akhir sama persis
            const noiseX = Math.cos(t);
            const noiseY = Math.sin(t);
            const turbulence = noise2D(seed + x * 0.005, noiseX, noiseY) * 40;

            // Dasar gelombang sinus
            const wave1 = Math.sin(x * frequency + t * speed) * amplitude;
            // Pengali kecepatan wave2 harus bilangan bulat (misal: 2) agar seamless
            const wave2 = Math.sin(x * frequency * 2.5 + t * speed * 2) * (amplitude * 0.4);

            const y = (height * yBase) + wave1 + wave2 + turbulence;

            points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
        }

        return `${points.join(' ')} L ${width} ${height} L 0 ${height} Z`;
    }, [width, height, t, amplitude, frequency, speed, yBase, seed]);

    return (
        <path
            d={path}
            fill={color}
            opacity={opacity}
            style={{
                filter: 'drop-shadow(0 -10px 20px rgba(0,0,0,0.2))',
            }}
        />
    );
};

export const OceanWaves: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Efek goyangan kamera (Camera Handheld)
    const t = (frame / durationInFrames) * Math.PI * 2;
    const camX = noise2D(99, Math.cos(t), Math.sin(t)) * 15;
    const camY = noise2D(88, Math.cos(t), Math.sin(t)) * 10;

    return (
        <AbsoluteFill style={{
            backgroundColor: '#000814',
            overflow: 'hidden',
            transform: `translate(${camX}px, ${camY}px) scale(1.05)`
        }}>
            {/* Langit Mendung (Sky) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, #1a2a3a 0%, #000814 60%)',
            }} />

            {/* Kilat / Flash Cahaya (Ambient Lightning) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#fff',
                opacity: interpolate(Math.sin(t * 2), [0.9, 1], [0, 0.05], { extrapolateLeft: 'clamp' }),
                pointerEvents: 'none',
            }} />

            <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
                <defs>
                    <linearGradient id="deepWater" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#003566" />
                        <stop offset="100%" stopColor="#000814" />
                    </linearGradient>
                </defs>

                {/* Layer Ombak dari Belakang ke Depan */}
                <Wave
                    seed={1} yBase={0.45} amplitude={70} frequency={0.002} speed={1}
                    color="#001d3d" opacity={0.6}
                />
                <Wave
                    seed={2} yBase={0.55} amplitude={100} frequency={0.0015} speed={-1}
                    color="#003566" opacity={0.7}
                />
                <Wave
                    seed={3} yBase={0.7} amplitude={150} frequency={0.001} speed={2}
                    color="#001d3d" opacity={0.9}
                />

                {/* Layer Paling Depan dengan Gradasi */}
                <Wave
                    seed={4} yBase={0.85} amplitude={180} frequency={0.0008} speed={2}
                    color="url(#deepWater)" opacity={1}
                />
            </svg>

            {/* Partikel Air / Rain (Seamless) */}
            <AbsoluteFill style={{
                pointerEvents: 'none',
                opacity: 0.3,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='50' y1='0' x2='48' y2='10' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px',
                transform: `translateY(${(frame * 20) % 80}px) rotate(10deg)`,
            }} />

            {/* Vignette & Tekstur Kabut */}
            <AbsoluteFill style={{
                background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none',
            }} />

            {/* Grain Overlay */}
            <AbsoluteFill style={{
                opacity: 0.1,
                mixBlendMode: 'overlay',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};