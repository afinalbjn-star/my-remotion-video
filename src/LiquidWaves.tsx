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
                color: 'url(#grad7)',
                amplitude: 50,
                frequency: 0.003,
                cycles: 2,
                baseY: height * 0.1, // Paling atas
                opacity: 0.9,
            },
            {
                color: 'url(#grad8)',
                amplitude: 55,
                frequency: 0.005,
                cycles: 1,
                baseY: height * 0.22,
                opacity: 0.85,
            },
            {
                color: 'url(#grad1)',
                amplitude: 60,
                frequency: 0.004,
                cycles: 3,
                baseY: height * 0.34,
                opacity: 0.8,
            },
            {
                color: 'url(#grad2)',
                amplitude: 70,
                frequency: 0.003,
                cycles: 2,
                baseY: height * 0.46,
                opacity: 0.7,
            },
            {
                color: 'url(#grad3)',
                amplitude: 50,
                frequency: 0.005,
                cycles: 1,
                baseY: height * 0.58,
                opacity: 0.6,
            },
            {
                color: 'url(#grad4)',
                amplitude: 65,
                frequency: 0.0035,
                cycles: 2,
                baseY: height * 0.7,
                opacity: 0.5,
            },
            {
                color: 'url(#grad5)',
                amplitude: 55,
                frequency: 0.0045,
                cycles: 1,
                baseY: height * 0.82,
                opacity: 0.4,
            },
            {
                color: 'url(#grad6)',
                amplitude: 45,
                frequency: 0.006,
                cycles: 3,
                baseY: height * 0.94, // Paling bawah
                opacity: 0.3,
            },
        ],
        [height]
    );

    const createWavePath = (config: WaveConfig) => {
        const points = [];
        const step = 10; // Resolusi horizontal lebih rapat untuk kualitas 4K
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
                    {/* Gradasi Warna Tambahan */}
                    <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#a1ffce" /> {/* Hijau Muda */}
                        <stop offset="100%" stopColor="#faffd1" /> {/* Kuning Pucat */}
                    </linearGradient>
                    <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff9a9e" /> {/* Merah Muda */}
                        <stop offset="100%" stopColor="#fad0c4" /> {/* Oranye Pucat */}
                    </linearGradient>
                    <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff7e5f" /> {/* Oranye */}
                        <stop offset="100%" stopColor="#feb47b" /> {/* Peach */}
                    </linearGradient>
                    <linearGradient id="grad7" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8360c3" /> {/* Ungu */}
                        <stop offset="100%" stopColor="#2ebf91" /> {/* Hijau Teal */}
                    </linearGradient>
                    <linearGradient id="grad8" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f7bb97" /> {/* Kuning */}
                        <stop offset="100%" stopColor="#f48c71" /> {/* Oranye Kemerahan */}
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