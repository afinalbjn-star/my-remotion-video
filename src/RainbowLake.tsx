import React, { useEffect, useRef } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

// ============================================================================
// 1. KONFIGURASI DAN KONSTANTA GRAFIS
// ============================================================================

/**
 * Dimensi standar untuk video Full HD.
 * Kita definisikan di dalam file ini agar komponen bersifat mandiri (self-contained).
 */
const VIDEO_WIDTH = 3840;
const VIDEO_HEIGHT = 2160;


/**
 * Konfigurasi video untuk komposisi RainbowLake.
 * 4K (3840x2160) pada 60fps, durasi 10 detik (600 frame), seamless loop.
 */
export const VIDEO_CONFIG = {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    fps: 60,
    durationInFrames: 600,
};
/**
 * Palet warna dasar untuk lingkungan di luar air pelangi.
 * Menggunakan warna-warna gelap dan deep purple untuk memberikan kontras
 * yang kontras dan dramatis terhadap air danau yang berwarna-warni.
 */
const ENVIRONMENT_COLORS = {
    skyTop: '#060214',           // Ungu gelap mendekati hitam untuk langit atas
    skyMid: '#160a2b',           // Ungu malam untuk langit tengah
    skyBottom: '#341a5e',        // Ungu cerah di dekat cakrawala sebelum gunung
    mountainBody: '#09041a',     // Siluet gunung utama
    mountainStroke: '#1b0d3a',   // Garis tepi gunung agar terlihat dimensi kartun/vektor
    starColor: '#ffffff',        // Warna bintang di langit
};

// ============================================================================
// 2. STRUKTUR DATA & DRAFT LAPISAN GELOMBANG (INTERFACES)
// ============================================================================

/**
 * Antarmuka untuk mengatur properti matematis setiap lapisan gelombang air.
 * Semakin banyak variasi layer, gerakan air akan terlihat semakin organik.
 */
interface WaveLayerParameter {
    amplitude: number;       // Tinggi rendahnya gelombang (piksel)
    frequency: number;       // Jarak antar puncak gelombang (kerapatan)
    phaseSpeed: number;      // Kecepatan pergeseran gelombang per detik
    verticalOffset: number;  // Pergeseran posisi vertikal relatif
    hueShift: number;        // Deviasi warna HSL khusus untuk layer ini
    opacity: number;         // Transparansi garis gelombang
    lineWidth: number;       // Ketebalan garis gelombang di canvas
}

/**
 * Array berisi 10 lapisan gelombang air yang berbeda.
 * Kombinasi angka-angka prima dan desimal acak di bawah ini memastikan bahwa
 * pola gelombang tidak terlihat monoton dan mengulang secara kaku di tengah durasi.
 */
const DETAILED_WAVE_LAYERS: WaveLayerParameter[] = [
    { amplitude: 14, frequency: 0.0025, phaseSpeed: 1.1, verticalOffset: 0, hueShift: 0, opacity: 0.22, lineWidth: 2.5 },
    { amplitude: 11, frequency: 0.0045, phaseSpeed: 1.6, verticalOffset: 12, hueShift: 35, opacity: 0.28, lineWidth: 2.0 },
    { amplitude: 17, frequency: 0.0018, phaseSpeed: 0.7, verticalOffset: 28, hueShift: 75, opacity: 0.18, lineWidth: 3.5 },
    { amplitude: 9, frequency: 0.0065, phaseSpeed: 2.4, verticalOffset: 45, hueShift: 120, opacity: 0.32, lineWidth: 1.5 },
    { amplitude: 13, frequency: 0.0038, phaseSpeed: 1.3, verticalOffset: 65, hueShift: 160, opacity: 0.25, lineWidth: 2.2 },
    { amplitude: 19, frequency: 0.0012, phaseSpeed: 0.5, verticalOffset: 90, hueShift: 210, opacity: 0.15, lineWidth: 4.5 },
    { amplitude: 8, frequency: 0.0085, phaseSpeed: 3.0, verticalOffset: 115, hueShift: 250, opacity: 0.38, lineWidth: 1.2 },
    { amplitude: 15, frequency: 0.0031, phaseSpeed: 1.0, verticalOffset: 135, hueShift: 290, opacity: 0.20, lineWidth: 2.8 },
    { amplitude: 10, frequency: 0.0052, phaseSpeed: 1.9, verticalOffset: 160, hueShift: 320, opacity: 0.30, lineWidth: 1.8 },
    { amplitude: 22, frequency: 0.0010, phaseSpeed: 0.4, verticalOffset: 190, hueShift: 350, opacity: 0.12, lineWidth: 5.0 },
];

