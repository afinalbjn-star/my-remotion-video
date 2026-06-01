import React, { useMemo } from 'react';
import {
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    Loop,
} from 'remotion';

// ==========================================
// CONFIGURATION & TYPES
// ==========================================

export interface NeonStyleConfig {
    backgroundColor: string;
    gridColor: string;
    neonColorPrimary: string;
    neonColorSecondary: string;
    gridLineWidth: number;
    neonLineWidth: number;
}

interface HexCoordinates {
    cx: number;
    cy: number;
    pointsStr: string;
    pathStr: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Menghitung koordinat sudut heksagonal flat-topped
 * dan mengembalikannya dalam bentuk string koordinat SVG & Path
 */
const calculateHexGeometry = (cx: number, cy: number, size: number): { points: string; path: string } => {
    const points: string[] = [];
    let pathStr = '';

    for (let i = 0; i < 6; i++) {
        const angleRad = (Math.PI / 180) * (60 * i);
        const x = cx + size * Math.cos(angleRad);
        const y = cy + size * Math.sin(angleRad);

        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        if (i === 0) {
            pathStr += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        } else {
            pathStr += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
        }
    }
    pathStr += ' Z'; // Menutup path kembali ke titik awal
    return { points: points.join(' '), path: pathStr };
};

// ==========================================
// MAIN NEON GRID COMPONENT
// ==========================================

export const NeonGridChase: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // 1. Setup Parameter Desain & Estetika (Minimalist Techno-Industrial)
    const hexSize = 60;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;

    const style: NeonStyleConfig = {
        backgroundColor: '#0a0f1d',      // Gelap cyber/techno
        gridColor: '#1e293b',            // Struktur sirkuit sela-sela yang redup
        neonColorPrimary: '#00f2fe',     // Neon Cyan elektrik terang
        neonColorSecondary: '#4facfe',   // Neon Blue transisi
        gridLineWidth: 2,
        neonLineWidth: 4,
    };

    // 2. Kalkulasi Grid Matematika (Staggered Honeycomb Layout)
    // Menggunakan useMemo agar kalkulasi geometri koordinat statis tidak di-render ulang setiap frame
    const gridData = useMemo(() => {
        const colsCount = Math.ceil(width / hexWidth) + 2;
        const rowsCount = Math.ceil(height / (hexHeight * 0.75)) + 2;
        const items: HexCoordinates[] = [];

        for (let row = -1; row < rowsCount; row++) {
            for (let col = -1; col < colsCount; col++) {
                const isOddRow = row % 2 !== 0;
                const xOffset = isOddRow ? hexWidth / 2 : 0;

                const cx = col * hexWidth + xOffset;
                const cy = row * hexHeight * 0.75;
                const geom = calculateHexGeometry(cx, cy, hexSize);

                items.push({
                    cx,
                    cy,
                    pointsStr: geom.points,
                    pathStr: geom.path,
                });
            }
        }
        return items;
    }, [width, height, hexWidth, hexHeight, hexSize]);

    // 3. Formula Utama Seamless Loop Animasi Neon
    // Panjang total keliling satu heksagonal (6 sisi * ukuran)
    const hexPerimeter = hexSize * 6;

    // Kita buat panjang sirkuit neon aktif adalah 1/3 dari keliling, sisanya kosong (dash)
    const dashLength = hexPerimeter * 0.35;
    const gapLength = hexPerimeter * 0.65;

    // Pergeseran offset stroke dari 0 hingga keliling penuh agar kembali ke titik awal (Seamless)
    // Menggunakan interpolasi linier murni berdasarkan frame saat ini terhadap durasi total
    const strokeOffset = interpolate(
        frame,
        [0, durationInFrames],
        [hexPerimeter, 0], // Berjalan maju menyusuri sela sirkuit
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    return (
        <AbsoluteFill style={{ backgroundColor: style.backgroundColor, overflow: 'hidden' }}>

            {/* Efek Ambience Glow Latar Belakang (Meningkatkan getaran kontras teknologi) */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(10, 15, 29, 0.8) 100%), 
					             radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.05) 0%, transparent 70%)`,
                    zIndex: 3,
                    pointerEvents: 'none',
                }}
            />

            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ width: '100%', height: '100%', zIndex: 1 }}
            >
                {/* DEFINISI EFFECT FILTER GLOW (Neon Glow Core) */}
                <defs>
                    {/* Gradien Warna Jalur Neon */}
                    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={style.neonColorPrimary} />
                        <stop offset="100%" stopColor={style.neonColorSecondary} />
                    </linearGradient>

                    {/* Filter Blur Intensitas Tinggi untuk Efek Pendaran Cahaya Neon */}
                    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="coloredBlur" /> {/* Ditumpuk dua kali agar glow lebih tebal */}
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* LAYER 1: Background Grid Sirkuit Statis (Sela Mati) */}
                <g fill="none" stroke={style.gridColor} strokeWidth={style.gridLineWidth}>
                    {gridData.map((hex, index) => (
                        <polygon key={`base-${index}`} points={hex.pointsStr} />
                    ))}
                </g>

                {/* LAYER 2: Efek Cahaya Neon Berjalan (Neon Light Chase) */}
                {/* Setiap baris/kolom diberi variasi arah atau offset acak teratur agar aliran cahaya terlihat dinamis */}
                <g
                    fill="none"
                    stroke="url(#neonGradient)"
                    strokeWidth={style.neonLineWidth}
                    strokeLinecap="round"
                    filter="url(#neonGlow)"
                >
                    {gridData.map((hex, index) => {
                        // Membuat variasi offset antar heksagonal berdasarkan koordinatnya 
                        // agar tidak semua neon menyala di posisi sela yang sama secara serentak
                        const localOffset = (index % 3) * (hexPerimeter / 3);
                        const finalOffset = strokeOffset + localOffset;

                        return (
                            <path
                                key={`neon-${index}`}
                                d={hex.pathStr}
                                strokeDasharray={`${dashLength} ${gapLength}`}
                                strokeDashoffset={finalOffset}
                                opacity={index % 2 === 0 ? 0.9 : 0.6} // Variasi intensitas kecerahan kabel neon
                            />
                        );
                    })}
                </g>
            </svg>
        </AbsoluteFill>
    );
};

// ==========================================
// ROOT REMOTION COMPOSITION EXPORT
// ==========================================

export const RemotionVideo: React.FC = () => {
    // Durasi 120 frame pada 30fps (4 detik) atau 240 frame untuk pergerakan sirkuit yang lebih lambat dan elegan
    const loopDuration = 150;

    return (
        <Loop durationInFrames={loopDuration}>
            <NeonGridChase />
        </Loop>
    );
};

export default RemotionVideo;