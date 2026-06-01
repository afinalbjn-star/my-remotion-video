import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
    Loop,
} from 'remotion';

// ==========================================
// CONFIGURATION & TYPES
// ==========================================

export interface HexStyleConfig {
    baseColor: string;
    shadowColor: string;
    highlightColor: string;
    strokeColor: string;
    strokeWidth: number;
}

export interface WaveConfig {
    frequency: number; // Kerapatan gelombang
    speed: number;     // Kecepatan aliran gelombang
    amplitude: number; // Tinggi maksimum pergeseran/efek 3D
}

interface HexagonProps {
    cx: number;
    cy: number;
    size: number;
    row: number;
    col: number;
    maxRows: number;
    maxCols: number;
    styleConfig: HexStyleConfig;
    waveConfig: WaveConfig;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Menghasilkan koordinat string untuk elemen <polygon> SVG berbentuk heksagonal sempurna
 * dengan rotasi flat-topped (sisi datar di atas).
 */
const getHexPoints = (cx: number, cy: number, size: number): string => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
        const angleDeg = 60 * i;
        const angleRad = (Math.PI / 180) * angleDeg;
        const x = cx + size * Math.cos(angleRad);
        const y = cy + size * Math.sin(angleRad);
        points.push(`${x},${y}`);
    }
    return points.join(' ');
};

/**
 * Menghitung jarak Euclidean dari pusat grid untuk membuat efek gelombang radial
 */