// ============================================================================
// 3. LOGIKA MATEMATIKA UNTUK SEAMLESS LOOPING
// ============================================================================

/**
 * Menghitung nilai proyeksi melingkar menggunakan Sinus dan Kosinus.
 * Kunci dari seamless loop adalah memetakan waktu linear (frame 0 sampai 300)
 * ke dalam koordinat lingkaran penuh (0 sampai 2 * PI Radian).
 * Dengan cara ini, titik akhir video akan kembali ke titik awal secara mulus.
 */
const calculateSeamlessAngles = (currentFrame: number, totalDurationFrames: number) => {
    const totalRadians = Math.PI * 2;
    const currentProgress = currentFrame / totalDurationFrames;
    const targetAngle = currentProgress * totalRadians;

    return {
        sinValue: Math.sin(targetAngle),
        cosValue: Math.cos(targetAngle),
    };
};

// ============================================================================
// 4. SUB-KOMPONEN LINGKUNGAN: LANGIT MALAM & BINTANG
// ============================================================================

const SkyBackgroundLayer: React.FC = () => {
    return (
        <svg
            style={{
                position: 'absolute',
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT,
                top: 0,
                left: 0,
                zIndex: 1,
            }}
        >
            <defs>
                {/* Pembuatan gradasi vertikal tiga warna untuk atmosfer langit */}
                <linearGradient id="skyAtmosphereGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={ENVIRONMENT_COLORS.skyTop} />
                    <stop offset="50%" stopColor={ENVIRONMENT_COLORS.skyMid} />
                    <stop offset="100%" stopColor={ENVIRONMENT_COLORS.skyBottom} />
                </linearGradient>

                {/* Pola koordinat bintang berulang menggunakan SVG Pattern */}
                <pattern id="starFieldPattern" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="25" r="1.2" fill={ENVIRONMENT_COLORS.starColor} opacity="0.7" />
                    <circle cx="65" cy="85" r="1.8" fill={ENVIRONMENT_COLORS.starColor} opacity="0.4" />
                    <circle cx="115" cy="40" r="1.0" fill={ENVIRONMENT_COLORS.starColor} opacity="0.8" />
                    <circle cx="40" cy="120" r="1.5" fill={ENVIRONMENT_COLORS.starColor} opacity="0.5" />
                    <circle cx="130" cy="110" r="0.8" fill={ENVIRONMENT_COLORS.starColor} opacity="0.6" />
                </pattern>
            </defs>

            {/* Menggambar kotak background dengan warna gradasi langit */}
            <rect width={VIDEO_WIDTH} height={VIDEO_HEIGHT} fill="url(#skyAtmosphereGrad)" />

            {/* Menimpa di atasnya dengan layer bintik-bintik bintang */}
            <rect width={VIDEO_WIDTH} height={VIDEO_HEIGHT} fill="url(#starFieldPattern)" />
        </svg>
    );
};

// ============================================================================
// 5. SUB-KOMPONEN LINGKUNGAN: SILUET GUNUNG & CAHAYA HORIZON
// ============================================================================

const LakeSceneryLayer: React.FC = () => {
    const currentFrame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Ambil data lingkaran untuk menganimasikan efek denyut cahaya secara seamless
    const { sinValue } = calculateSeamlessAngles(currentFrame, durationInFrames);
    const horizonLineY = VIDEO_HEIGHT * 0.45; // Batas air dan langit

    /**
     * Path SVG buatan tangan untuk membentuk pegunungan yang megah di kejauhan.
     * M = Mulai koordinat, L = Garis lurus, Q/T = Garis lengkung kuadratik bezier.
     */
    const mountainVectorPath = `
		M 0 ${horizonLineY}
		L 0 ${horizonLineY - 90}
		Q 200 ${horizonLineY - 240} 450 ${horizonLineY - 140}
		T 950 ${horizonLineY - 210}
		T 1400 ${horizonLineY - 110}
		Q 1650 ${horizonLineY - 280} ${VIDEO_WIDTH} ${horizonLineY - 160}
		L ${VIDEO_WIDTH} ${horizonLineY}
		Z
	`;

    // Mengatur opacity cahaya di belakang gunung agar berdenyut lembut (efek bernafas)
    const dynamicGlowOpacity = 0.45 + sinValue * 0.08;

    return (
        <svg
            style={{
                position: 'absolute',
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT,
                top: 0,
                left: 0,
                zIndex: 3, // Diletakkan di indeks 3 agar berada di atas kanvas air pelangi
                pointerEvents: 'none',
            }}
        >
            <defs>
                {/* Efek pendaran cahaya bulan/aura magis tersembunyi di balik bukit */}
                <radialGradient id="auroraHorizonGlow" cx="50%" cy="42%" r="55%">
                    <stop offset="0%" stopColor="#ffd6ff" stopOpacity="0.65" />
                    <stop offset="45%" stopColor="#6d28d9" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Gambar pendaran cahaya lingkaran */}
            <ellipse
                cx={VIDEO_WIDTH * 0.5}
                cy={horizonLineY - 40}
                rx={500}
                ry={350}
                fill="url(#auroraHorizonGlow)"
                opacity={dynamicGlowOpacity}
            />

            {/* Gambar siluet pegunungan */}
            <path
                d={mountainVectorPath}
                fill={ENVIRONMENT_COLORS.mountainBody}
                stroke={ENVIRONMENT_COLORS.mountainStroke}
                strokeWidth="2"
            />

            {/* Garis pemisah kabut tipis tepat di area cakrawala danau */}
            <line
                x1="0"
                y1={horizonLineY}
                x2={VIDEO_WIDTH}
                y2={horizonLineY}
                stroke="#4c1d95"
                strokeWidth="3"
                opacity="0.6"
            />
        </svg>
    );
};

