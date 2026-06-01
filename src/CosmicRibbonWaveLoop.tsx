import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface RibbonConfig {
    id: string;
    waveCount: number;       // Jumlah lekukan gelombang pada pita
    amplitude: number;       // Tinggi gelombang maks
    baseY: number;           // Posisi vertikal dasar pita (persentase tinggi layar)
    thickness: number;       // Ketebalan stroke garis pita
    primaryColor: string;    // Warna gradasi awal pita
    secondaryColor: string;  // Warna gradasi akhir pita
    phaseShift: number;      // Pergeseran fase unik untuk variasi gerakan
    speedFactor: number;     // Multiplier kecepatan ayunan
    dashArray?: string;      // Pola garis putus-putus untuk gaya teknologi
}

interface CosmicRibbonProps {
    ribbonCount?: number;     // Jumlah total pita sutra digital di layar
    cosmicBackground?: string;// Warna dasar luar angkasa pekat
    noiseOpacity?: number;    // Intensitas tekstur partikel bintang mikro
    glowIntensity?: number;   // Radius efek neon glowing pada pita
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_BG = '#050b1a'; // Deep Navy (Warna navy kosmis)
const COLOR_PALETTE_PRIMARY = ['#a855f7', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#06b6d4', '#fbbf24', '#f87171'];
const COLOR_PALETTE_SECONDARY = ['#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#e11d48', '#8b5cf6', '#34d399', '#f472b6'];

// ============================================================================
// SUB-COMPONENTS (Lapisan Estetika Kosmis)
// ============================================================================

/**
 * CosmicStarDust: Menyuntikkan tekstur debu bintang halus di latar belakang 
 * untuk memberikan sensasi kedalaman ruang angkasa yang mewah.
 */
const CosmicStarDust: React.FC<{ opacity: number }> = ({ opacity }) => {
    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ opacity }}>
                <filter id="starNoise">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.95"
                        numOctaves="3"
                        result="noise"
                    />
                    <feColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1  0 0 0 0.25 0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#starNoise)" />
            </svg>
        </AbsoluteFill>
    );
};

/**
 * TechnicalOverlayHUD: Menampilkan informasi diagnostik orbit kosmis minimalis 
 * untuk memperkuat nilai jual komersial bertema fiksi ilmiah / sci-fi.
 */
