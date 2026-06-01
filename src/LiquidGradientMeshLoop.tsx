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

interface FluidColorNode {
    id: string;
    baseX: number;       // Posisi normalisasi dasar X (0 s/d 1)
    baseY: number;       // Posisi normalisasi dasar Y (0 s/d 1)
    radiusX: number;     // Jangkauan radius ayunan sumbu X
    radiusY: number;     // Jangkauan radius ayunan sumbu Y
    color: string;       // Hex kode warna node
    speedX: number;      // Multiplier kecepatan sumbu X
    speedY: number;      // Multiplier kecepatan sumbu Y
    phaseOffset: number; // Geseran fase unik agar gerakan tidak sinkron/kaku
    size: number;        // Diameter lingkaran sebaran cairan
}

interface LiquidGradientMeshProps {
    colorPalette?: string[];   // Palet warna gradasi cairan mesh
    blurAmount?: number;       // Radius blur intensitas tinggi (CSS GPU)
    noiseDensity?: number;     // Opasitas tekstur grain digital anti-banding
    speedMultiplier?: number;  // Pengatur kecepatan alur sirkulasi loop
    ambientIntensity?: number; // Intensitas pancaran titik cahaya bocor (light leak)
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_PALETTE = [
    '#4f46e5', // Deep Indigo (Warna tren teknologi)
    '#ec4899', // Cyber Pink / Magenta
    '#06b6d4', // Electric Cyan
    '#8b5cf6', // Soft Cyber Violet
    '#f43f5e', // Neon Rose
    '#10b981', // Emerald Mint Accent
];

const LIGHT_LEAK_COLOR = '#ffffff';

// ============================================================================
// SUB-COMPONENTS (Lapisan Efek Sinematik Post-Processing)
// ============================================================================

/**
 * Digital Grain Overlay: Berfungsi memberikan tekstur noise mikro organik halus.
 * CRITICAL FOR ADOBE STOCK: Tekstur ini mencegah terjadinya "Color Banding Artifact"
 * (kotak-kotak gradasi patah) akibat kompresi video tinggi h.264/h.265.
 */
const DigitalGrainOverlay: React.FC<{ opacity: number }> = ({ opacity }) => {
    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <svg width="100%" height="100%" style={{ opacity }}>
                <filter id="noiseFilter">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.85"
                        numOctaves="4"
                        stitchTiles="stitch"
                    />
                    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>
        </AbsoluteFill>
    );
};

/**
 * Color Grade Vignette: Memberikan efek gelap dramatis di sudut frame luar 
 * untuk memfokuskan pandangan mata pembeli ke area tengah video (Copy Space).
 */
