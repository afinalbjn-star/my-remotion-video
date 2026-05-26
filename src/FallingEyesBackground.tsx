import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random } from 'remotion';

const NUM_EYES = 60; // Jumlah bola mata yang berjatuhan
const EYE_SIZE_MIN = 150; // Ukuran minimum bola mata
const EYE_SIZE_MAX = 400; // Ukuran maksimum bola mata
const FALL_SPEED_MIN_CYCLES = 1; // Minimal 1 siklus jatuh penuh per durasi video
const FALL_SPEED_MAX_CYCLES = 2; // Maksimal 2 siklus jatuh penuh per durasi video
const ROTATION_SPEED_MIN_CYCLES = 1; // Minimal 1 siklus rotasi penuh per durasi video
const ROTATION_SPEED_MAX_CYCLES = 3; // Maksimal 3 siklus rotasi penuh per durasi video

// Fungsi untuk menghasilkan warna neon pastel dari HSL
const getPastelNeonColor = (hue: number) => {
    // Lightness lebih tinggi agar inti cahaya terlihat lebih menyala
    return `hsl(${hue}, 100%, 75%)`;
};

interface EyeProps {
    id: number;
    x: number; // Posisi tengah X mata
    y: number; // Posisi tengah Y mata
    size: number;
    rotation: number;
    irisColor: string;
    glowColor: string;
    isBlurred: boolean;
    pupilPulse: number;
}

const Eye: React.FC<EyeProps> = ({ id, x, y, size, rotation, irisColor, glowColor, isBlurred, pupilPulse }) => {
    // Menghasilkan serat iris statis berdasarkan ID mata agar terlihat premium
    const irisLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            lines.push({
                angle,
                length: (size * 0.25) + (random(`line-${id}-${i}`) * size * 0.15),
                opacity: 0.2 + random(`op-${id}-${i}`) * 0.5
            });
        }
        return lines;
    }, [id, size]);

    const eyeCenterX = size / 2;
    const eyeCenterY = size / 2;

    return (
        <g transform={`translate(${x - eyeCenterX}, ${y - eyeCenterY}) rotate(${rotation} ${eyeCenterX} ${eyeCenterY})`}>
            {/* Aura Cahaya Luar (Atmospheric Glow) */}
            <circle
                cx={eyeCenterX}
                cy={eyeCenterY}
                r={size * 0.8}
                fill={glowColor}
                opacity="0.6"
                style={{ filter: 'url(#eyeGlowUltra)' }}
            />

            <defs>
                {/* Radial gradient untuk iris agar memberikan kedalaman */}
                <radialGradient id={`irisGrad-${id}`} cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor={irisColor} />
                    <stop offset="75%" stopColor="#000" />
                </radialGradient>
            </defs>

            {/* Sclera (Bola Mata Putih) - dengan efek 3D */}
            <circle
                cx={eyeCenterX}
                cy={eyeCenterY}
                r={size / 2}
                fill="url(#sclera3D)" // Menggunakan gradient sclera3D global
                stroke="#1e293b"
                strokeWidth="3"
            />

            {/* Inti Iris Bercahaya */}
            <circle
                cx={eyeCenterX}
                cy={eyeCenterY}
                r={size * 0.38}
                fill={`url(#irisGrad-${id})`}
                opacity="1"
                style={{ filter: 'url(#eyeGlowUltra)' }}
            />

            {/* Serat Iris Premium */}
            {irisLines.map((line, i) => (
                <g key={i}>
                    {/* Cahaya Serat */}
                    <line
                        x1={eyeCenterX}
                        y1={eyeCenterY}
                        x2={eyeCenterX + Math.cos(line.angle) * line.length}
                        y2={eyeCenterY + Math.sin(line.angle) * line.length}
                        stroke={glowColor}
                        strokeWidth={size * 0.015}
                        opacity={line.opacity}
                        style={{ filter: 'url(#eyeGlowUltra)' }}
                    />
                    {/* Inti Putih Serat (Hot Spot) */}
                    <line
                        key={i}
                        x1={eyeCenterX}
                        y1={eyeCenterY}
                        x2={eyeCenterX + Math.cos(line.angle) * line.length * 0.8}
                        y2={eyeCenterY + Math.sin(line.angle) * line.length * 0.8}
                        stroke="white"
                        strokeWidth={size * 0.008}
                        opacity={line.opacity * 0.8}
                    />
                </g>
            ))}

            {/* Pupil */}
            <circle
                cx={eyeCenterX}
                cy={eyeCenterY}
                r={size * 0.15 + pupilPulse}
                fill="#000"
                stroke={glowColor}
                strokeWidth={size * 0.03}
                style={{ filter: 'url(#eyeGlowUltra)' }}
            />

            {/* Inti Cahaya Putih Terang (Extreme Hot Spot) */}
            <circle
                cx={eyeCenterX}
                cy={eyeCenterY}
                r={size * 0.06 + pupilPulse * 0.3}
                fill="white"
                opacity="0.9"
                style={{ filter: 'url(#eyeGlowUltra)' }}
            />

            {/* Lensa/Refleksi Cahaya */}
            <ellipse
                cx={eyeCenterX - size * 0.12}
                cy={eyeCenterY - size * 0.12}
                rx={size * 0.08}
                ry={size * 0.05}
                fill="white"
                opacity="0.4"
                style={{ transform: `rotate(-45deg)`, transformOrigin: `${eyeCenterX - size * 0.12}px ${eyeCenterY - size * 0.12}px` }}
            />

            {/* Efek blur opsional untuk beberapa mata */}
            {isBlurred && (
                <circle
                    cx={eyeCenterX}
                    cy={eyeCenterY}
                    r={size / 2}
                    fill="none"
                    stroke="transparent" // Stroke transparan, hanya untuk menerapkan blur
                    style={{ filter: `url(#irisBlur)` }}
                />
            )}
        </g>
    );
};

