// ============================================================================
// File: src/WinterScene.tsx
// Deskripsi: Animasi Salju Looping 4K 60fps dengan Perspektif Low-Angle
// ============================================================================

import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

// ============================================================================
// 1. KONFIGURASI & TIPE DATA (Constants & Types)
// ============================================================================

/**
 * Konfigurasi utama untuk komposisi video 4K.
 * Durasi diatur untuk persis 10 detik pada 60fps (600 frame).
 */
export const VIDEO_CONFIG = {
    width: 3840,
    height: 2160,
    fps: 60,
    durationInFrames: 600,
};

/**
 * Palet warna yang digunakan untuk efek kedalaman atmosfer malam hari.
 */
export const COLORS = {
    skyDeep: '#000000',      // Hitam pekat di tengah/atas langit
    skyHorizon: '#001a33',   // Biru navy gelap di pinggiran
    auroraGreen: 'rgba(0, 255, 128, 0.15)',
    auroraPurple: 'rgba(128, 0, 255, 0.15)',
    snow: '#e6f2ff',         // Off-white dengan sentuhan biru es
};

interface SnowflakeData {
    id: number;
    startX: number;     // Posisi horizontal awal
    startY: number;     // Posisi vertikal awal
    offsetTime: number; // Offset waktu untuk seamless loop (0.0 - 1.0)
    size: number;       // Ukuran dasar partikel
    drift: number;      // Kekuatan goyangan angin horizontal
    type: 'circle' | 'crystal'; // Variasi bentuk salju
}

// ============================================================================
// 2. UTILITAS & MATEMATIKA (Math Helpers)
// ============================================================================

/**
 * Pseudo-random number generator (PRNG) sederhana agar posisi salju konsisten 
 * pada setiap proses render (mencegah kedipan antar frame).
 */
const random = (seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
};

/**
 * Fungsi untuk menghasilkan data partikel salju secara terdistribusi.
 */
const generateSnowflakes = (count: number, seedOffset: number): SnowflakeData[] => {
    const flakes: SnowflakeData[] = [];
    for (let i = 0; i < count; i++) {
        flakes.push({
            id: i + seedOffset,
            // Mendistribusikan salju di area pandang virtual (X dan Y)
            startX: (random(i + seedOffset * 1.1) - 0.5) * 4000,
            startY: (random(i + seedOffset * 1.2) - 0.5) * 4000,
            offsetTime: random(i + seedOffset * 1.3),
            size: 2 + random(i + seedOffset * 1.4) * 8, // Ukuran bervariasi 2px - 10px
            drift: (random(i + seedOffset * 1.5) - 0.5) * 200,
            type: random(i + seedOffset * 1.6) > 0.8 ? 'crystal' : 'circle',
        });
    }
    return flakes;
};

// ============================================================================
// 3. KOMPONEN: Latar Belakang & Aurora (SkyBackground & Aurora)
// ============================================================================

/**
 * Komponen Latar Belakang: Menghasilkan langit malam gradient.
 */
const SkyBackground: React.FC = () => {
    return (
        <AbsoluteFill
            style={{
                background: `radial-gradient(circle at center, ${COLORS.skyDeep} 0%, ${COLORS.skyHorizon} 100%)`,
            }}
        />
    );
};

/**
 * Komponen Aurora: Efek cahaya dinamis di latar belakang yang bergerak perlahan.
 */
const AuroraBorealis: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Animasi siklus (0 to 1) untuk seamless loop
    const progress = frame / durationInFrames;

    // Menggunakan sine wave untuk membuat aurora berdenyut dan bergeser
    const shiftX1 = Math.sin(progress * Math.PI * 2) * 200;
    const shiftX2 = Math.cos(progress * Math.PI * 2) * 200;

    return (
        <AbsoluteFill style={{ opacity: 0.6, filter: 'blur(100px)' }}>
            <div
                style={{
                    position: 'absolute',
                    top: '20%',
                    left: `calc(30% + ${shiftX1}px)`,
                    width: '60%',
                    height: '40%',
                    background: COLORS.auroraGreen,
                    borderRadius: '50%',
                    transform: 'rotate(-20deg)',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: `calc(50% + ${shiftX2}px)`,
                    width: '50%',
                    height: '50%',
                    background: COLORS.auroraPurple,
                    borderRadius: '50%',
                    transform: 'rotate(20deg)',
                }}
            />
        </AbsoluteFill>
    );
};

// ============================================================================
// 4. KOMPONEN: Kepingan Salju Individu (Snowflake)
// ============================================================================

interface SnowflakeProps {
    data: SnowflakeData;
    layerDepth: number; // 1 (Belakang), 2 (Tengah), 3 (Depan/Lensa)
}

