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

interface SphereNode {
    id: string;
    u: number;           // Sudut polar 1
    v: number;           // Sudut polar 2
    baseRadius: number;  // Radius orbital node dari inti pusat
    size: number;        // Ukuran dot node
    pulseOffset: number; // Fase unik pendaran cahaya
}

interface QuantumSphereProps {
    nodeCount?: number;       // Jumlah node pembentuk struktur bola (bisa dinaikkan untuk kepadatan tinggi)
    matrixBackground?: string;// Warna latar belakang deep space premium
    accentOrange?: string;    // Warna neon oranye cyber
    accentPurple?: string;    // Warna neon ungu fuchsia
}

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const DEFAULT_BG = '#080415'; // Ungu-hitam pekat (Sangat kontras untuk video komersial)
const CYBER_ORANGE = '#ff6b00';
const HYPER_PURPLE = '#d946ef';
const MATRIX_CYAN = '#00f0ff';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const QuantumCyberSphereMatrix: React.FC<QuantumSphereProps> = ({
    nodeCount = 120,
    matrixBackground = DEFAULT_BG,
    accentOrange = CYBER_ORANGE,
    accentPurple = HYPER_PURPLE,
}) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Menghitung putaran sudut loop penuh (Seamless Loop 360 derajat)
    const loopAngle = (frame / durationInFrames) * Math.PI * 2;

    // Inisialisasi koordinat Node Bola 3D secara matematika murni (Golden Ratio Sphere Distribution)
    // Metode ini mendistribusikan titik secara merata ke seluruh permukaan bola 3D.
    const sphereNodes: SphereNode[] = Array.from({ length: nodeCount }).map((_, i) => {
        // Menggunakan rumus matematika distribusi Fibonacci Sphere
        const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

        return {
            id: `sphere_node_${i}`,
            u: phi,
            v: theta,
            baseRadius: Math.min(width, height) * 0.42, // Ukuran bola diperbesar (dari 0.28 ke 0.42)
            size: (i % 3 === 0) ? 8 : (i % 2 === 0) ? 5 : 3, // Ukuran node diperbesar signifikan
            pulseOffset: i * 0.2,
        };
    });

    // Pengaturan kecepatan putaran bola pada sumbu X dan Y secara simultan
    const rotationY = loopAngle;          // Berputar penuh horizontal
    const rotationX = Math.sin(loopAngle); // Berayun halus vertikal

    // Proyeksi Matematika 3D ke Layar 2D (Orthographic & Perspective Simulation)
    const projectedPoints = sphereNodes.map((node) => {
        // Koordinat 3D Asli pada Bola
        let x3d = node.baseRadius * Math.sin(node.u) * Math.cos(node.v);
        let y3d = node.baseRadius * Math.sin(node.u) * Math.sin(node.v);
        let z3d = node.baseRadius * Math.cos(node.u);

        // Menambahkan efek riak denyut (pulsing deform) terikat loop agar bola nampak bernyawa
        const ripple = Math.sin(node.u * 4 + node.v * 2 + loopAngle * 2) * 15;
        x3d += (ripple * Math.sin(node.u) * Math.cos(node.v));
        y3d += (ripple * Math.sin(node.u) * Math.sin(node.v));
        z3d += (ripple * Math.cos(node.u));

        // 1. Rotasi Sumbu X
        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const yRotX = y3d * cosX - z3d * sinX;
        const zRotX = y3d * sinX + z3d * cosX;

        // 2. Rotasi Sumbu Y
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const xRotY = x3d * cosY + zRotX * sinY;
        const zRotY = -x3d * sinY + zRotX * cosY;

        // Rasio kedalaman z-index untuk membedakan node depan (terang/besar) vs belakang (gelap/kecil)
        const depthRatio = (zRotY + node.baseRadius) / (node.baseRadius * 2); // Rentang 0 s/d 1

        return {
            ...node,
            projX: xRotY,
            projY: yRotX,
            depth: depthRatio,
        };
    });

    // Koordinat titik tengah layar (Full Layar Responsif)
    const centerX = width / 2;
    const centerY = height / 2;

    return (
        <AbsoluteFill style={{ backgroundColor: matrixBackground, overflow: 'hidden' }}>

            {/* Lapisan 1: Ambient Glow Inti di Tengah Layar */}
            <div
                style={{
                    position: 'absolute',
                    left: centerX - 600,
                    top: centerY - 600,
                    width: 1200, // Glow diperbesar
                    height: 1200,
                    background: `radial-gradient(circle, ${accentPurple}12 0%, ${accentOrange}08 50%, transparent 70%)`,
                    mixBlendMode: 'screen',
                    pointerEvents: 'none'
                }}
            />

            {/* SVG Vector Graphic Canvas */}
            <svg
                width={width}
                height={height}
                style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}
                viewBox={`0 0 ${width} ${height}`}
            >
                <defs>
                    {/* Filter Neon Glow Premium */}
                    <filter id="matrixNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="blur1" />
                        <feGaussianBlur stdDeviation="3" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur1" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* ORBITAL RING 1: Cincin Orbit Pelindung Horizontal (Cyber Ring) */}
                <ellipse
                    cx={centerX}
                    cy={centerY}
                    rx={Math.min(width, height) * 0.55} // Cincin diperlebar
                    ry={Math.min(width, height) * 0.18}
                    fill="none"
                    stroke={accentOrange}
                    strokeWidth={8} // Ditebalkan lagi menjadi 8 agar sangat jelas
                    strokeDasharray="40, 25, 10, 25"
                    opacity={0.6} // Opasitas dinaikkan agar tidak terlalu transparan
                    style={{
                        transform: `rotate(${(loopAngle * 180) / Math.PI}deg)`, // Gunakan loopAngle agar seamless
                        transformOrigin: `${centerX}px ${centerY}px`,
                        filter: 'url(#matrixNeonGlow)'
                    }}
                />

                {/* ORBITAL RING 2: Cincin Orbit Sudut Menyilang (Tech Ring) */}
                <ellipse
                    cx={centerX}
                    cy={centerY}
                    rx={Math.min(width, height) * 0.52} // Cincin diperlebar
                    ry={Math.min(width, height) * 0.14}
                    fill="none"
                    stroke={MATRIX_CYAN}
                    strokeWidth={6} // Ditebalkan lagi menjadi 6
                    strokeDasharray="15, 15"
                    opacity={0.5} // Opasitas dinaikkan
                    style={{
                        transform: `rotate(${-(loopAngle * 180) / Math.PI - 45}deg)`, // Gunakan loopAngle agar seamless
                        transformOrigin: `${centerX}px ${centerY}px`,
                    }}
                />

                {/* ELEMEN UTAMA: Gambar Seluruh Node Bola 3D */}
                {projectedPoints
                    // Mengurutkan node berdasarkan kedalaman agar node belakang tertimpa node depan (True 3D Sorting Depth)
                    .sort((a, b) => a.depth - b.depth)
                    .map((pt) => {
                        const screenX = centerX + pt.projX;
                        const screenY = centerY + pt.projY;

                        // Logika penentuan warna dinamis berdasarkan posisi baris node
                        const isOrangeNode = pt.u > Math.PI / 2;
                        const baseColor = isOrangeNode ? accentOrange : accentPurple;

                        // Opasitas bernafas terikat kedalaman (Depan terang, Belakang redup)
                        const opacity = interpolate(pt.depth, [0, 1], [0.12, 0.95]);

                        // Skala ukuran node berdasarkan kedalaman ruang 3D
                        const currentRadius = pt.size * interpolate(pt.depth, [0, 1], [0.6, 1.4]);

                        // Efek Denyut Kilau Node Tertentu
                        const sparkle = Math.sin(loopAngle * 3 + pt.pulseOffset);
                        const finalOpacity = pt.size > 3 ? interpolate(sparkle, [-1, 1], [opacity * 0.4, 1]) : opacity;

                        return (
                            <g key={pt.id}>
                                {/* Garis Jaringan Saraf (Neural Network Lines) untuk Node Berdekatan */}
                                {pt.size > 3 && (
                                    <line
                                        x1={centerX}
                                        y1={centerY}
                                        x2={screenX}
                                        y2={screenY}
                                        stroke={baseColor}
                                        strokeWidth={3} // Garis penghubung ditebalkan menjadi 3
                                        opacity={opacity * 0.3} // Kontras garis dinaikkan
                                    />
                                )}

                                {/* Inti Bulat Node */}
                                <circle
                                    cx={screenX}
                                    cy={screenY}
                                    r={currentRadius}
                                    fill={baseColor}
                                    opacity={finalOpacity}
                                    filter={pt.depth > 0.7 && pt.size > 2 ? 'url(#matrixNeonGlow)' : undefined}
                                />
                            </g>
                        );
                    })}
            </svg>

        </AbsoluteFill>
    );
};