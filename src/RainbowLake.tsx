import React, { useEffect, useRef } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    Composition,
} from 'remotion';

// ============================================================================
// 1. KONFIGURASI DIMENSI & RENDER
// ============================================================================

const RESOLUTION_WIDTH = 3840;
const RESOLUTION_HEIGHT = 2160;

export const VIDEO_CONFIG = {
    width: RESOLUTION_WIDTH,
    height: RESOLUTION_HEIGHT,
    fps: 60,
    durationInFrames: 600,
};

// Menentukan seberapa detail render airnya. 
// Semakin kecil angkanya, semakin halus (tapi lebih berat di-render).
// Angka 5 adalah titik keseimbangan terbaik untuk resolusi 1080p.
const RENDER_STEP_PIXELS = 5;

// ============================================================================
// 2. DEFINISI TIPE DATA TYPESCRIPT
// ============================================================================

/**
 * Konfigurasi untuk setiap vektor gelombang air.
 * Menggunakan prinsip gelombang berjalan (traveling waves).
 */
interface DirectionalWave {
    dirX: number;       // Arah pergerakan gelombang di sumbu X
    dirY: number;       // Arah pergerakan gelombang di sumbu Y
    frequency: number;  // Kerapatan jarak antar riak air
    amplitude: number;  // Tinggi/kedalaman riak air
    speed: number;      // Kecepatan arus (HARUS BERUPA BILANGAN BULAT agar bisa seamless loop)
}

/**
 * Pengaturan parameter palet warna pelangi (HSL).
 */
interface RainbowColorConfig {
    baseLightness: number;
    lightnessVariance: number;
    baseSaturation: number;
    hueSpeedModifier: number;
}

// ============================================================================
// 3. PARAMETER GELOMBANG (WAVE ENGINE)
// ============================================================================

/**
 * Kumpulan 14 gelombang yang bergerak dari berbagai arah.
 * Saat gelombang-gelombang ini bertabrakan, mereka menciptakan pola air
 * yang acak, natural, dan organik seperti permukaan danau sungguhan.
 * * ATURAN SEAMLESS LOOP: Nilai 'speed' mutlak harus bilangan bulat (1, 2, -1, dst).
 */
const WATER_WAVES: DirectionalWave[] = [
    { dirX: 1.0, dirY: 0.5, frequency: 0.0030, amplitude: 1.5, speed: 1 },
    { dirX: -0.5, dirY: 1.0, frequency: 0.0045, amplitude: 1.2, speed: -1 },
    { dirX: 0.2, dirY: -0.8, frequency: 0.0060, amplitude: 0.9, speed: 2 },
    { dirX: -1.0, dirY: -0.3, frequency: 0.0025, amplitude: 1.8, speed: -1 },
    { dirX: 0.7, dirY: 0.7, frequency: 0.0055, amplitude: 1.1, speed: 3 },
    { dirX: -0.8, dirY: 0.4, frequency: 0.0035, amplitude: 1.4, speed: -2 },
    { dirX: 0.1, dirY: 0.9, frequency: 0.0075, amplitude: 0.7, speed: 1 },
    { dirX: -0.4, dirY: -0.9, frequency: 0.0040, amplitude: 1.3, speed: -3 },
    { dirX: 0.9, dirY: -0.1, frequency: 0.0080, amplitude: 0.6, speed: 2 },
    { dirX: -0.6, dirY: -0.6, frequency: 0.0020, amplitude: 2.0, speed: -1 },
    { dirX: 0.3, dirY: 0.8, frequency: 0.0050, amplitude: 1.0, speed: 4 },
    { dirX: -0.9, dirY: 0.2, frequency: 0.0065, amplitude: 0.8, speed: -2 },
    { dirX: 0.5, dirY: -0.5, frequency: 0.0032, amplitude: 1.6, speed: 1 },
    { dirX: 0.0, dirY: 1.0, frequency: 0.0090, amplitude: 0.5, speed: 3 },
];

const COLOR_CONFIG: RainbowColorConfig = {
    baseLightness: 45,
    lightnessVariance: 25,
    baseSaturation: 85,
    hueSpeedModifier: 1, // Berputar 1x putaran penuh (360 derajat) selama video
};

// ============================================================================
// 4. FUNGSI UTILITAS RENDER PENGGAMBARAN
// ============================================================================

/**
 * Menghitung total ketinggian air di titik koordinat (X, Y) pada waktu tertentu.
 * Menggabungkan semua vektor gelombang menggunakan rumus trigonometri.
 */
const calculateWaveHeight = (
    x: number,
    y: number,
    progress: number // Berjalan dari 0.0 hingga 1.0 (awal hingga akhir video)
): number => {
    let totalHeight = 0;

    // Iterasi seluruh parameter arah ombak
    for (let i = 0; i < WATER_WAVES.length; i++) {
        const wave = WATER_WAVES[i];

        // Proyeksi titik spasial X dan Y terhadap arah gelombang (Dot Product)
        const spatialPhase = (x * wave.dirX + y * wave.dirY) * wave.frequency;

        // Fase temporal: Berapa jauh gelombang telah bergerak berdasarkan waktu.
        // Penggunaan Math.PI * 2 dan speed bilangan bulat menjamin putaran yang seamless.
        const temporalPhase = progress * Math.PI * 2 * wave.speed;

        // Kalkulasi sinergi amplitudo gelombang
        totalHeight += Math.sin(spatialPhase + temporalPhase) * wave.amplitude;
    }

    return totalHeight;
};

// ============================================================================
// 5. KOMPONEN UTAMA (CANVAS ANIMATION ENGINE)
// ============================================================================

