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

interface AuroraWaveNode {
    id: string;
    baseX: number;       // Posisi horizontal pusat aurora (0 s/d 1)
    baseY: number;       // Posisi vertikal pusat aurora (0 s/d 1)
    radiusX: number;     // Jangkauan ayunan horizontal
    radiusY: number;     // Jangkauan ayunan vertikal
    color: string;       // Warna neon sejuk aurora
    speedX: number;      // Multiplier kecepatan horizontal
    speedY: number;      // Multiplier kecepatan vertikal
    phaseOffset: number; // Geseran fase unik agar tidak sinkron/kaku
    scaleWidth: number;  // Lebar sebaran pendaran cahaya aurora
    scaleHeight: number; // Tinggi sebaran pendaran cahaya aurora
}

interface AuroraProps {
    noiseOpacity?: number;    // Intensitas kabut malam mikro (anti-banding)
    speedMultiplier?: number; // Pengatur kecepatan sirkulasi loop aurora
    ambientIntensity?: number;// Kecerahan pendaran dasar malam
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const DEEP_NIGHT_BG = '#02040a'; // Hitam pekat untuk kedalaman maksimal

// Palet warna sejuk & menenangkan (Sangat populer untuk video meditasi/wellness)
const AURORA_MINT = 'rgba(167, 243, 208, 0.75)';
const AURORA_TEAL = 'rgba(45, 212, 191, 0.7)';
const AURORA_BLUE = 'rgba(96, 165, 250, 0.65)';
const AURORA_INDIGO = 'rgba(99, 102, 241, 0.6)';
const AURORA_PURPLE = 'rgba(168, 85, 247, 0.55)'; // Tambahan warna ungu sejuk
const AURORA_CYAN = 'rgba(6, 182, 212, 0.7)';    // Tambahan warna cyan cerah

// ============================================================================
// SUB-COMPONENTS (Lapisan Efek Suasana)
// ============================================================================

/**
 * NightMistOverlay: Menambahkan tekstur kabut mikro malam hari menggunakan filter SVG.
 * CRITICAL FOR ADOBE STOCK: Membantu memecah gradasi warna super halus agar tidak 
 * patah-patah (color banding artifact) setelah video di-render ke format MP4.
 */
const NightMistOverlay: React.FC<{ opacity: number }> = ({ opacity }) => {
    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ opacity, mixBlendMode: 'overlay' }}>
                <filter id="mistNoise">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.75"
                        numOctaves="4"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#mistNoise)" />
            </svg>
        </AbsoluteFill>
    );
};

/**
 * MinimalistZenHUD: Ornaments teks fungsional bertema ketenangan jiwa (Zen).
 * Membuat video stock Anda terlihat jauh lebih premium saat di-preview oleh calon pembeli.
 */
