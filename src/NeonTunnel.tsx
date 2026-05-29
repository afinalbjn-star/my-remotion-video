import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const FRAME_COUNT = 30; // Jumlah bingkai persegi yang terlihat sekaligus
const COLORS = [
    '#00f2ff', // Electric Blue
    '#ff00cc', // Neon Pink
    '#bc13fe', // Ultraviolet Purple
];

export const NeonTunnel: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Progress 0 ke 1 untuk satu siklus loop penuh
    const progress = (frame / durationInFrames) % 1;

    const centerX = width / 2;
    const centerY = height / 2;
    const baseSize = Math.min(width, height) * 0.8;

    const squares = useMemo(() => {
        return new Array(FRAME_COUNT).fill(0).map((_, i) => {
            // Menentukan warna berdasarkan urutan bingkai
            const color = COLORS[i % COLORS.length];
            return { id: i, color };
        });
    }, []);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    {/* Filter Glow Neon Premium Multi-Layer */}
                    <filter id="neonGlow" x="-150%" y="-150%" width="400%" height="400%">
                        <feGaussianBlur stdDeviation="4" result="blur1" />
                        <feGaussianBlur stdDeviation="15" result="blur2" />
                        <feGaussianBlur stdDeviation="50" result="blur3" />
                        <feGaussianBlur stdDeviation="90" result="blur4" />
                        <feMerge>
                            <feMergeNode in="blur4" />
                            <feMergeNode in="blur3" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Gradasi untuk garis bingkai agar terlihat lebih dinamis */}
                    {COLORS.map((color, i) => (
                        <linearGradient id={`grad-${i}`} key={i} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={color} />
                            <stop offset="100%" stopColor="#fff" stopOpacity="0.5" />
                        </linearGradient>
                    ))}
                </defs>

                {squares.map((sq, i) => {
                    // Setiap bingkai memiliki offset yang berbeda untuk menciptakan kedalaman berurutan
                    // Modulo 1 memastikan transisi kembali ke awal (seamless)
                    const squareProgress = (i / FRAME_COUNT + progress) % 1;

                    // Animasi dari titik jauh (skala 0) ke arah kamera (skala besar)
                    // Menggunakan Easing.in agar gerakan maju terasa lebih dramatis
                    const scale = interpolate(
                        squareProgress,
                        [0, 1],
                        [0, 4],
                        { easing: Easing.in(Easing.quad) }
                    );

                    // Muncul perlahan dari kegelapan dan menghilang saat melewati kamera
                    const opacity = interpolate(
                        squareProgress,
                        [0, 0.1, 0.8, 1],
                        [0, 1, 1, 0]
                    );

                    // Ketebalan garis disesuaikan untuk resolusi 4K agar efek neon terlihat tebal
                    const strokeWidth = interpolate(squareProgress, [0, 1], [4, 45]);

                    // Rotasi halus untuk efek futuristik
                    const rotation = interpolate(squareProgress, [0, 1], [0, 45]);

                    const size = baseSize * scale;

                    if (scale <= 0) return null;

                    return (
                        <rect
                            key={sq.id}
                            x={centerX - size / 2}
                            y={centerY - size / 2}
                            width={size}
                            height={size}
                            fill="none"
                            stroke={sq.color}
                            strokeWidth={strokeWidth}
                            opacity={opacity}
                            strokeLinejoin="round"
                            style={{
                                filter: 'url(#neonGlow)',
                                transform: `rotate(${rotation}deg)`,
                                transformOrigin: `${centerX}px ${centerY}px`,
                            }}
                        />
                    );
                })}
            </svg>

            {/* Overlay Vignette untuk menambah kedalaman sinematik */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, transparent 10%, rgba(0,0,0,0.9) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Subtle Noise Texture untuk kesan render 4K yang lebih organik */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};