const RainbowLakeTopDown: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Logika Rendering menggunakan HTML5 Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false meningkatkan performa
        if (!ctx) return;

        // Hitung persentase progres video (0.0 di frame awal, 1.0 di frame akhir)
        const loopProgress = frame / durationInFrames;

        // --- TAHAP 1: BERSIHKAN FRAME ---
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

        // --- TAHAP 2: GAMBAR KEDALAMAN AIR BERBENTUK GRID CAIR ---
        // Kita merender dari atas layar (0) ke bawah layar (1080)
        for (let y = 0; y < RESOLUTION_HEIGHT; y += RENDER_STEP_PIXELS) {

            // Membuka path baru untuk setiap baris agar kita bisa menggambar garis bergelombang tebal
            ctx.beginPath();
            ctx.moveTo(0, y);

            // Menyusuri layar dari kiri (0) ke kanan (1920)
            for (let x = 0; x <= RESOLUTION_WIDTH; x += RENDER_STEP_PIXELS) {

                // Hitung tinggi riak air di koordinat ini
                const waveHeight = calculateWaveHeight(x, y, loopProgress);

                // Menambahkan distorsi mikro agar garis air tidak terlihat terlalu lurus/kaku
                const distortionY = y + waveHeight * 3.5;

                ctx.lineTo(x, distortionY);
            }

            // -- TAHAP 3: KALKULASI PEWARNAAN PELANGI (HSL) --

            // a. Hue Dasar yang berjalan berdasarkan waktu (membuat seluruh danau berubah warna seiring waktu)
            const timeBasedHue = loopProgress * 360 * COLOR_CONFIG.hueSpeedModifier;

            // b. Modifikasi Hue berdasarkan posisi Y untuk efek gradasi diagonal yang cantik
            // (y * 0.15) membuat pelangi terentang memanjang ke bawah layar.
            const spatialHue = (timeBasedHue + y * 0.15) % 360;

            // c. Modifikasi Saturasi dan Cahaya berdasarkan riak air (Wave Height)
            // Bagian puncak air (waveHeight positif) akan memantulkan lebih banyak cahaya,
            // Bagian lembah air (waveHeight negatif) akan terlihat sedikit lebih gelap.
            const sampleHeight = calculateWaveHeight(RESOLUTION_WIDTH / 2, y, loopProgress);
            const lightness = COLOR_CONFIG.baseLightness + (sampleHeight * 2.5);

            // Setup kuas garis dan terapkan di canvas
            ctx.strokeStyle = `hsl(${spatialHue}, ${COLOR_CONFIG.baseSaturation}%, ${lightness}%)`;
            ctx.lineWidth = RENDER_STEP_PIXELS * 1.5; // Dibuat sedikit bertumpuk (overlap) agar tidak ada celah hitam
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        // --- TAHAP 4: EFEK CAUSTICS (PANTULAN CAHAYA PERMUKAAN AIR) ---
        // Memberikan kilauan realistis pada air yang bergerak
        ctx.globalCompositeOperation = 'screen';

        for (let y = 0; y < RESOLUTION_HEIGHT; y += RENDER_STEP_PIXELS * 3) {
            for (let x = 0; x <= RESOLUTION_WIDTH; x += RENDER_STEP_PIXELS * 3) {
                const heightMap = calculateWaveHeight(x, y, loopProgress);

                // Hanya gambar kilauan cahaya di titik riak tertinggi (puncak gelombang)
                if (heightMap > 4.5) {
                    const intensity = (heightMap - 4.5) * 0.4;

                    ctx.beginPath();
                    // Buat bentuk elips pipih horizontal agar kilauannya terlihat seperti pantulan air
                    ctx.ellipse(x, y, 15 * intensity, 4 * intensity, 0, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.5})`;
                    ctx.fill();
                }
            }
        }

        // --- TAHAP 5: EFEK VIGNETTE (PENGGELAPAN SUDUT PINGGIR LAYAR) ---
        // Memberikan fokus dan kedalaman pada kamera top-down
        ctx.globalCompositeOperation = 'multiply';

        const centerX = RESOLUTION_WIDTH / 2;
        const centerY = RESOLUTION_HEIGHT / 2;
        const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);

        const vignetteGlow = ctx.createRadialGradient(
            centerX, centerY, maxRadius * 0.4,
            centerX, centerY, maxRadius
        );
        vignetteGlow.addColorStop(0, 'rgba(255, 255, 255, 1)'); // Putih bersih (tidak mengubah warna) di tengah
        vignetteGlow.addColorStop(1, 'rgba(100, 100, 100, 1)'); // Menggelapkan ujung batas layar

        ctx.fillStyle = vignetteGlow;
        ctx.fillRect(0, 0, RESOLUTION_WIDTH, RESOLUTION_HEIGHT);

        // Reset blend mode ke normal untuk frame berikutnya
        ctx.globalCompositeOperation = 'source-over';

    }, [frame, durationInFrames]);

    return (
        <canvas
            ref={canvasRef}
            width={RESOLUTION_WIDTH}
            height={RESOLUTION_HEIGHT}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: RESOLUTION_WIDTH,
                height: RESOLUTION_HEIGHT,
                zIndex: 1,
            }}
        />
    );
};

// ============================================================================
// 6. WRAPPER KOMPOSISI (UNTUK EXPORT REMOTION)
// ============================================================================

export const TopDownWaterComposition: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            <RainbowLakeTopDown />
        </AbsoluteFill>
    );
};

// ============================================================================
// 7. ROOT COMPOSITION (JIKA DIPANGGIL LANGSUNG)
// ============================================================================

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="TopDownRainbowLake"
                component={TopDownWaterComposition}
                durationInFrames={300} // Tepat 10 detik
                fps={30}
                width={RESOLUTION_WIDTH}
                height={RESOLUTION_HEIGHT}
            />
        </>
    );
};

export default TopDownWaterComposition;