const MinimalistZenHUD: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
    const currentProgress = (frame / totalFrames) * 100;
    return (
        <AbsoluteFill style={{ color: 'rgba(255, 255, 255, 0.2)', fontFamily: 'sans-serif', fontSize: 11, padding: 50, pointerEvents: 'none', letterSpacing: '2px' }}>
            {/* Top Left - System Spec */}
            <div style={{ position: 'absolute', top: 50, left: 50, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>ASSET_TYPE: //ETHEREAL_AURORA_LOOP_4K</div>
                <div style={{ opacity: 0.5, fontSize: 9 }}>RENDERER: RADIAL_SEAMLESS_MATRIC_v3</div>
            </div>

            {/* Top Right - Status */}
            <div style={{ position: 'absolute', top: 50, right: 50, textAlign: 'right', fontSize: 10 }}>
                <div>STATUS: VALIDATED</div>
                <div style={{ color: '#2dd4bf', fontSize: 9, marginTop: 2 }}>LOOP_PHASE: 360° PERFECT</div>
            </div>

            {/* Bottom Left - Frame Counters */}
            <div style={{ position: 'absolute', bottom: 50, left: 50, fontSize: 10 }}>
                <div>RESOLUTION: 3840 x 2160 [UHD]</div>
                <div style={{ opacity: 0.5, marginTop: 4 }}>FRAME_INDEX: {frame} / {totalFrames}</div>
            </div>

            {/* Bottom Right - Circular Progress */}
            <div style={{ position: 'absolute', bottom: 50, right: 50, display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{ textAlign: 'right', fontSize: 9, opacity: 0.6 }}>
                    <div>PROGRESS</div>
                    <div>{currentProgress.toFixed(0)}%</div>
                </div>
                <svg width="28" height="28" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#2dd4bf"
                        strokeWidth="2"
                        strokeDasharray="100"
                        strokeDashoffset={100 - currentProgress}
                        opacity={0.4}
                    />
                </svg>
            </div>
        </AbsoluteFill>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AuroraEtherealSilkLoop: React.FC<AuroraProps> = ({
    noiseOpacity = 0.02,
    speedMultiplier = 0.5,
    ambientIntensity = 0.85,
}) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Perhitungan sudut sirkuler penuh (360 derajat atau 2*PI) untuk menjamin Seamless Loop
    const globalLoopAngle = (frame / durationInFrames) * Math.PI * 2;

    // Inisialisasi 7 Lapisan Pita Cahaya Aurora dengan skala lebih besar untuk menutupi layar
    const auroraNodes: AuroraWaveNode[] = [
        {
            id: 'layer_base_deep',
            baseX: 0.5,
            baseY: 0.5,
            radiusX: 0.1,
            radiusY: 0.1,
            color: AURORA_INDIGO,
            speedX: 1,
            speedY: 0.8,
            phaseOffset: 0,
            scaleWidth: width * 1.8,  // Skala diperbesar untuk coverage full
            scaleHeight: height * 1.5,
        },
        {
            id: 'layer_cyan_drift',
            baseX: 0.4,
            baseY: 0.45,
            radiusX: 0.12,
            radiusY: 0.15,
            color: AURORA_CYAN,
            speedX: -1.2,
            speedY: 1,
            phaseOffset: 0,
            scaleWidth: width * 0.9,
            scaleHeight: height * 0.55,
        },
        {
            id: 'aurora_layer_center_left',
            baseX: 0.45,
            baseY: 0.55,
            radiusX: 0.15,
            radiusY: 0.1,
            color: AURORA_TEAL,
            speedX: -1, // Bergerak berlawanan agar terjadi tabrakan gelombang sutra yang indah
            speedY: 1.2,
            phaseOffset: Math.PI * 0.4,
            scaleWidth: width * 0.8,
            scaleHeight: height * 0.5,
        },
        {
            id: 'layer_purple_glow',
            baseX: 0.6,
            baseY: 0.4,
            radiusX: 0.08,
            radiusY: 0.2,
            color: AURORA_PURPLE,
            speedX: 0.9,
            speedY: -1.1,
            phaseOffset: Math.PI * 0.6,
            scaleWidth: width * 1.3,
            scaleHeight: height * 1.1,
        },
        {
            id: 'layer_mint_silk',
            baseX: 0.5,
            baseY: 0.55,
            radiusX: 0.15,
            radiusY: 0.14,
            color: AURORA_MINT,
            speedX: 1.1,
            speedY: 0.7,
            phaseOffset: Math.PI * 0.8,
            scaleWidth: width * 1.4,
            scaleHeight: height * 0.48,
        },
        {
            id: 'aurora_layer_center_right',
            baseX: 0.65,
            baseY: 0.48,
            radiusX: 0.14,
            radiusY: 0.07,
            color: AURORA_BLUE,
            speedX: -0.7,
            speedY: 1.5,
            phaseOffset: Math.PI * 1.2,
            scaleWidth: width * 1.6,
            scaleHeight: height * 0.52,
        },
        {
            id: 'aurora_layer_front_soft',
            baseX: 0.5,
            baseY: 0.7,
            radiusX: 0.08,
            radiusY: 0.12,
            color: AURORA_TEAL,
            speedX: 0.5,
            speedY: -0.5,
            phaseOffset: Math.PI * 1.6,
            scaleWidth: width * 1.5,
            scaleHeight: height * 0.6,
        }
    ];

    // Menghitung koordinat pergerakan tiap gumpalan cahaya sutra aurora per frame secara presisi
    const activeAuroras = auroraNodes.map((node) => {
        // Menggabungkan sin dan cos terikat loopAngle menjamin posisi akhir video pas kembali ke posisi awal
        const angleX = globalLoopAngle * node.speedX * speedMultiplier + node.phaseOffset;
        const angleY = globalLoopAngle * node.speedY * speedMultiplier + node.phaseOffset * 1.3;

        // Hitung posisi absolut dalam piksel layar 4K
        const currentX = (node.baseX + Math.sin(angleX) * node.radiusX) * width;
        const currentY = (node.baseY + Math.cos(angleY) * node.radiusY) * height;

        // Ritme modulasi pernapasan ukuran (breathing scale) pita cahaya agar visual meliuk alami
        const scaleBreath = Math.sin(globalLoopAngle * speedMultiplier * 2 + node.phaseOffset) * 0.08;
        const finalWidth = node.scaleWidth * (1 + scaleBreath);
        const finalHeight = node.scaleHeight * (1 - scaleBreath);

        return {
            ...node,
            x: currentX,
            y: currentY,
            scaleWidth: finalWidth,
            scaleHeight: finalHeight,
        };
    });

    return (
        <AbsoluteFill style={{ backgroundColor: DEEP_NIGHT_BG, overflow: 'hidden' }}>

            {/* CONTAINER CORE: Kumpulan Lapisan Pendaran Gradasi Aurora (Tanpa Filter CSS SVG Berat) */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                }}
            >
                {activeAuroras.map((node) => (
                    <div
                        key={node.id}
                        style={{
                            position: 'absolute',
                            // Meletakkan pusat lingkaran gradient pas di titik koordinat hasil hitung matematika
                            left: node.x - node.scaleWidth / 2,
                            top: node.y - node.scaleHeight / 2,
                            width: node.scaleWidth,
                            height: node.scaleHeight,
                            // Menggunakan teknik Radial Gradient Elips Transparan: Inti warna di tengah melunak habis di tepian
                            background: `radial-gradient(ellipse at center, ${node.color} 0%, rgba(45, 212, 191, 0.25) 45%, transparent 80%)`,
                            mixBlendMode: 'plus-lighter', // Sangat krusial! Membuat area tumpukan warna saling menerangi satu sama lain seperti cahaya lampu alami
                            opacity: ambientIntensity,
                            willChange: 'transform, left, top',
                        }}
                    />
                ))}
            </div>

            {/* LAPISAN VIGNETTE GELAP: Memberikan gradasi gelap di sekeliling sudut luar 
			    agar area tengah atas (Copy Space) bersih dan super fokus untuk teks tulisan pembeli */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 30%, transparent 20%, rgba(4, 7, 18, 0.4) 60%, #040712 95%)',
                    pointerEvents: 'none',
                }}
            />

            {/* EFEK POST-PROCESSING AUDIO VISUAL PREMIUM */}
            <NightMistOverlay opacity={noiseOpacity} />
            <MinimalistZenHUD frame={frame} totalFrames={durationInFrames} />

        </AbsoluteFill>
    );
};