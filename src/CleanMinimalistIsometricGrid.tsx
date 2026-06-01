import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface GridPoint {
    id: string;
    row: number;
    col: number;
    isoX: number;
    isoY: number;
    baseDelay: number;
}

interface IsometricGridProps {
    gridSize?: number;       // Ukuran matriks grid (contoh: 26x26)
    spacing?: number;        // Jarak antar titik grid dalam pixel
    accentColor?: string;    // Warna utama efek pendaran/glow
    gridColor?: string;      // Warna dasar garis grid
    backgroundColor?: string;// Warna latar belakang techno-industrial
    amplitude?: number;      // Tinggi/gelombang elevasi grid
    speedMultiplier?: number;// Pengendali kecepatan putaran loop
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_GRID_SIZE = 45; // Ukuran ditingkatkan untuk menutupi layar 4K
const DEFAULT_SPACING = 85;   // Jarak diperlebar agar sebaran titik mencapai tepi
const DEFAULT_ACCENT_COLOR = '#4f46e5'; // Indigo-600 premium
const DEFAULT_SECONDARY_COLOR = '#06b6d4'; // Cyan neon
const DEFAULT_GRID_COLOR = 'rgba(99, 102, 241, 0.18)'; // Opasitas ditingkatkan dari 0.08 ke 0.18
const DEFAULT_BACKGROUND = '#0b0f19'; // Slate navy gelap (sangat dicari di Adobe Stock)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Manual color interpolation fallback untuk menangani kasus di mana interpolateColor 
 * tidak ditemukan (TypeError). Mengonversi Hex ke RGB dan menggunakan interpolate standar.
 */
const interpolateColorSafe = (val: number, inputRange: number[], outputRange: string[]) => {
    const hexToRgb = (hex: string) => {
        const h = hex.startsWith('#') ? hex.slice(1) : hex;
        const bigint = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    };

    const rgbs = outputRange.map(hexToRgb);

    // Interpolasi masing-masing channel warna secara terpisah
    const r = interpolate(val, inputRange, rgbs.map(rgb => rgb[0]));
    const g = interpolate(val, inputRange, rgbs.map(rgb => rgb[1]));
    const b = interpolate(val, inputRange, rgbs.map(rgb => rgb[2]));

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};

/**
 * Pseudo-Noise Generator matematis untuk menciptakan variasi riak gelombang 
 * yang organik tanpa ketergantungan pada library external yang berat.
 */
const pseudoNoise = (x: number, y: number): number => {
    const sx = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return sx - Math.floor(sx);
};

// ============================================================================
// SUB-COMPONENTS (Aesthetic & Depth Multipliers)
// ============================================================================

/**
 * Background Ambient Radial Gradient untuk memberi efek kedalaman visual (depth)
 */
const AmbientBackground: React.FC<{ bg: string; accent: string }> = ({ bg, accent }) => {
    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: bg,
                backgroundImage: `
					radial-gradient(circle at 50% 50%, ${accent}15 0%, transparent 60%),
					radial-gradient(circle at 20% 80%, ${DEFAULT_SECONDARY_COLOR}0a 0%, transparent 40%)
				`,
                overflow: 'hidden',
            }}
        />
    );
};

/**
 * overlay sinematik vinyet dan micro scanlines untuk mensimulasikan layar premium
 */
const CinematicOverlay: React.FC = () => {
    return (
        <AbsoluteFill
            style={{
                pointerEvents: 'none',
                background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(5, 7, 12, 0.6) 100%)',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.15) 50%)',
                    backgroundSize: '100% 4px',
                    opacity: 0.4,
                }}
            />
        </AbsoluteFill>
    );
};

/**
 * Ornamen HUD Grapik Teknis di sudut layar untuk meningkatkan nilai jual komersial asset
 */