/**
 * Komponen Snowflake: Menangani fisika 3D semu (perspective projection)
 * agar salju tampak membesar dan melesat saat mendekati kamera (layar).
 */
const Snowflake: React.FC<SnowflakeProps> = ({ data, layerDepth }) => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();

    // LOGIKA SEAMLESS LOOP
    // Partikel bergerak dari Z-jauh ke Z-dekat. 
    // (data.offsetTime + frame / totalFrames) % 1 memastikan siklus kembali ke awal tepat di akhir durasi.
    const rawProgress = (data.offsetTime + frame / durationInFrames) % 1;

    // Membalik progress: 0 (jauh di langit) menuju 1 (menabrak lensa kamera)
    const zProgress = rawProgress;

    // Simulasi Perspektif (Z-Axis mapping)
    // Semakin mendekati 1, nilai 'z' mendekati 0.01 (sangat dekat), scale menjadi sangat besar.
    const zMax = 2000;
    const zCurrent = interpolate(zProgress, [0, 1], [zMax, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Skala visual berdasarkan kedalaman Z (Perspective Divide)
    const scale = 1000 / zCurrent;

    // Posisi X dan Y juga akan melebar dari pusat seiring partikel mendekat
    const driftX = Math.sin((frame / durationInFrames) * Math.PI * 2 + data.id) * data.drift;

    const projectedX = width / 2 + (data.startX + driftX) * (scale / 5);
    const projectedY = height / 2 + data.startY * (scale / 5);

    // LOGIKA OPASITAS
    // Fade-in di kejauhan, fade-out tajam saat menabrak lensa agar tidak memotong mendadak
    const opacity = interpolate(
        zProgress,
        [0, 0.1, 0.8, 1],
        [0, 1 * (layerDepth / 3), 0.8, 0]
    );

    // LOGIKA BLUR & DEPTH OF FIELD
    // Layer depan sangat blur saat dekat, layer belakang sedikit blur
    const blurAmount = layerDepth === 3
        ? interpolate(zProgress, [0.7, 1], [0, 20], { extrapolateLeft: 'clamp' })
        : layerDepth === 1 ? 4 : 0;

    // Render tidak dilakukan jika partikel berada di luar batas layar secara ekstrem
    if (
        projectedX < -1000 ||
        projectedX > width + 1000 ||
        projectedY < -1000 ||
        projectedY > height + 1000
    ) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                left: projectedX,
                top: projectedY,
                width: data.size,
                height: data.size,
                backgroundColor: COLORS.snow,
                borderRadius: data.type === 'circle' ? '50%' : '10%',
                transform: `scale(${scale}) rotate(${zProgress * 360}deg)`,
                opacity: opacity,
                filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
                // Sedikit box-shadow untuk memberikan efek pendar kristal es
                boxShadow: layerDepth > 1 ? `0 0 ${scale * 2}px ${COLORS.snow}` : 'none',
            }}
        />
    );
};

// ============================================================================
// 5. KOMPONEN: Lapisan Salju (SnowLayer)
// ============================================================================

interface SnowLayerProps {
    count: number;
    depth: number;
    seed: number;
}

/**
 * Komponen SnowLayer: Mengelompokkan partikel berdasarkan kedalaman untuk optimasi.
 */
const SnowLayer: React.FC<SnowLayerProps> = ({ count, depth, seed }) => {
    // Memoize data partikel agar tidak di-recalculate setiap frame
    const flakes = useMemo(() => generateSnowflakes(count, seed), [count, seed]);

    return (
        <AbsoluteFill>
            {flakes.map((flake) => (
                <Snowflake key={flake.id} data={flake} layerDepth={depth} />
            ))}
        </AbsoluteFill>
    );
};
// ============================================================================
// 7. KOMPONEN UTAMA: Komposisi Video (WinterSkyScene)
// ============================================================================

/**
 * WinterSkyScene: Komponen utama yang menyatukan semua elemen latar, aurora,
 * layer salju, dan efek lensa.
 */
export const WinterSkyScene: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {/* Latar Belakang Terdalam */}
            <SkyBackground />

            {/* Efek Cahaya Atmosfer */}
            <AuroraBorealis />

            {/* Layer Salju Belakang (Kecil, Lambat, Banyak) */}
            <SnowLayer count={400} depth={1} seed={100} />

            {/* Layer Salju Tengah (Sedang, Kecepatan Normal) */}
            <SnowLayer count={200} depth={2} seed={200} />

            {/* Layer Salju Depan / Lensa (Besar, Cepat, Buram) */}
            <SnowLayer count={50} depth={3} seed={300} />
        </AbsoluteFill>
    );
};