const getDistanceFromCenter = (
    row: number,
    col: number,
    maxRows: number,
    maxCols: number
): number => {
    const centerRow = maxRows / 2;
    const centerCol = maxCols / 2;
    return Math.sqrt(
        Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
    );
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const HexagonCell: React.FC<HexagonProps> = ({
    cx,
    cy,
    size,
    row,
    col,
    maxRows,
    maxCols,
    styleConfig,
    waveConfig,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Menghitung jarak dari pusat untuk animasi radial
    const distance = getDistanceFromCenter(row, col, maxRows, maxCols);

    // Formula utama untuk Seamless Loop: 
    // Menggunakan (frame / durationInFrames) * Math.PI * 2 dengan speed bilangan bulat memastikan fase awal & akhir identik.
    const totalCycles = waveConfig.speed;
    const timeArgument = (frame / durationInFrames) * Math.PI * 2 * totalCycles;
    const spaceArgument = distance * waveConfig.frequency;

    // Nilai wave berosilasi secara matematis antara -1 dan 1
    const waveValue = Math.cos(timeArgument - spaceArgument);

    // Implementasi Efek 3D Pseudo menggunakan translasi posisi dan manipulasi skala
    const scale = interpolate(waveValue, [-1, 1], [0.85, 1.15]);
    const translateY = interpolate(waveValue, [-1, 1], [waveConfig.amplitude, -waveConfig.amplitude]);

    // Dinamika kedalaman bayangan samping berdasarkan posisi gelombang
    const shadowDepth = interpolate(waveValue, [-1, 1], [4, 24]);

    // Dinamika pencahayaan artifisial (mengubah opasitas warna dasar untuk efek bayangan/cahaya)
    const colorIntensity = interpolate(waveValue, [-1, 1], [0.7, 1.3]);

    // ID unik untuk efek filter per-heksagonal jika diperlukan di masa depan
    const filterId = `drop-shadow-${row}-${col}`;

    // Transformasi CSS inline untuk performa rendering tinggi
    const transformStyle = {
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: `${cx}px ${cy}px`,
    };

    return (
        <g style={transformStyle}>
            {/* Defs lokal untuk gradien shadow interaktif halus */}
            <defs>
                <radialGradient id={`grad-${row}-${col}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={styleConfig.highlightColor} stopOpacity={interpolate(waveValue, [-1, 1], [0.1, 0.4])} />
                    <stop offset="100%" stopColor={styleConfig.shadowColor} stopOpacity={0.6} />
                </radialGradient>
            </defs>

            {/* Pseudo 3D Shadow (Sisi bawah heksagonal) */}
            <polygon
                points={getHexPoints(cx, cy + shadowDepth, size)}
                fill={styleConfig.shadowColor}
                opacity={interpolate(waveValue, [-1, 1], [0.9, 0.2])}
            />

            {/* Elemen Utama Heksagonal */}
            <polygon
                points={getHexPoints(cx, cy, size)}
                fill={styleConfig.baseColor}
                stroke={styleConfig.strokeColor}
                strokeWidth={styleConfig.strokeWidth}
                filter={waveValue > 0 ? `drop-shadow(0px ${shadowDepth / 2}px 8px rgba(0,0,0,0.25))` : undefined}
            />

            {/* Overlay Pencahayaan (Lighting Overlay) untuk kedalaman estetika pastel */}
            <polygon
                points={getHexPoints(cx, cy, size)}
                fill={`url(#grad-${row}-${col})`}
                style={{ mixBlendMode: 'overlay' }}
            />
        </g>
    );
};

// ==========================================
// MAIN GRID COMPONENT
// ==========================================

export const HexagonalGrid: React.FC = () => {
    const { width, height } = useVideoConfig();

    // Pengaturan ukuran heksagonal agar pas dengan resolusi layar bawaan (misal 1920x1080)
    const hexSize = 52;
    const hexWidth = hexSize * Math.sqrt(3);
    const hexHeight = hexSize * 2;

    // Menghitung jumlah baris dan kolom yang dibutuhkan untuk memenuhi layar penuh + padding ekstra di tepi
    const colsCount = Math.ceil(width / hexWidth) + 2;
    const rowsCount = Math.ceil(height / (hexHeight * 0.75)) + 2;

    // Konfigurasi Preset Estetika (Sesuai dengan gambar referensi biru muda pastel)
    const currentStyle: HexStyleConfig = {
        baseColor: '#e3f2fd',      // Biru muda pastel cerah
        shadowColor: '#90caf9',    // Biru medium untuk kedalaman bayangan
        highlightColor: '#ffffff', // Putih bersih untuk kilauan atas
        strokeColor: '#bbdefb',    // Garis tepi halus pelengkap struktur grid
        strokeWidth: 1.5,
    };

    const currentWave: WaveConfig = {
        frequency: 0.5,  // Ditingkatkan agar gelombang lebih rapat dan terstruktur
        speed: 2,        // 2 siklus penuh dalam 10 detik agar tetap dinamis
        amplitude: 45,   // Menambah jarak vertikal secara signifikan untuk efek kedalaman
    };

    const gridCells: React.ReactNode[] = [];

    // Loop bersarang untuk membangun koordinat staggered (pola sarang lebah)
    for (let row = -1; row < rowsCount; row++) {
        for (let col = -1; col < colsCount; col++) {
            // Pola staggered: menggeser setiap baris ganjil secara horizontal sebesar setengah lebar heksagonal
            const isOddRow = row % 2 !== 0;
            const xOffset = isOddRow ? hexWidth / 2 : 0;

            // Rumus matematika penempatan posisi pusat XYZ komponen flat-topped heksagonal
            const cx = col * hexWidth + xOffset;
            const cy = row * hexHeight * 0.75;

            gridCells.push(
                <HexagonCell
                    key={`hex-${row}-${col}`}
                    cx={cx}
                    cy={cy}
                    size={hexSize}
                    row={row}
                    col={col}
                    maxRows={rowsCount}
                    maxCols={colsCount}
                    styleConfig={currentStyle}
                    waveConfig={currentWave}
                />
            );
        }
    }

    return (
        <AbsoluteFill style={{ backgroundColor: '#d0e1f9', overflow: 'hidden' }}>
            {/* Vinyet Latar Belakang untuk meningkatkan kontras visual di area sudut layar */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, transparent 40%, rgba(144, 202, 249, 0.25) 100%)',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            />

            {/* Kanvas Utama SVG */}
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ width: '100%', height: '100%', zIndex: 1 }}
            >
                <g>{gridCells}</g>
            </svg>
        </AbsoluteFill>
    );
};

// ==========================================
// ROOT REMOTION COMPOSITION EXPORT
// ==========================================

/**
 * Komponen utama yang didaftarkan ke dalam indeks Remotion Anda.
 * Menggunakan komponen <Loop> bawaan untuk memastikan loop berjalan tanpa patah di player.
 */
export const RemotionVideo: React.FC = () => {
    // Direkomendasikan durasi 150 atau 300 frame (pada 30 FPS atau 60 FPS) untuk kehalusan maksimal
    const loopDuration = 600;

    return (
        <Loop durationInFrames={loopDuration}>
            <HexagonalGrid />
        </Loop>
    );
};

export default RemotionVideo;