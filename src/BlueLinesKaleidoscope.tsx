import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

const NUM_LINES_PER_SEGMENT = 60; // Ditingkatkan agar lebih "full latar"
const SEGMENTS = 12; // Simetri kaleidoskop
const MAX_DIST = 3500; // Jarak maksimum diperbesar untuk 4K

const LineGroup: React.FC<{ progress: number }> = ({ progress }) => {
    const { width, height } = useVideoConfig();

    const lines = useMemo(() => {
        return new Array(NUM_LINES_PER_SEGMENT).fill(0).map((_, i) => {
            const seed = i * 1.234;
            return {
                id: i,
                angleOffset: (random(seed) - 0.5) * 30, // Variasi sudut dalam satu segmen
                initialDist: random(seed + 1) * MAX_DIST,
                // Speed harus kelipatan bulat dari MAX_DIST agar seamless
                totalMovement: (Math.floor(random(seed + 2) * 2) + 1) * MAX_DIST,
                thickness: random(seed + 3) * 15 + 2,
                length: random(seed + 4) * 400 + 100,
                hue: 185 + random(seed + 5) * 45, // Range warna biru ke cyan
            };
        });
    }, []);

    return (
        <g>
            {lines.map((line) => {
                // Pergerakan radial keluar
                const currentDist = (line.initialDist + progress * line.totalMovement) % MAX_DIST;

                // Opacity fading di awal dan akhir jarak agar tidak muncul tiba-tiba
                const opacity = interpolate(
                    currentDist,
                    [0, 500, MAX_DIST - 500, MAX_DIST],
                    [0, 0.8, 0.8, 0],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                const x1 = Math.cos(line.angleOffset * Math.PI / 180) * currentDist;
                const y1 = Math.sin(line.angleOffset * Math.PI / 180) * currentDist;
                const x2 = Math.cos(line.angleOffset * Math.PI / 180) * (currentDist + line.length);
                const y2 = Math.sin(line.angleOffset * Math.PI / 180) * (currentDist + line.length);

                return (
                    <line
                        key={line.id}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={`hsl(${line.hue}, 100%, 60%)`}
                        strokeWidth={line.thickness}
                        strokeLinecap="round"
                        opacity={opacity}
                        style={{ filter: 'drop-shadow(0 0 10px rgba(0, 150, 255, 0.5))' }}
                    />
                );
            })}
        </g>
    );
};

export const BlueLinesKaleidoscope: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const progress = frame / durationInFrames;

    // Rotasi global yang seamless
    const globalRotation = progress * 360;

    const segments = useMemo(() => {
        return new Array(SEGMENTS).fill(0).map((_, i) => {
            const angle = (i / SEGMENTS) * 360;
            return (
                <g key={i} transform={`rotate(${angle})`}>
                    {/* Efek Cermin: setiap segmen ganjil dibalik */}
                    <g transform={i % 2 === 0 ? '' : 'scale(1, -1)'}>
                        <LineGroup progress={progress} />
                    </g>
                </g>
            );
        });
    }, [progress]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000510' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                <g transform={`translate(${width / 2}, ${height / 2}) rotate(${globalRotation})`} filter="url(#glow)">
                    {segments}

                    {/* Lapisan tambahan dengan rotasi berlawanan dan skala berbeda untuk kedalaman */}
                    <g transform={`rotate(${-globalRotation * 2}) scale(0.5)`} opacity={0.6}>
                        {segments}
                    </g>
                </g>
            </svg>

            {/* Vignette untuk fokus ke tengah */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};