const ColorGradeVignette: React.FC = () => {
    return (
        <AbsoluteFill
            style={{
                pointerEvents: 'none',
                background: 'radial-gradient(circle at 50% 50%, transparent 10%, rgba(11, 9, 22, 0.45) 70%, rgba(3, 2, 8, 0.85) 100%)',
                mixBlendMode: 'multiply',
            }}
        />
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const LiquidGradientMeshLoop: React.FC<LiquidGradientMeshProps> = ({
    colorPalette = DEFAULT_PALETTE,
    blurAmount = 90,
    noiseDensity = 0.025,
    speedMultiplier = 1,
    ambientIntensity = 0.4,
}) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Perhitungan sudut sirkuler penuh (360 derajat atau 2*PI) untuk menjamin Seamless Loop
    const globalLoopAngle = (frame / durationInFrames) * Math.PI * 2 * speedMultiplier;

    // Penempatan koordinat strategis 6 Nodal Orbs untuk mengisi seluruh ruang kanvas layar 4K
    const nodes: FluidColorNode[] = [
        {
            id: 'node_center_left',
            baseX: 0.25,
            baseY: 0.4,
            radiusX: 0.18,
            radiusY: 0.15,
            color: colorPalette[0 % colorPalette.length],
            speedX: 1,
            speedY: 1,
            phaseOffset: 0,
            size: Math.min(width, height) * 0.7,
        },
        {
            id: 'node_top_right',
            baseX: 0.75,
            baseY: 0.25,
            radiusX: 0.15,
            radiusY: 0.2,
            color: colorPalette[1 % colorPalette.length],
            speedX: 1,
            speedY: 1,
            phaseOffset: Math.PI * 0.33,
            size: Math.min(width, height) * 0.75,
        },
        {
            id: 'node_bottom_center',
            baseX: 0.5,
            baseY: 0.8,
            radiusX: 0.22,
            radiusY: 0.12,
            color: colorPalette[2 % colorPalette.length],
            speedX: 1,
            speedY: 1,
            phaseOffset: Math.PI * 0.66,
            size: Math.min(width, height) * 0.85,
        },
        {
            id: 'node_top_left',
            baseX: 0.15,
            baseY: 0.15,
            radiusX: 0.12,
            radiusY: 0.18,
            color: colorPalette[3 % colorPalette.length],
            speedX: 1,
            speedY: 1,
            phaseOffset: Math.PI * 1.0,
            size: Math.min(width, height) * 0.6,
        },
        {
            id: 'node_center_right',
            baseX: 0.85,
            baseY: 0.65,
            radiusX: 0.14,
            radiusY: 0.25,
            color: colorPalette[4 % colorPalette.length],
            speedX: 1,
            speedY: 1,
            phaseOffset: Math.PI * 1.33,
            size: Math.min(width, height) * 0.8,
        },
        {
            id: 'node_deep_back',
            baseX: 0.4,
            baseY: 0.5,
            radiusX: 0.25,
            radiusY: 0.22,
            color: colorPalette[5 % colorPalette.length],
            speedX: 1,
            speedY: 1,
            phaseOffset: Math.PI * 1.66,
            size: Math.min(width, height) * 0.95,
        }
    ];

    // Hitung pergeseran posisi orbs cairan secara organik per frame
    const activeNodes = nodes.map((node) => {
        const angleX = globalLoopAngle * node.speedX + node.phaseOffset;
        const angleY = globalLoopAngle * node.speedY + node.phaseOffset * 1.5;

        const currentX = (node.baseX + Math.sin(angleX) * node.radiusX) * width;
        const currentY = (node.baseY + Math.cos(angleY) * node.radiusY) * height;

        // Ritme efek bernapas (expanding/shrinking) cairan agar visual terasa dinamis
        const sizeBreath = Math.sin(globalLoopAngle * 2 + node.phaseOffset) * 0.08;
        const currentSize = node.size * (1 + sizeBreath);

        return {
            ...node,
            x: currentX,
            y: currentY,
            size: currentSize,
        };
    });

    // Menghitung gerak pancaran cahaya putih (Ambient White Leak) di lapisan atas gradasi
    const brightLeakX = (0.5 + Math.sin(globalLoopAngle - Math.PI / 2) * 0.15) * width;
    const brightLeakY = (0.4 + Math.cos(globalLoopAngle + Math.PI / 3) * 0.12) * height;
    const brightLeakSize = Math.min(width, height) * 0.45;

    return (
        <AbsoluteFill style={{ backgroundColor: '#05030a', overflow: 'hidden' }}>

            {/* LAYER 1: PLASMA CORE (Pemanfaatan akselerasi hardware GPU CSS Filter) */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    filter: `blur(${blurAmount}px)`,
                    transform: 'scale(1.15)', // Di-scale sedikit ke luar agar pinggiran blur yang tajam tersembunyi dari layar
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                }}
            >
                {activeNodes.map((node) => (
                    <div
                        key={node.id}
                        style={{
                            position: 'absolute',
                            left: node.x - node.size / 2,
                            top: node.y - node.size / 2,
                            width: node.size,
                            height: node.size,
                            borderRadius: '50%',
                            backgroundColor: node.color,
                            mixBlendMode: 'screen',
                            opacity: 0.88,
                            willChange: 'transform, left, top',
                        }}
                    />
                ))}

                {/* Pusat pancaran cahaya putih murni untuk menambah estetika video premium */}
                <div
                    style={{
                        position: 'absolute',
                        left: brightLeakX - brightLeakSize / 2,
                        top: brightLeakY - brightLeakSize / 2,
                        width: brightLeakSize,
                        height: brightLeakSize,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${LIGHT_LEAK_COLOR}aa 0%, transparent 70%)`,
                        mixBlendMode: 'overlay',
                        opacity: ambientIntensity,
                        willChange: 'left, top',
                    }}
                />
            </div>

            {/* LAYER 2: CINEMATIC POST PROCESSING */}
            <ColorGradeVignette />
            <DigitalGrainOverlay opacity={noiseDensity} />

        </AbsoluteFill>
    );
};