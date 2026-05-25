import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

const NUM_POINTS_X = 15; // Jumlah titik horizontal
const NUM_POINTS_Y = 10; // Jumlah titik vertikal
const MAX_OFFSET = 180; // Diperbesar agar perubahan bentuk lebih dramatis

// Fungsi untuk menghasilkan warna pastel dari HSL
const getPastelColor = (hue: number, saturation: number, lightness: number) => {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const PolygonalBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const points: { x: number; y: number; seed: number }[] = [];

    // Menghasilkan titik-titik grid awal
    for (let i = 0; i <= NUM_POINTS_X; i++) {
        for (let j = 0; j <= NUM_POINTS_Y; j++) {
            const initialX = (i / NUM_POINTS_X) * width;
            const initialY = (j / NUM_POINTS_Y) * height;
            points.push({
                x: initialX,
                y: initialY,
                seed: (i * (NUM_POINTS_Y + 1) + j) * 123.456, // Seed unik untuk setiap titik
            });
        }
    }

    // Menganimasikan titik-titik dan menghasilkan poligon
    const animatedPoints = points.map(p => {
        const seedX = p.seed + 0.1;
        const seedY = p.seed + 0.2;
        const offsetAmplitudeX = random(seedX) * MAX_OFFSET;
        const offsetAmplitudeY = random(seedY) * MAX_OFFSET;

        // Frekuensi harus bilangan bulat agar loop sempurna (seamless)
        // Diperlambat: menggunakan nilai antara 1 dan 2 siklus per 10 detik
        const freqX = Math.floor(random(seedX + 0.3) * 2) + 1;
        const freqY = Math.floor(random(seedY + 0.4) * 2) + 1;

        const phaseOffsetX = random(seedX + 0.5) * Math.PI * 2;
        const phaseOffsetY = random(seedY + 0.6) * Math.PI * 2;

        const animatedOffsetX = offsetAmplitudeX * Math.sin(frame * (2 * Math.PI / durationInFrames) * freqX + phaseOffsetX);
        const animatedOffsetY = offsetAmplitudeY * Math.cos(frame * (2 * Math.PI / durationInFrames) * freqY + phaseOffsetY);

        return {
            x: p.x + animatedOffsetX,
            y: p.y + animatedOffsetY,
        };
    });

    const polygons: { points: string; color: string }[] = [];

    // Membuat segitiga dari titik-titik yang dianimasikan
    for (let i = 0; i < NUM_POINTS_X; i++) {
        for (let j = 0; j < NUM_POINTS_Y; j++) {
            const p1Index = i * (NUM_POINTS_Y + 1) + j;
            const p2Index = (i + 1) * (NUM_POINTS_Y + 1) + j;
            const p3Index = i * (NUM_POINTS_Y + 1) + (j + 1);
            const p4Index = (i + 1) * (NUM_POINTS_Y + 1) + (j + 1);

            const p1 = animatedPoints[p1Index];
            const p2 = animatedPoints[p2Index];
            const p3 = animatedPoints[p3Index];
            const p4 = animatedPoints[p4Index];

            // Untuk warna, kita animasikan hue untuk setiap poligon
            const polygonSeed1 = (i * NUM_POINTS_Y + j) * 789.123;
            const polygonSeed2 = (i * NUM_POINTS_Y + j) * 789.123 + 0.5;

            const initialHue1 = random(polygonSeed1) * 360;
            // Perubahan warna harus kembali ke titik awal (kelipatan 360) agar seamless
            const hueCycles1 = Math.floor(random(polygonSeed1 + 0.1) * 2) + 1;
            const animatedHue1 = initialHue1 + (frame / durationInFrames) * 360 * hueCycles1;

            const saturation1 = interpolate(random(polygonSeed1 + 0.2), [0, 1], [70, 90]); // Saturasi pastel
            const lightness1 = interpolate(random(polygonSeed1 + 0.3), [0, 1], [70, 85]); // Lightness sedikit lebih variatif

            const initialHue2 = random(polygonSeed2) * 360;
            const hueCycles2 = Math.floor(random(polygonSeed2 + 0.1) * 2) + 1;
            const animatedHue2 = initialHue2 + (frame / durationInFrames) * 360 * hueCycles2;

            const saturation2 = interpolate(random(polygonSeed2 + 0.2), [0, 1], [70, 90]);
            const lightness2 = interpolate(random(polygonSeed2 + 0.3), [0, 1], [75, 85]);

            // Segitiga 1
            polygons.push({
                points: `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`,
                color: getPastelColor(animatedHue1, saturation1, lightness1),
            });

            // Segitiga 2
            polygons.push({
                points: `${p2.x},${p2.y} ${p4.x},${p4.y} ${p3.x},${p3.y}`,
                color: getPastelColor(animatedHue2, saturation2, lightness2),
            });
        }
    }

    return (
        <AbsoluteFill style={{ backgroundColor: '#f0f8ff' }}> {/* Warna dasar biru pastel sangat terang */}
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {polygons.map((poly, i) => (
                    <polygon
                        key={i}
                        points={poly.points}
                        fill={poly.color}
                        stroke={poly.color} // Menggunakan warna yang sama untuk stroke agar tidak ada celah
                        strokeWidth={1}
                    />
                ))}
            </svg>
        </AbsoluteFill>
    );
};

export default PolygonalBackground;