export const FallingEyesBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const eyes = useMemo(() => {
        return new Array(NUM_EYES).fill(0).map((_, i) => {
            const seed = i * 123.456; // Seed unik untuk setiap mata agar properti deterministik

            const size = interpolate(random(seed), [0, 1], [EYE_SIZE_MIN, EYE_SIZE_MAX]);

            // Posisi X awal acak
            const initialX = random(seed + 0.1) * width;

            // Total jarak tempuh vertikal untuk looping seamless (tinggi layar + ukuran mata)
            const totalTravelDistance = height + size;
            // Posisi Y awal acak dalam rentang totalTravelDistance
            const initialY = random(seed + 0.2) * totalTravelDistance;

            const fallCycles = Math.floor(random(seed + 0.3) * (FALL_SPEED_MAX_CYCLES - FALL_SPEED_MIN_CYCLES + 1)) + FALL_SPEED_MIN_CYCLES;
            const rotationCycles = Math.floor(random(seed + 0.4) * (ROTATION_SPEED_MAX_CYCLES - ROTATION_SPEED_MIN_CYCLES + 1)) + ROTATION_SPEED_MIN_CYCLES;

            const initialHue = random(seed + 0.5) * 360; // Hue awal acak
            const hueCycles = Math.floor(random(seed + 0.6) * 2) + 1; // 1 atau 2 rotasi hue penuh

            const isBlurred = random(seed + 0.7) > 0.7; // Sekitar 30% mata akan memiliki efek blur tambahan

            return {
                id: i,
                initialX,
                initialY,
                size,
                fallCycles,
                rotationCycles,
                initialHue,
                hueCycles,
                isBlurred,
            };
        });
    }, [width, height]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#000000' }}> {/* Latar Belakang Hitam Pekat */}
            {/* Radial gradient untuk latar belakang biru yang dalam */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
                opacity: 0.5 // Mengurangi opasitas latar belakang
            }} />

            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    {/* Filter Glow Neon Premium Ultra */}
                    <filter id="eyeGlowUltra" x="-150%" y="-150%" width="400%" height="400%">
                        <feGaussianBlur stdDeviation="3" result="blur1" />
                        <feGaussianBlur stdDeviation="15" result="blur2" />
                        <feGaussianBlur stdDeviation="45" result="blur3" />
                        <feGaussianBlur stdDeviation="80" result="blur4" />
                        <feColorMatrix in="blur4" type="saturate" values="5" result="vibrantBlur" />
                        <feComponentTransfer in="vibrantBlur" result="brightBlur">
                            <feFuncA type="linear" slope="3.5" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode in="brightBlur" />
                            <feMergeNode in="blur3" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Efek 3D Bola Mata Sclera (bagian putih mata) */}
                    <radialGradient id="sclera3D" cx="40%" cy="40%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="65%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                    </radialGradient>

                    {/* Filter blur tambahan untuk beberapa mata */}
                    <filter id="irisBlur">
                        <feGaussianBlur stdDeviation="10" />
                    </filter>
                </defs>

                {eyes.map((eye) => {
                    // Kalkulasi posisi Y untuk jatuh dan looping seamless
                    const totalTravelDistance = height + eye.size;
                    const yOffset = (frame / durationInFrames) * totalTravelDistance * eye.fallCycles;
                    const yPos = (eye.initialY + yOffset) % totalTravelDistance;

                    // Kalkulasi rotasi untuk looping seamless
                    const currentRotation = (frame / durationInFrames) * 360 * eye.rotationCycles;

                    // Animasi hue warna untuk looping seamless
                    const animatedHue = eye.initialHue + (frame / durationInFrames) * 360 * eye.hueCycles;
                    const irisColor = getPastelNeonColor(animatedHue % 360);
                    const glowColor = getPastelNeonColor((animatedHue + 30) % 360); // Sedikit perbedaan hue untuk glow

                    // Efek pulsasi pupil yang unik untuk setiap mata
                    const pupilPulse = Math.sin(frame * 0.15 + eye.id) * 5;

                    return (
                        <Eye
                            key={eye.id}
                            id={eye.id}
                            x={eye.initialX}
                            y={yPos} // yPos sekarang merepresentasikan pusat mata
                            size={eye.size}
                            rotation={currentRotation}
                            irisColor={irisColor}
                            glowColor={glowColor}
                            isBlurred={eye.isBlurred}
                            pupilPulse={pupilPulse}
                        />
                    );
                })}
            </svg>
        </AbsoluteFill>
    );
};