const TechnicalHUD: React.FC<{ frame: number; totalFrames: number }> = ({ frame, totalFrames }) => {
    const progress = (frame / totalFrames).toFixed(4);
    return (
        <AbsoluteFill style={{ color: 'rgba(255, 255, 255, 0.25)', fontFamily: 'monospace', fontSize: 11, padding: 40, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 40, left: 40, letterSpacing: '2px' }}>
                <div>SYS.LOC: //REMOTION_GRID_CORE</div>
                <div style={{ opacity: 0.5, marginTop: 4 }}>STATUS: RENDERING_SEAMLESS_LOOP</div>
            </div>
            <div style={{ position: 'absolute', top: 40, right: 40, textTransform: 'uppercase', textAlign: 'right' }}>
                <div>MATRIX_SIZE: 26 X 26</div>
                <div style={{ color: DEFAULT_SECONDARY_COLOR, marginTop: 4 }}>LOOP_PHASE: {progress}</div>
            </div>
            <div style={{ position: 'absolute', bottom: 40, left: 40, display: 'flex', gap: 20 }}>
                <div>[ 4K_UHD_OUTPUT ]</div>
                <div style={{ opacity: 0.4 }}>FRAME: {frame} / {totalFrames}</div>
            </div>
            <div style={{ position: 'absolute', bottom: 40, right: 40, width: 120, height: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div
                    style={{
                        width: `${(frame / totalFrames) * 100}%`,
                        height: '100%',
                        backgroundColor: DEFAULT_ACCENT_COLOR,
                        boxShadow: `0 0 8px ${DEFAULT_ACCENT_COLOR}`
                    }}
                />
            </div>
        </AbsoluteFill>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CleanMinimalistIsometricGrid: React.FC<IsometricGridProps> = ({
    gridSize = DEFAULT_GRID_SIZE,
    spacing = DEFAULT_SPACING,
    accentColor = DEFAULT_ACCENT_COLOR,
    gridColor = DEFAULT_GRID_COLOR,
    backgroundColor = DEFAULT_BACKGROUND,
    amplitude = 65,
    speedMultiplier = 1,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames, width, height } = useVideoConfig();

    // Menghitung siklus sudut putaran matematika agar loop kembali ke titik awal (Seamless)
    const totalCycles = 1 * speedMultiplier;
    const loopAngle = (frame / durationInFrames) * Math.PI * 2 * totalCycles;

    const points: GridPoint[] = [];
    const halfGrid = (gridSize - 1) / 2;

    // Membangun Topologi Grid dengan Matrix Proyeksi Isometrik
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const posX = (c - halfGrid) * spacing;
            const posY = (r - halfGrid) * spacing;

            // Rumus Transformasi Isometrik 2.5D Matriks 
            const isoX = (posX - posY) * Math.cos(Math.PI / 6);
            const isoY = (posX + posY) * Math.sin(Math.PI / 6);

            const distanceFromCenter = Math.sqrt(posX * posX + posY * posY);

            points.push({
                id: `p_${r}_${c}`,
                row: r,
                col: c,
                isoX,
                isoY,
                baseDelay: distanceFromCenter * 0.004,
            });
        }
    }

    // Kalkulasi ketinggian elevasi dinamis bergelombang per frame
    const renderedPoints = points.map((p) => {
        const frequency1 = p.baseDelay * 3.5 - loopAngle;
        const frequency2 = (p.row + p.col) * 0.15 + loopAngle;

        const waveComponent1 = Math.sin(frequency1);
        const waveComponent2 = Math.cos(frequency2 * 0.5);
        const rawElevation = (waveComponent1 + waveComponent2) / 2;

        const noiseVal = pseudoNoise(p.row, p.col);
        const noiseElevation = Math.sin(loopAngle + noiseVal * Math.PI * 2) * 0.12;

        const finalElevation = (rawElevation + noiseElevation) * amplitude;
        const normalizedHeight = (finalElevation + amplitude) / (amplitude * 2);

        return {
            ...p,
            elevation: finalElevation,
            normalizedHeight,
        };
    });

    // Menentukan titik tengah koordinat layar (Full Layar Responsif)
    const globalOffsetX = width / 2;
    const globalOffsetY = height / 2; // Diposisikan tepat di tengah

    return (
        <AbsoluteFill style={{ backgroundColor, overflow: 'hidden' }}>
            <AmbientBackground bg={backgroundColor} accent={accentColor} />

            {/* SVG Graphics Vector Layer untuk menjaga ketajaman resolusi 4K tanpa blur */}
            <svg
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    overflow: 'visible',
                    transform: 'scale(1.1)' // Sedikit zoom-out (overscan) untuk menjamin tidak ada celah di pojok
                }}
                viewBox={`0 0 ${width} ${height}`}
            >
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={gridColor} />
                        <stop offset="50%" stopColor={accentColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={gridColor} />
                    </linearGradient>
                </defs>

                {/* DRAW GRID LINES - Row Connections */}
                {Array.from({ length: gridSize }).map((_, r) => {
                    const rowPoints = renderedPoints.filter((p) => p.row === r);
                    return (
                        <path
                            key={`row-line-${r}`}
                            d={rowPoints.map((p, idx) => {
                                const x = globalOffsetX + p.isoX;
                                const y = globalOffsetY + p.isoY - p.elevation;
                                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="url(#lineGrad)"
                            strokeWidth={2} // Tebal garis baris ditingkatkan
                            opacity={0.85}
                        />
                    );
                })}

                {/* DRAW GRID LINES - Column Connections */}
                {Array.from({ length: gridSize }).map((_, c) => {
                    const colPoints = renderedPoints.filter((p) => p.col === c);
                    return (
                        <path
                            key={`col-line-${c}`}
                            d={colPoints.map((p, idx) => {
                                const x = globalOffsetX + p.isoX;
                                const y = globalOffsetY + p.isoY - p.elevation;
                                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="url(#lineGrad)"
                            strokeWidth={2} // Tebal garis kolom ditingkatkan
                            opacity={0.85}
                        />
                    );
                })}

                {/* DRAW QUANTUM DATA PILLARS (Pilar Minimalis Interaktif) */}
                {renderedPoints.map((p) => {
                    const shouldDrawPillar = (p.row % 2 === 0 && p.col % 2 === 0);
                    if (!shouldDrawPillar) return null;

                    const startX = globalOffsetX + p.isoX;
                    const startY = globalOffsetY + p.isoY;

                    const pillarColor = interpolateColorSafe(
                        p.normalizedHeight,
                        [0, 0.5, 1],
                        [DEFAULT_SECONDARY_COLOR, accentColor, '#ec4899'],
                    );

                    // Menghilangkan entranceScale agar loop menjadi seamless tanpa lompatan animasi di awal
                    const currentEndY = startY - p.elevation;

                    return (
                        <g key={`pillar-${p.id}`} opacity={interpolate(p.normalizedHeight, [0, 0.2], [0.15, 0.7])}>
                            <line
                                x1={startX}
                                y1={startY}
                                x2={startX}
                                y2={currentEndY}
                                stroke={pillarColor}
                                strokeWidth={3} // Tebal pilar ditingkatkan
                                strokeDasharray={p.elevation < 0 ? '2,2' : undefined}
                            />
                            <circle
                                cx={startX}
                                cy={currentEndY}
                                r={interpolate(p.normalizedHeight, [0, 1], [4, 9])} // Ukuran dot pilar diperbesar
                                fill={pillarColor}
                                filter={p.normalizedHeight > 0.7 ? 'url(#glow)' : undefined}
                            />
                        </g>
                    );
                })}

                {/* DRAW TOP LEVEL INTERSECTION INTERACTIVE NODES */}
                {renderedPoints.map((p) => {
                    const cx = globalOffsetX + p.isoX;
                    const cy = globalOffsetY + p.isoY - p.elevation;

                    const isPulseNode = (p.row * 7 + p.col * 13) % 29 === 0;
                    const pulseOpacity = Math.sin(loopAngle * 2 + p.baseDelay * 10);

                    if (isPulseNode) {
                        return (
                            <g key={`pulse-${p.id}`}>
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={interpolate(pulseOpacity, [-1, 1], [4, 25])} // Efek ring diperluas
                                    fill="none"
                                    stroke={DEFAULT_SECONDARY_COLOR}
                                    strokeWidth={1.5}
                                    opacity={interpolate(pulseOpacity, [-1, 1], [0.6, 0])}
                                />
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={6} // Titik pusat pulse diperbesar
                                    fill={DEFAULT_SECONDARY_COLOR}
                                    filter="url(#glow)"
                                />
                            </g>
                        );
                    }

                    return (
                        <circle
                            key={`node-${p.id}`}
                            cx={cx}
                            cy={cy}
                            r={2.5} // Titik grid statis dipertebal
                            fill="#ffffff"
                            opacity={0.3}
                        />
                    );
                })}
            </svg>

            <TechnicalHUD frame={frame} totalFrames={durationInFrames} />
            <CinematicOverlay />
        </AbsoluteFill>
    );
};