import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface WaveConfig {
    color: string;
    amplitude: number;
    frequency: number;
    cycles: number; // Jumlah putaran gelombang per durasi video (untuk loop seamless)
    baseY: number;
    opacity: number;
}

export const LiquidWaves: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const waves: WaveConfig[] = useMemo(
        () => [
            {
                color: 'url(#grad1)',
                amplitude: 40,
                frequency: 0.005,
                cycles: 2,
                baseY: height * 0.6,
                opacity: 0.8,
            },
            {
                color: 'url(#grad2)',
                amplitude: 60,
                frequency: 0.003,
                cycles: 1,
                baseY: height * 0.7,
                opacity: 0.6,
            },
            {
                color: 'url(#grad3)',
                amplitude: 50,
                frequency: 0.004,
                cycles: 3,
                baseY: height * 0.8,
                opacity: 0.4,
            },
        ],
        [height]
    );

    const createWavePath = (config: WaveConfig) => {
        const points = [];
        const step = 20; // Resolusi horizontal
        // Progress 0 ke 2PI untuk looping sempurna
        const time = (frame / durationInFrames) * Math.PI * 2 * config.cycles;

        for (let x = 0; x <= width + step; x += step) {
            const y = config.baseY + Math.sin(x * config.frequency + time) * config.amplitude;
            points.push(`${x},${y}`);
        }

        return `M 0,${height} L 0,${config.baseY} ${points.map((p) => `L ${p}`).join(' ')} L ${width},${height} Z`;
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0015' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4facfe" />
                        <stop offset="100%" stopColor="#00f2fe" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#bc13fe" />
                        <stop offset="100%" stopColor="#ff00cc" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#091e3a" />
                        <stop offset="50%" stopColor="#2f80ed" />
                        <stop offset="100%" stopColor="#2d9ee0" />
                    </linearGradient>

                    <filter id="liquidBlur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
                    </filter>
                </defs>

                <g style={{ filter: 'url(#liquidBlur)' }}>
                    {waves.map((wave, i) => (
                        <path key={i} d={createWavePath(wave)} fill={wave.color} opacity={wave.opacity} />
                    ))}
                </g>
            </svg>

            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, #0a0015 0%, transparent 40%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};