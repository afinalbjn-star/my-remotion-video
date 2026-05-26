import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, random } from 'remotion';

const COLORS = [
    { iris: '#00ff44', glow: '#00ff44', secondary: '#ffffff' }, // Hijau Neon
    { iris: '#ff0033', glow: '#ff0033', secondary: '#ffffff' }, // Merah Neon
    { iris: '#0066ff', glow: '#0066ff', secondary: '#ffffff' }, // Biru Neon
    { iris: '#cc00ff', glow: '#cc00ff', secondary: '#ffffff' }, // Purple Neon
    { iris: '#fbbf24', glow: '#fcd34d' }, // Emas
];

const BLINK_DURATION = 30; // Durasi kedipan dalam frame
const SEGMENT_DURATION = 120; // 600 frames / 5 warna = 120 frames per warna

export const GiantEye: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const centerX = width / 2;
    const centerY = height / 2;

    // Logika Warna: Berganti setiap SEGMENT_DURATION
    // Menggunakan Math.floor untuk menentukan index warna saat ini
    const colorIndex = Math.floor(frame / SEGMENT_DURATION) % COLORS.length;
    const nextColorIndex = (colorIndex + 1) % COLORS.length;

    // Logika Kedipan: Berkedip di akhir setiap segmen warna
    const relativeFrame = frame % SEGMENT_DURATION;
    const isBlinking = relativeFrame > (SEGMENT_DURATION - BLINK_DURATION);

    // Animasi kelopak mata (0 = terbuka, 1 = tertutup total)
    const blinkProgress = interpolate(
        relativeFrame,
        [SEGMENT_DURATION - BLINK_DURATION, SEGMENT_DURATION - (BLINK_DURATION / 2), SEGMENT_DURATION],
        [0, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.2, 1) }
    );

    // Interpolasi warna saat transisi kedipan
    const currentIrisColor = isBlinking && relativeFrame > SEGMENT_DURATION - (BLINK_DURATION / 2)
        ? COLORS[nextColorIndex].iris
        : COLORS[colorIndex].iris;

    const currentGlowColor = isBlinking && relativeFrame > SEGMENT_DURATION - (BLINK_DURATION / 2)
        ? COLORS[nextColorIndex].glow
        : COLORS[colorIndex].glow;

    // Tekstur Iris & Urat Saraf (Menggunakan random dengan seed agar konsisten)
    const irisLines = useMemo(() => {
        return new Array(200).fill(0).map((_, i) => {
            const angle = (i / 200) * Math.PI * 2;
            const lenSeed = i * 1.5;
            const opSeed = i * 2.5;
            return { angle, length: 300 + random(lenSeed) * 200, opacity: 0.1 + random(opSeed) * 0.4 };
        });
    }, []);

    const eyeVeins = useMemo(() => {
        return new Array(18).fill(0).map((_, i) => {
            const angle = (i / 18) * Math.PI * 2 + (random(i) * 0.5);
            const startR = 650;
            let points = "";
            let curX = Math.cos(angle) * startR;
            let curY = Math.sin(angle) * startR;
            for (let j = 0; j < 6; j++) {
                points += `${curX + centerX},${curY + centerY} `;
                curX += Math.cos(angle + (random(i + j) - 0.5)) * 120;
                curY += Math.sin(angle + (random(i + j + 1) - 0.5)) * 120;
            }
            return points;
        });
    }, [centerX, centerY]);

    // Efek pulsasi cahaya pada pupil
    const pulse = Math.sin(frame * 0.15) * 15;

    // Koordinat Kelopak Mata Dinamis
    // Kelopak akan menutup tepat di centerY saat blinkProgress = 1
    const topLidControlY = interpolate(blinkProgress, [0, 1], [centerY - 1100, centerY]);
    const bottomLidControlY = interpolate(blinkProgress, [0, 1], [centerY + 1100, centerY]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    {/* Filter Glow Neon Premium */}
                    <filter id="eyeGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="10" result="blur1" />
                        <feGaussianBlur stdDeviation="30" result="blur2" />
                        <feGaussianBlur stdDeviation="60" result="blur3" />
                        <feMerge>
                            <feMergeNode in="blur3" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Efek 3D Bola Mata */}
                    <radialGradient id="sclera3D" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="70%" stopColor="#e5e7eb" />
                        <stop offset="100%" stopColor="#888888" />
                    </radialGradient>

                    <radialGradient id="irisGrad">
                        <stop offset="20%" stopColor="#000" />
                        <stop offset="50%" stopColor={currentIrisColor} />
                        <stop offset="80%" stopColor="#000" />
                    </radialGradient>

                    <clipPath id="eyeClip">
                        <circle cx={centerX} cy={centerY} r={1000} />
                    </clipPath>
                </defs>

                {/* Bola Mata Utama (Sclera) - Dibuat Bulat 3D */}
                <circle
                    cx={centerX}
                    cy={centerY}
                    r={1000}
                    fill="url(#sclera3D)"
                    stroke="#374151"
                    strokeWidth="5"
                />

                {/* Urat Saraf Merah (Veins) */}
                {eyeVeins.map((points, i) => (
                    <polyline
                        key={i}
                        points={points}
                        fill="none"
                        stroke="#ff0000"
                        strokeWidth="1.5"
                        opacity="0.25"
                    />
                ))}

                {/* Kelompok Iris dan Pupil */}
                <g clipPath="url(#eyeClip)">
                    {/* Iris Background */}
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r={550}
                        fill="url(#irisGrad)"
                        opacity="0.9"
                    />

                    {/* Iris Textures (Serat-serat halus) */}
                    {irisLines.map((line, i) => (
                        <line
                            key={i}
                            x1={centerX}
                            y1={centerY}
                            x2={centerX + Math.cos(line.angle) * line.length}
                            y2={centerY + Math.sin(line.angle) * line.length}
                            stroke={currentGlowColor}
                            strokeWidth="3"
                            opacity={line.opacity}
                        />
                    ))}

                    {/* Pupil Neon */}
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r={200 + pulse}
                        fill="#000"
                        stroke={currentGlowColor}
                        strokeWidth="20"
                        style={{ filter: 'url(#eyeGlow)' }}
                    />

                    {/* Lensa/Refleksi Cahaya Premium */}
                    <ellipse
                        cx={centerX - 150}
                        cy={centerY - 150}
                        rx={80}
                        ry={50}
                        fill="white"
                        opacity="0.4"
                        style={{ transform: 'rotate(-45deg)', transformOrigin: `${centerX - 150}px ${centerY - 150}px` }}
                    />
                </g>

                {/* Kelopak Mata Atas - Animasi Path agar tidak pecah */}
                <path
                    d={`M 0 0 H ${width} V ${centerY} 
                       Q ${centerX} ${topLidControlY} 0 ${centerY} Z`}
                    fill="#050505"
                />

                {/* Kelopak Mata Bawah - Animasi Path agar tidak pecah */}
                <path
                    d={`M 0 ${height} H ${width} V ${centerY} 
                       Q ${centerX} ${bottomLidControlY} 0 ${centerY} Z`}
                    fill="#050505"
                />

                {/* Bingkai Luar agar terlihat seperti lubang mata */}
                <rect width={width} height={height} fill="none" stroke="#000" strokeWidth="600" />
            </svg>

            {/* Overlay Vignette untuk kesan sinematik */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.9) 100%)', pointerEvents: 'none' }} />
        </AbsoluteFill>
    );
};