// ============================================================================
// 6. KOMPONEN ENGINE UTAMA: GERAKAN AIR PELANGI (HTML5 CANVAS)
// ============================================================================

const RainbowWaterCanvas: React.FC = () => {
    const currentFrame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const canvasElementRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const targetCanvas = canvasElementRef.current;
        if (!targetCanvas) return;

        const canvasContext = targetCanvas.getContext('2d');
        if (!canvasContext) return;

        // --- A. MEMBERSIHKAN CANVAS ---
        canvasContext.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

        // --- B. AMBIL LOGIKA LOOP SEAMLESS ---
        const { sinValue, cosValue } = calculateSeamlessAngles(currentFrame, durationInFrames);
        const waterHorizonY = VIDEO_HEIGHT * 0.45;

        // --- C. GAMBAR WARNA DASAR DANAU ---
        // Memberikan gradasi gelap di bawah agar warna pelangi garis di atasnya terlihat menyala
        const waterBaseGradient = canvasContext.createLinearGradient(0, waterHorizonY, 0, VIDEO_HEIGHT);
        waterBaseGradient.addColorStop(0, '#110729');
        waterBaseGradient.addColorStop(1, '#03010a');
        canvasContext.fillStyle = waterBaseGradient;
        canvasContext.fillRect(0, waterHorizonY, VIDEO_WIDTH, VIDEO_HEIGHT - waterHorizonY);

        // --- D. RENDER SCANLINE GELOMBANG SECARA VERTIKAL ---
        // Iterasi setiap jarak 6 piksel ke bawah untuk menciptakan kepadatan air rapi
        for (let currentY = waterHorizonY; currentY < VIDEO_HEIGHT; currentY += 6) {

            // Menghitung rasio kedalaman air (0 = paling jauh di ufuk, 1 = paling dekat di layar)
            const relativeDepthProgress = (currentY - waterHorizonY) / (VIDEO_HEIGHT - waterHorizonY);

            canvasContext.beginPath();
            canvasContext.moveTo(0, currentY);

            const horizontalPixelStep = 4; // Menggambar titik koordinat setiap lompatan 4 piksel ke kanan

            for (let currentX = 0; currentX <= VIDEO_WIDTH; currentX += horizontalPixelStep) {
                let combinedWaveDisplacement = 0;

                // Kalkulasi pergeseran posisi air berdasarkan 10 layer parameter gelombang
                DETAILED_WAVE_LAYERS.forEach((layerConfig, layerIndex) => {

                    // OPERASI MATRIX MEMUTAR:
                    // Menggabungkan sinValue dan cosValue dari loop global dengan pengali kecepatan layer.
                    // Ini membuat gelombang bergerak maju mundur berputar secara periodik sempurna.
                    const animatedPhaseX = sinValue * layerConfig.phaseSpeed + (layerIndex * 12.5);
                    const animatedPhaseY = cosValue * layerConfig.phaseSpeed - (layerIndex * 7.3);

                    // Hitung sudut komponen gelombang X dan Y
                    const waveAngleX = currentX * layerConfig.frequency + animatedPhaseX;
                    const waveAngleY = currentY * 0.012 + animatedPhaseY;

                    // Formula interferensi gelombang sinus-kosinus kompleks
                    const individualDisplacement = Math.sin(waveAngleX + Math.cos(waveAngleY)) * layerConfig.amplitude;

                    // EFEK PERSPEKTIF: Gelombang di depan mata (bawah) harus digambar lebih besar dibanding di kejauhan
                    combinedWaveDisplacement += individualDisplacement * (1.0 + relativeDepthProgress * 1.8);
                });

                // Tentukan titik Y akhir setelah distorsi gelombang air pelangi
                const finalizedCalculatedY = currentY + combinedWaveDisplacement * 0.35;
                canvasContext.lineTo(currentX, finalizedCalculatedY);
            }

            // --- E. FORMULA PEWARNAAN PELANGI DINAMIS (HSL) ---

            // 1. Membuat Hue berputar penuh 360 derajat seiring jalannya waktu video (10 detik)
            const globalTimeHue = (currentFrame / durationInFrames) * 360;

            // 2. Kombinasikan Hue waktu dengan posisi Y dan progres kedalaman agar menciptakan
            // spektrum warna pelangi yang terdistribusi merata dari merah ke ungu di seluruh danau.
            const finalizedLineHue = (globalTimeHue + (currentY * 0.38) + (relativeDepthProgress * 140)) % 360;

            // 3. Efek visual air riak: Saturasi agak diturunkan di dekat bagian bawah agar tidak terlalu merusak mata
            const lineSaturation = 90 - relativeDepthProgress * 25;

            // 4. Berikan efek kilauan intensitas cahaya air menggunakan sin lingkaran
            const lineLightness = 46 + Math.sin(sinValue + currentY * 0.04) * 6;

            // 5. Hitung Opacity: Garis gelombang di dekat horizon dibuat sedikit lebih rapat/samar
            const lineAlpha = 0.14 + (1.0 - relativeDepthProgress) * 0.24;

            // Terapkan kuas pewarnaan ke garis canvas saat ini
            canvasContext.strokeStyle = `hsla(${finalizedLineHue}, ${lineSaturation}%, ${lineLightness}%, ${lineAlpha})`;
            canvasContext.lineWidth = 1.3 + relativeDepthProgress * 2.2; // Garis depan lebih tebal dari garis belakang
            canvasContext.stroke();
        }

        // --- F. PROSES POST-GLOW SCREEN OVERLAY ---
        // Menambahkan efek pencahayaan film bioskop di atas permukaan air agar atmosfer menyatu
        canvasContext.globalCompositeOperation = 'screen';
        const atmosphericGlowGrad = canvasContext.createLinearGradient(0, waterHorizonY, 0, VIDEO_HEIGHT);
        atmosphericGlowGrad.addColorStop(0, 'rgba(139, 92, 246, 0.18)');   // Soft Violet Glow di kejauhan
        atmosphericGlowGrad.addColorStop(0.4, 'rgba(6, 182, 212, 0.06)');  // Soft Cyan Glow di tengah danau
        atmosphericGlowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');           // Gelap tanpa glow di bawah layar

        canvasContext.fillStyle = atmosphericGlowGrad;
        canvasContext.fillRect(0, waterHorizonY, VIDEO_WIDTH, VIDEO_HEIGHT - waterHorizonY);

        // Kembalikan operasi pencampuran kanvas ke default
        canvasContext.globalCompositeOperation = 'source-over';

    }, [currentFrame, durationInFrames]);

    return (
        <canvas
            ref={canvasElementRef}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: VIDEO_WIDTH,
                height: VIDEO_HEIGHT,
                zIndex: 2, // Terjepit aman di antara background langit (1) dan pegunungan (3)
            }}
        />
    );
};

// ============================================================================
// 7. KOMPONEN UTAMA VIDEO (DIPANGGIL DI ROOT / COMPOSITION)
// ============================================================================

/**
 * Komponen utama yang menyatukan semua sub-layer grafis.
 * Komponen ini yang perlu dimasukkan ke properti `component` di Remotion <Composition />.
 */
const RainbowLakeVideo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
            {/* Lapisan Latar Belakang 1: Langit Gradasi & Hamparan Bintang */}
            <SkyBackgroundLayer />

            {/* Lapisan Latar Belakang 2: Simulasi Air Danau Bergelombang Efek Pelangi */}
            <RainbowWaterCanvas />

            {/* Lapisan Latar Belakang 3: Vektor Siluet Gunung & Pendaran Cahaya Horizon */}
            <LakeSceneryLayer />
        </AbsoluteFill>
    );
};
export default RainbowLakeVideo;
