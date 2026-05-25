import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

interface WaveConfig {
    amplitude: number;
    frequency: number;
    speed: number;
    color: string;
    opacity: number;
    offset: number;
}

const WAVES: WaveConfig[] = [
    { amplitude: 150, frequency: 0.001, speed: 1, color: '#93c5fd', opacity: 0.4, offset: 0 },
    { amplitude: 200, frequency: 0.0012, speed: -1, color: '#60a5fa', opacity: 0.3, offset: Math.PI / 2 },
    { amplitude: 120, frequency: 0.0008, speed: 2, color: '#3b82f6', opacity: 0.2, offset: Math.PI },
    { amplitude: 180, frequency: 0.0015, speed: -2, color: '#2563eb', opacity: 0.2, offset: Math.PI * 1.5 },
];

const WaveLayer: React.FC<{ config: WaveConfig; sf: number }> = ({ config, sf }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // t dari 0 ke 2PI untuk seamless loop
    const t = (frame / durationInFrames) * Math.PI * 2;

    const path = useMemo(() => {
        const points: string[] = [];
        const steps = 60; // Resolusi path
        const stepSize = width / steps;

        for (let i = 0; i <= steps; i++) {
            const x = i * stepSize;

            // Rumus gelombang cair
            const yWave = Math.sin(x * config.frequency * sf + t * config.speed + config.offset) * config.amplitude * sf;

            // Posisi Y dasar (tengah ke bawah)
            const y = height * 0.6 + yWave;

            points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
        }

        // Menutup path ke bawah layar agar bisa di-fill
        return `${points.join(' ')} L ${width} ${height} L 0 ${height} Z`;
    }, [width, height, t, config, sf]);

    return (
        <path
            d={path}
            fill={config.color}
            opacity={config.opacity}
            style={{
                mixBlendMode: 'multiply',
            }}
        />
    );
};

export const GenerativeLiquidWaves: React.FC = () => {
    const { width, height } = useVideoConfig();
    const sf = height / 2160; // Scale factor untuk 4K

    return (
        <AbsoluteFill style={{ backgroundColor: '#f8fafc', overflow: 'hidden' }}>
            {/* Latar belakang gradient langit yang tenang */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, #eff6ff 0%, #dbeafe 100%)',
                }}
            />

            {/* Layer Gelombang SVG */}
            <svg
                width={width}
                height={height}
                style={{ position: 'absolute', inset: 0 }}
            >
                <defs>
                    <filter id="softBlur">
                        <feGaussianBlur stdDeviation={10 * sf} />
                    </filter>
                </defs>

                {WAVES.map((wave, i) => (
                    <g key={i} filter={i < 2 ? 'url(#softBlur)' : undefined}>
                        <WaveLayer config={wave} sf={sf} />
                    </g>
                ))}
            </svg>

            {/* Grain Overlay untuk tekstur organik */}
            <AbsoluteFill style={{
                pointerEvents: 'none',
                opacity: 0.15,
                mixBlendMode: 'overlay',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }} />

            {/* Vignette untuk fokus */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, transparent 30%, rgba(30, 58, 138, 0.1) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};