const TechnicalOverlayHUD: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
    const ratio = frame / totalFrames;
    return (
        <AbsoluteFill style={{ color: 'rgba(255, 255, 255, 0.2)', fontFamily: 'monospace', fontSize: 11, padding: 45, pointerEvents: 'none' }}>
            {/* Top Left Bar */}
            <div style={{ position: 'absolute', top: 45, left: 45 }}>
                <div style={{ letterSpacing: '3px', color: 'rgba(255,255,255,0.4)' }}>ORBITAL_PATH: //COSMIC_RIBBON_v2</div>
                <div style={{ fontSize: 9, marginTop: 4, opacity: 0.6 }}>FREQ_MODULATION: MULTI_HARMONIC_SINE</div>
            </div>

            {/* Top Right Grid Data */}
            <div style={{ position: 'absolute', top: 45, right: 45, textAlign: 'right' }}>
                <div>RESOLUTION: 3840 X 2160 [4K UHD]</div>
                <div style={{ color: '#10b981', fontSize: 10, marginTop: 2 }}>LOOP_STATE: PERFECT_SEAMLESS</div>
            </div>

            {/* Center Frame Corner Ticks (Simulasi Bidik Kamera) */}
            <div style={{ position: 'absolute', top: '15%', left: '10%', width: 15, height: 15, borderLeft: '1.5px solid rgba(255,255,255,0.08)', borderTop: '1.5px solid rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', top: '15%', right: '10%', width: 15, height: 15, borderRight: '1.5px solid rgba(255,255,255,0.08)', borderTop: '1.5px solid rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 15, height: 15, borderLeft: '1.5px solid rgba(255,255,255,0.08)', borderBottom: '1.5px solid rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 15, height: 15, borderRight: '1.5px solid rgba(255,255,255,0.08)', borderBottom: '1.5px solid rgba(255,255,255,0.08)' }} />

            <div style={{ position: 'absolute', bottom: 45, right: 45, width: 160, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'between', fontSize: 9, opacity: 0.7 }}>
                    <span>PHASE_TIME</span>
                    <span style={{ marginLeft: 'auto' }}>{frame}F</span>
                </div>
                <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${ratio * 100}%`, height: '100%', backgroundColor: '#a855f7' }} />
                </div>
            </div>
        </AbsoluteFill>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CosmicRibbonWaveLoop: React.FC<CosmicRibbonProps> = ({
    ribbonCount = 25, // Jumlah pita ditingkatkan drastis untuk menutupi layar
    cosmicBackground = DEFAULT_BG,
    noiseOpacity = 0.035,
    glowIntensity = 40, // Intensitas pendaran ditingkatkan drastis
}) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // loopAngle wajib menyelesaikan satu siklus penuh 2*PI agar transisi di ujung video mulus kembali ke awal
    const loopAngle = (frame / durationInFrames) * Math.PI * 2;

    // Inisialisasi konfigurasi data pita secara statis-deterministik tanpa Math.random() acak 
    // Hal ini sangat penting di Remotion agar hasil render frame-by-frame selalu konsisten.
    const ribbons: RibbonConfig[] = useMemo(() => Array.from({ length: ribbonCount }).map((_, index) => {
        const waveMultiplier = 1.5 + (index * 0.4);

        // Variasi ketebalan pita
        const thickness = index % 3 === 0 ? 4 : index % 2 === 0 ? 2.5 : 1.5;

        // Garis putus-putus acak untuk pita bernuansa tekno di lapisan tertentu
        const dashArray = index % 3 === 1 ? '8, 12' : index % 4 === 3 ? '4, 6' : undefined;

        // Mengatur distribusi vertikal agar menyebar dari atas ke bawah (10% - 90%)
        const baseY = 0.1 + (index * (0.8 / (ribbonCount - 1)));

        return {
            id: `ribbon_node_${index}`,
            waveCount: waveMultiplier,
            amplitude: 80 + (index % 5) * 30,
            baseY,
            thickness,
            primaryColor: COLOR_PALETTE_PRIMARY[index % COLOR_PALETTE_PRIMARY.length],
            secondaryColor: COLOR_PALETTE_SECONDARY[index % COLOR_PALETTE_SECONDARY.length],
            phaseShift: (index * Math.PI) / ribbonCount,
            speedFactor: index % 2 === 0 ? 1 : -1, // Menyilang arah gerakan pita (maju vs mundur)
            dashArray,
        };
    }), [ribbonCount, height]);

    // Fungsi interpolasi presisi tinggi untuk merumuskan jalur SVG Bezier Curve (d-path string)
    const generateWavePath = (ribbon: RibbonConfig): string => {
        const points: string[] = [];
        const segments = 40; // Jumlah segmen garis pembentuk kurva halus

        for (let i = 0; i <= segments; i++) {
            const xRatio = i / segments;
            const currentX = xRatio * width;

            // Rumus matematika superposisi gelombang harmonik terikat loopAngle (SEAMLESS VALIDATED)
            // Kita mencampur sin dan cos dengan fase tergeser agar gerakan meliuk nampak sangat kaya
            const angleFrequency = xRatio * Math.PI * 2 * ribbon.waveCount;

            const motionCycle1 = Math.sin(angleFrequency + loopAngle * ribbon.speedFactor + ribbon.phaseShift);
            const motionCycle2 = Math.cos(angleFrequency * 0.5 - loopAngle * 1.5 + ribbon.phaseShift);

            // Kombinasi gelombang utama dan sekunder
            const finalWaveWaveform = (motionCycle1 + motionCycle2) / 2;

            const currentY = (ribbon.baseY * height) + (finalWaveWaveform * ribbon.amplitude);

            if (i === 0) {
                points.push(`M ${currentX} ${currentY}`);
            } else {
                points.push(`L ${currentX} ${currentY}`);
            }
        }

        return points.join(' ');
    };

    return (
        <AbsoluteFill style={{ backgroundColor: cosmicBackground, overflow: 'hidden' }}>

            {/* Lapisan Latar Belakang Efek Pendaran Ruang Kosong */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 30% 30%, #3b82f615 0%, transparent 50%), radial-gradient(circle at 80% 70%, #a855f720 0%, transparent 60%)',
                    mixBlendMode: 'plus-lighter'
                }}
            />

            {/* SVG Vector Canvas Engine */}
            <svg
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
                viewBox={`0 0 ${width} ${height}`}
            >
                <defs>
                    {/* Efek Neon Glow Intensitas Tinggi */}
                    <filter id="cosmicGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation={glowIntensity} result="blur1" />
                        <feGaussianBlur stdDeviation={glowIntensity / 2} result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur1" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Membuat gradasi linear dinamis unik untuk setiap pita indeks */}
                    {ribbons.map((ribbon, idx) => (
                        <linearGradient
                            key={`grad-${ribbon.id}`}
                            id={`gradient-${idx}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor={ribbon.primaryColor} stopOpacity={0.1} />
                            <stop offset="30%" stopColor={ribbon.primaryColor} stopOpacity={0.85} />
                            <stop offset="70%" stopColor={ribbon.secondaryColor} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={ribbon.secondaryColor} stopOpacity={0.1} />
                        </linearGradient>
                    ))}
                </defs>

                {/* Menggambar Seluruh Lapisan Pita Kosmis Sutra */}
                {ribbons.map((ribbon, idx) => {
                    const wavePathString = generateWavePath(ribbon);
                    // Opasitas bernafas dinamis mengikuti putaran waktu frame
                    const dynamicOpacity = interpolate(
                        Math.sin(loopAngle + idx * 0.5),
                        [-1, 1],
                        [0.45, 0.85]
                    );

                    return (
                        <g key={`group-${ribbon.id}`} style={{ filter: 'url(#cosmicGlow)' }}>
                            {/* Lapisan Utama Garis Pita */}
                            <path
                                d={wavePathString}
                                fill="none"
                                stroke={`url(#gradient-${idx})`}
                                strokeWidth={ribbon.thickness}
                                strokeDasharray={ribbon.dashArray}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={dynamicOpacity}
                            />

                            {/* Lapisan Bayangan Inti Cahaya Lebih Tebal di Belakang untuk Efek Kedalaman */}
                            <path
                                d={wavePathString}
                                fill="none"
                                stroke={ribbon.primaryColor}
                                strokeWidth={ribbon.thickness * 4.5} // Core glow jauh lebih tebal
                                opacity={dynamicOpacity * 0.7} // Opasitas pendaran ditingkatkan
                                style={{ mixBlendMode: 'screen' }}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Lapisan Ambient Post Processing */}
            <CosmicStarDust opacity={noiseOpacity} />
            <TechnicalOverlayHUD frame={frame} totalFrames={durationInFrames} />

            {/* Pembatas Vinyet Tepi Layar */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(3, 2, 6, 0.8) 100%)',
                    pointerEvents: 'none'
                }}
            />
        </AbsoluteFill>
    );
};