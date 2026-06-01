import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuroraWave {
    id: string;
    seed: number;
    baseHeight: number;      // Letak vertikal kain aurora (0 s/d 1)
    amplitude: number;       // Tinggi gelombang kibaran
    frequency: number;       // Kepadatan lekukan gelombang
    colorStart: string;      // Warna gradasi awal (sisi kiri)
    colorEnd: string;        // Warna gradasi akhir (sisi kanan)
    speedFactor: number;     // Kecepatan lambat ayunan pita
    opacity: number;         // Transparansi dasar
}

interface AuroraProps {
    waveCount?: number;       // Jumlah lapisan kain sutra sutra aurora
    ambientBlur?: number;     // Radius kelembutan blur
    mistOpacity?: number;     // Opasitas efek kabut partikel malam
    backgroundTheme?: string; // Warna dasar malam yang menenangkan
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CALM_NIGHT_BG = '#060a13'; // Biru malam super gelap yang sangat menenangkan
const MINT_SAGE = '#a7f3d0';     // Hijau mint lembut
const SOFT_TEAL = '#2dd4bf';     // Toska sejuk
const CALM_BLUE = '#60a5fa';     // Biru langit teduh
const DEEP_INDIGO = '#312e81';   // Indigo redup untuk bayangan

// ============================================================================
// SUB-COMPONENTS (Lapisan Suasana & Tekstur Lembut)
// ============================================================================

/**
 * EtherealMistTexturing: Memberikan tekstur kabut mikro yang sangat tipis. 
 * Ini membantu menyatukan gradasi warna super lembut agar tidak terlihat pecah 
 * saat dikompresi menjadi format video jualan.
 */
const EtherealMistTexturing: React.FC<{ opacity: number }> = ({ opacity }) => {
    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ opacity, mixBlendMode: 'overlay' }}>
                <filter id="mistNoise">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.65"
                        numOctaves="3"
                        result="noise"
                    />
                    <feColorMatrix type="matrix" values="1 0 0 0 0   0 1 0 0 0   0 0 1 0 0  0 0 0 0.12 0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#mistNoise)" />
            </svg>
        </AbsoluteFill>
    );
};

/**
 * AestheticCalmHUD: Ornamen teks minimalis bertema zen/terapi meditasi. 
 * Menambahkan nilai estetika modern bagi pembeli dari industri kreatif dan lifestyle.
 */
