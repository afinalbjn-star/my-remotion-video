import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random } from 'remotion';

const RECURSION_DEPTH = 5;
const SEGMENTS = 12; // Jumlah irisan kaleidoskop

interface FractalNodeProps {
    depth: number;
    size: number;
    progress: number;
    hue: number;
}

const FractalNode: React.FC<FractalNodeProps> = ({ depth, size, progress, hue }) => {
    if (depth <= 0) return null;

    // Animasi rotasi yang seamless (2 putaran penuh per 10 detik)
    const rotation = progress * 360 * 2;
    // Animasi skala yang berdenyut (seamless karena sin)
    const pulse = Math.sin(progress * Math.PI * 2) * 0.2 + 1;

    const color = `hsl(${(hue + depth * 35) % 360}, 85%, 75%)`;
    const nextSize = size * 0.65;

    return (
        <g transform={`rotate(${rotation}) scale(${pulse})`}>
            {/* Bentuk Geometris Utama */}
            <rect
                x={-size / 2}
                y={-size / 2}
                width={size}
                height={size}
                fill="none"
                stroke={color}
                strokeWidth={2}
                opacity={0.8 / (RECURSION_DEPTH - depth + 1)}
                rx={size * 0.1}
            />
            <circle
                r={size * 0.3}
                fill={color}
                opacity={0.3}
            />

            {/* Cabang Fraktal (Rekursi) */}
            <g transform={`translate(${size * 0.8}, 0)`}>
                <FractalNode depth={depth - 1} size={nextSize} progress={progress} hue={hue} />
            </g>
            <g transform={`translate(${-size * 0.8}, 0)`}>
                <FractalNode depth={depth - 1} size={nextSize} progress={progress} hue={hue} />
            </g>
        </g>
    );
};

export const KaleidoscopeFractal: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    // Loop warna hue (360 derajat dalam 10 detik)
    const baseHue = (progress * 360) % 360;

    // Menghasilkan irisan kaleidoskop
    const segments = useMemo(() => {
        return new Array(SEGMENTS).fill(0).map((_, i) => {
            const angle = (i / SEGMENTS) * 360;
            return (
                <g key={i} transform={`rotate(${angle})`}>
                    {/* Refleksi Cermin Radial */}
                    <g transform={i % 2 === 0 ? '' : 'scale(1, -1)'}>
                        <FractalNode
                            depth={RECURSION_DEPTH}
                            size={350}
                            progress={progress}
                            hue={baseHue}
                        />
                    </g>
                </g>
            );
        });
    }, [progress, baseHue]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#020617' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="25" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Gradasi Latar Belakang Deep untuk kontras warna pastel */}
                    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={`hsl(${(baseHue + 180) % 360}, 40%, 15%)`} />
                        <stop offset="100%" stopColor={`hsl(${baseHue}, 35%, 5%)`} />
                    </radialGradient>
                </defs>

                <rect width={width} height={height} fill="url(#bgGrad)" />

                <g transform={`translate(${width / 2}, ${height / 2})`} filter="url(#softGlow)">
                    {/* Lapisan Latar Belakang Berputar */}
                    <g transform={`rotate(${-progress * 360 * 0.5})`}>
                        {segments}
                    </g>

                    {/* Lapisan Tengah dengan skala berbeda */}
                    <g transform={`rotate(${progress * 360}) scale(0.65)`} style={{ opacity: 0.9 }}>
                        {segments}
                    </g>
                </g>

            </svg>

            {/* Overlay Vignette Gelap di atas SVG untuk kesan sinematik */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 800px rgba(0,0,0,1)',
                pointerEvents: 'none',
            }} />

            {/* Efek Partikel Debu Cahaya yang Seamless */}
            <DustParticles progress={progress} />
        </AbsoluteFill>
    );
};

const DustParticles: React.FC<{ progress: number }> = ({ progress }) => {
    const { width, height } = useVideoConfig();

    // Gunakan useMemo agar posisi partikel tidak berubah saat re-render
    const particles = useMemo(() => {
        return new Array(50).fill(0).map((_, i) => ({
            // Menggunakan random() dengan seed agar deterministic (mencegah flicker di 4K)
            x: random(`x-${i}`) * width,
            yInitial: random(`y-${i}`) * height,
            size: random(`s-${i}`) * 8 + 2,
            speed: Math.floor(random(`sp-${i}`) * 2) + 1,
        }));
    }, [width, height]);

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {particles.map((p, i) => {
                // Pergerakan vertikal yang looping
                const y = (p.yInitial + progress * p.speed * height) % height;
                // Kedipan yang looping
                const opacity = interpolate(
                    Math.sin(progress * Math.PI * 2 * p.speed + i),
                    [-1, 1],
                    [0.1, 0.4]
                );

                return (
                    <div key={i} style={{
                        position: 'absolute',
                        left: p.x,
                        top: y,
                        width: p.size,
                        height: p.size,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        opacity,
                        filter: 'blur(2px)'
                    }} />
                );
            })}
        </div>
    );
};