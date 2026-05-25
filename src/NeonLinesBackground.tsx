import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

const NUM_LINES = 45; // Jumlah garis disesuaikan agar tidak terlalu penuh karena ukurannya besar
const LINE_THICKNESS_MIN = 2;
const LINE_THICKNESS_MAX = 65; // Ketebalan maksimum ditingkatkan
const NEON_COLOR_SATURATION = 100; // Saturasi penuh untuk efek neon
const NEON_COLOR_LIGHTNESS = 70; // Kecerahan untuk efek neon
const BACKGROUND_COLOR = '#000000'; // Latar belakang gelap untuk menonjolkan neon

const NeonLine: React.FC<{ index: number }> = ({ index }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const seed = index * 789.123; // Seed unik untuk setiap garis agar deterministik

    // Variasi ketebalan: beberapa garis sangat besar
    const isVeryThick = random(seed + 0.1) > 0.8;
    const thickness = isVeryThick
        ? interpolate(random(seed + 0.11), [0, 1], [30, LINE_THICKNESS_MAX])
        : interpolate(random(seed + 0.12), [0, 1], [LINE_THICKNESS_MIN, 15]);

    // Titik pusat rotasi yang tersebar secara sistematis di sekitar tengah layar
    const cx = width / 2 + (random(seed + 0.2) - 0.5) * (width * 0.5);
    const cy = height / 2 + (random(seed + 0.3) - 0.5) * (height * 0.5);

    // Garis panjang dari ujung ke ujung (melebihi diagonal 4K)
    const lineLength = 6500;

    // Animasi rotasi sistematis: bilangan bulat agar looping sempurna
    // Beberapa lambat (1 siklus) dan beberapa cepat (3 siklus)
    const initialRotation = random(seed + 0.4) * 360;
    const rotationSpeed = Math.floor(random(seed + 0.5) * 3) + 1;
    const direction = random(seed + 0.6) > 0.5 ? 1 : -1;
    const currentRotation = initialRotation + (frame / durationInFrames) * 360 * rotationSpeed * direction;

    // Animasi perubahan warna neon
    const initialHue = random(seed + 0.8) * 360; // Hue awal acak
    const hueCycles = Math.floor(random(seed + 0.9) * 2) + 1; // 1 atau 2 rotasi hue penuh
    const animatedHue = initialHue + (frame / durationInFrames) * 360 * hueCycles;
    const neonColor = `hsl(${animatedHue % 360}, ${NEON_COLOR_SATURATION}%, ${NEON_COLOR_LIGHTNESS}%)`;

    return (
        <line
            x1={cx - lineLength / 2}
            y1={cy}
            x2={cx + lineLength / 2}
            y2={cy}
            stroke="white" // Inti garis putih
            strokeWidth={thickness}
            strokeLinecap="round"
            style={{
                transform: `rotate(${currentRotation}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
                filter: `drop-shadow(0 0 ${thickness * 0.5}px ${neonColor}) drop-shadow(0 0 ${thickness * 1.2}px ${neonColor})`,
            }}
        />
    );
};

const NeonLinesBackground: React.FC = () => {
    const { width, height } = useVideoConfig();
    return (
        <AbsoluteFill style={{ backgroundColor: BACKGROUND_COLOR }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {new Array(NUM_LINES).fill(0).map((_, i) => (
                    <NeonLine key={i} index={i} />
                ))}
            </svg>
        </AbsoluteFill>
    );
};

export default NeonLinesBackground;