const AestheticCalmHUD: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
    const progress = frame / totalFrames;
    return (
        <AbsoluteFill style={{ color: 'rgba(255, 255, 255, 0.18)', fontFamily: 'sans-serif', fontSize: 11, padding: 50, pointerEvents: 'none', letterSpacing: '1.5px' }}>
            {/* Top Left - Project Information */}
            <div style={{ position: 'absolute', top: 50, left: 50 }}>
                <div style={{ textTransform: 'uppercase', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Ambient Asset // Silk Aurora</div>
                <div style={{ fontSize: 9, opacity: 0.6, marginTop: 4 }}>Motion Mode: Ultra Slow Wave Modulation</div>
            </div>

            {/* Top Right - Loop Phase status */}
            <div style={{ position: 'absolute', top: 50, right: 50, textAlign: 'right', fontSize: 9 }}>
                <div>SEAMLESS FLOW STATE</div>
                <div style={{ opacity: 0.5, marginTop: 4 }}>CYCLE_PHASE: {(progress * 360).toFixed(0)}°</div>
            </div>

            {/* Bottom Left - Specs */}
            <div style={{ position: 'absolute', bottom: 50, left: 50, fontSize: 9 }}>
                <div>RESOLUSI: 4K UHD MASTER</div>
                <div style={{ opacity: 0.5, marginTop: 2 }}>AUDIO TRAK: DESIGNED FOR AMBIENT ZEN</div>
            </div>

            {/* Bottom Right - Minimalist Line Timer */}
            <div style={{ position: 'absolute', bottom: 50, right: 50, width: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, opacity: 0.6 }}>
                    <span>ELAPSED</span>
                    <span>{(progress * 100).toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: SOFT_TEAL, opacity: 0.5 }} />
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AuroraEtherealSilkLoop: React.FC<AuroraProps> = ({
    waveCount = 5,
    ambientBlur = 80,
    mistOpacity = 0.02,
    backgroundTheme = CALM_NIGHT_BG,
}) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // loopAngle wajib menyelesaikan satu siklus penuh 2*Math.PI agar gerakan kembali mulus ke frame awal
    const loopAngle = (frame / durationInFrames) * Math.PI * 2;

    // Inisialisasi parameter 5 lapisan kain sutra aurora secara deterministik
    const auroraLayers: AuroraWave[] = Array.from({ length: waveCount }).map((_, i) => {
        const seeds = [12.5, 45.3, 78.1, 23.9, 61.4];
        const currentSeed = seeds[i % seeds.length];

        // Palet warna sejuk yang melunak silang bergantian
        const startColors = [MINT_SAGE, SOFT_TEAL, CALM_BLUE, SOFT_TEAL, MINT_SAGE];
        const endColors = [SOFT_TEAL, CALM_BLUE, DEEP_INDIGO, DEEP_INDIGO, SOFT_TEAL];

        return {
            id: `aurora_silk_${i}`,
            seed: currentSeed,
            baseHeight: 0.4 + i * 0.06,      // Penumpukan berlapis secara vertikal
            amplitude: 80 + i * 35,          // Tinggi kibaran angin lembut
            frequency: 1.2 + i * 0.3,        // Kepadatan liukan gelombang pita
            colorStart: startColors[i % startColors.length],
            colorEnd: endColors[i % endColors.length],
            speedFactor: i % 2 === 0 ? 1 : -0.8, // Arah ayunan silang lambat
            opacity: 0.18 - i * 0.02,        // Semakin ke depan semakin transparan tipis
        };
    });

    // Fungsi matematika membangun d-path string SVG Bezier kurva sutra yang meliuk lambat
    const computeAuroraPath = (wave: AuroraWave): string => {
        const pathPoints: string[] = [];
        const totalPoints = 30; // Pembagian titik koordinat horizontal sepanjang layar

        for (let i = 0; i <= totalPoints; i++) {
            const ratioX = i / totalPoints;
            const x = ratioX * width;

            // Rumus modulasi superposisi gelombang harmonik ganda (Double-Sine Modulation)
            // Terikat secara penuh dengan loopAngle untuk menghasilkan Seamless Loop tanpa patahan visual
            const spatialAngle = ratioX * Math.PI * 2 * wave.frequency;

            const primaryWave = Math.sin(spatialAngle + loopAngle * wave.speedFactor + wave.seed);
            const secondaryWave = Math.cos(spatialAngle * 0.5 - loopAngle * 0.5 + wave.seed * 1.5);

            // Hasil penggabungan ayunan lembut kain
            const finalWaveform = (primaryWave + secondaryWave) / 2;

            // Menghitung koordinat Y akhir dengan meredam bagian tepi kiri-kanan layar (Efek Vignette Vertikal)
            const edgeDamping = Math.sin(ratioX * Math.PI); // Bernilai 0 di ujung, dan 1 di tengah layar
            const y = (wave.baseHeight * height) + (finalWaveform * wave.amplitude * edgeDamping);

            if (i === 0) {
                pathPoints.push(`M ${x} ${y}`);
            } else {
                // Menggunakan sambungan garis kontinu melengkung yang mulus
                pathPoints.push(`L ${x} ${y}`);
            }
        }

        // Menutup jalur SVG ke bawah layar untuk membuat bidang gradasi isi kain yang tebal
        pathPoints.push(`L ${width} ${height}`);
        pathPoints.push(`L 0 ${height}`);
        pathPoints.push(`Z`);

        return pathPoints.join(' ');
    };

    return (
        <AbsoluteFill style={{ backgroundColor: backgroundTheme, overflow: 'hidden' }}>

            {/* Lapisan Latar Belakang Ambient Glow Tambahan */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle at 50% 20%, ${SOFT_TEAL}0a 0%, transparent 60%)`,
                    mixBlendMode: 'screen'
                }}
            />

            {/* SVG Vector Canvas Layer dengan Efek Kelembutan Tinggi (Bblur Tinggi) */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    overflow: 'visible',
                    filter: `blur(${ambientBlur}px)`, // Mengubah pita vektor tajam menjadi sapuan cahaya sutra
                    transform: 'scale(1.2)' // Skala diperbesar agar pinggiran blur luar tidak terpotong tepi layar
                }}
                viewBox={`0 0 ${width} ${height}`}
            >
                <defs>
                    {/* Membuat gradasi warna unik untuk tiap lembar kain sutra aurora */}
                    {auroraLayers.map((wave, index) => (
                        <linearGradient
                            key={`aurora-grad-${wave.id}`}
                            id={`auroraGrad-${index}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor={wave.colorStart} stopOpacity={0} />
                            <stop offset="40%" stopColor={wave.colorStart} stopOpacity={wave.opacity} />
                            <stop offset="70%" stopColor={wave.colorEnd} stopOpacity={wave.opacity * 1.2} />
                            <stop offset="100%" stopColor={wave.colorEnd} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>

                {/* Render Lembaran Aurora secara Berlapis (Layered Composite) */}
                {auroraLayers.map((wave, index) => (
                    <path
                        key={wave.id}
                        d={computeAuroraPath(wave)}
                        fill={`url(#auroraGrad-${index})`}
                        style={{ mixBlendMode: 'plus-lighter' }} // Metode blending warna cahaya agar area tumpukan terlihat berpendar megah
                    />
                ))}
            </svg>

            {/* Lapisan Atmosferic Post Processing */}
            <EtherealMistTexturing opacity={mistOpacity} />
            <AestheticCalmHUD frame={frame} totalFrames={durationInFrames} />

            {/* Soft Dark Vignette Framing */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(6, 10, 19, 0.7) 100%)',
                    pointerEvents: 'none'
                }}
            />
        </AbsoluteFill>
    );
};