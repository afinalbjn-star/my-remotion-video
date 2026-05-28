import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random } from 'remotion';

const GRID_SIZE_X = 60; // Densitas ditingkatkan untuk detail 4K yang sangat rumit
const GRID_SIZE_Y = 60;
const SPACING = 125; // Jarak dipersempit agar jalinan lebih rapat

export const IsometricNetwork: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Progress loop 0 ke 1 (0 sampai 2*PI untuk fungsi sinus)
    const time = (frame / durationInFrames) * Math.PI * 2;

    // Fungsi Proyeksi Isometrik
    const project = (x: number, y: number, z: number) => {
        const angle = Math.PI / 6;
        const isoX = (x - y) * Math.cos(angle);
        const isoY = (x + y) * Math.sin(angle) - (z * 0.8); // Skala Z sedikit dikurangi untuk stabilitas visual
        return {
            x: width / 2 + isoX,
            y: height / 2 + isoY,
        };
    };

    const nodes = useMemo(() => {
        const points = [];
        for (let i = 0; i < GRID_SIZE_X; i++) {
            for (let j = 0; j < GRID_SIZE_Y; j++) {
                points.push({ i, j });
            }
        }
        return points;
    }, []);

    // Menghitung posisi semua simpul di frame saat ini
    const currentPoints = nodes.map(({ i, j }) => {
        // Normalisasi koordinat -1 ke 1 untuk kalkulasi gelombang
        const nx = (i / GRID_SIZE_X) * 2 - 1;
        const ny = (j / GRID_SIZE_Y) * 2 - 1;
        const distFromCenter = Math.sqrt(nx * nx + ny * ny);

        // 1. Gerakan Z (Ketinggian) yang Berlapis
        // Dua sumber riak yang saling mengorbit satu sama lain (Interference Pattern)
        const orbitX = Math.cos(time) * 0.5;
        const orbitY = Math.sin(time) * 0.5;

        const ripple1 = Math.sin(time * 2 - Math.sqrt(Math.pow(nx - orbitX, 2) + Math.pow(ny - orbitY, 2)) * 8) * 90;
        const ripple2 = Math.sin(time * 2 - Math.sqrt(Math.pow(nx + orbitX, 2) + Math.pow(ny + orbitY, 2)) * 8) * 90;

        // Gelombang sapuan horizontal & vertikal (Swell)
        const swell = Math.sin(time + nx * 3) * Math.cos(time + ny * 3) * 100;

        const z = ripple1 + ripple2 + swell;

        // 2. Distorsi Bidang XY (Liquid Warp)
        // Membuat jaring terlihat lentur seperti kain/cairan
        const warpX = Math.sin(time + ny * 2.5) * 60;
        const warpY = Math.cos(time + nx * 2.5) * 60;

        // Efek puntiran (Twist) yang berdenyut
        const twistStrength = Math.sin(time) * 0.25;
        const twist = distFromCenter * twistStrength;

        const xRaw = (i - GRID_SIZE_X / 2) * SPACING + warpX;
        const yRaw = (j - GRID_SIZE_Y / 2) * SPACING + warpY;

        // Rotasi posisi dasar berdasarkan Twist
        const xBase = xRaw * Math.cos(twist) - yRaw * Math.sin(twist);
        const yBase = xRaw * Math.sin(twist) + yRaw * Math.cos(twist);

        const pos = project(xBase, yBase, z);

        return { ...pos, i, j, z };
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#030712' }}>
            {/* Background Gradient */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)',
                    opacity: 0.6,
                }}
            />

            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                    </linearGradient>

                    {/* Masking untuk fade out di pinggiran layar */}
                    <radialGradient id="edgeFade" cx="50%" cy="50%" r="50%">
                        <stop offset="60%" stopColor="white" stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </radialGradient>
                    <mask id="networkMask">
                        <rect width={width} height={height} fill="url(#edgeFade)" />
                    </mask>
                </defs>

                <g filter="url(#neonGlow)" mask="url(#networkMask)">
                    {/* Menggambar Koneksi Antar Simpul (Grid Lines) */}
                    {currentPoints.map((p1, idx) => {
                        const i = p1.i;
                        const j = p1.j;

                        // Hanya proses jika bukan di batas akhir grid untuk menghindari error index
                        if (i >= GRID_SIZE_X - 1 || j >= GRID_SIZE_Y - 1) return null;

                        // Menggunakan akses index langsung untuk performa maksimal (O(1))
                        const rightNeighbor = currentPoints[idx + 1];
                        const bottomNeighbor = currentPoints[idx + GRID_SIZE_Y];
                        const diag1Neighbor = currentPoints[idx + GRID_SIZE_Y + 1];
                        const diag2Neighbor = currentPoints[idx + GRID_SIZE_Y - 1];

                        // Kalkulasi kedalaman berdasarkan Z untuk ketebalan garis
                        const strokeDepth = interpolate(p1.z, [-400, 400], [1, 8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                        const opacityDepth = interpolate(p1.z, [-400, 400], [0.1, 0.8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

                        return (
                            <React.Fragment key={idx}>
                                {/* Garis Horizontal */}
                                {rightNeighbor && (
                                    <line
                                        x1={p1.x}
                                        y1={p1.y}
                                        x2={rightNeighbor.x}
                                        y2={rightNeighbor.y}
                                        stroke={p1.z > 50 ? "#a855f7" : "#22d3ee"}
                                        strokeWidth={strokeDepth}
                                        strokeOpacity={opacityDepth}
                                    />
                                )}
                                {/* Garis Vertikal */}
                                {bottomNeighbor && (
                                    <line
                                        x1={p1.x}
                                        y1={p1.y}
                                        x2={bottomNeighbor.x}
                                        y2={bottomNeighbor.y}
                                        stroke={p1.z > 50 ? "#a855f7" : "#22d3ee"}
                                        strokeWidth={strokeDepth}
                                        strokeOpacity={opacityDepth}
                                    />
                                )}
                                {/* Diagonal 1 (Kanan Bawah) */}
                                {diag1Neighbor && (
                                    <line
                                        x1={p1.x}
                                        y1={p1.y}
                                        x2={diag1Neighbor.x}
                                        y2={diag1Neighbor.y}
                                        stroke="#6366f1"
                                        strokeWidth={strokeDepth * 0.5}
                                        strokeOpacity={opacityDepth * 0.4}
                                    />
                                )}
                                {/* Diagonal 2 (Kiri Bawah) - Menambah Kerumitan Jaring */}
                                {diag2Neighbor && i < GRID_SIZE_X - 1 && j > 0 && (
                                    <line
                                        x1={p1.x}
                                        y1={p1.y}
                                        x2={diag2Neighbor.x}
                                        y2={diag2Neighbor.y}
                                        stroke="#4f46e5"
                                        strokeWidth={strokeDepth * 0.5}
                                        strokeOpacity={opacityDepth * 0.4}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}

                    {/* Menggambar Simpul (Nodes) - Render selektif untuk estetika */}
                    {currentPoints.map((p, idx) => {
                        // Render hanya pada grid genap untuk mengurangi noise visual di 4K
                        if (p.i % 2 !== 0 || p.j % 2 !== 0) return null;
                        const nodeSize = interpolate(p.z, [-400, 400], [5, 14], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
                        return (
                            <circle
                                key={idx}
                                cx={p.x}
                                cy={p.y}
                                r={nodeSize}
                                fill={p.z > 80 ? "#e9d5ff" : "#67e8f9"}
                                fillOpacity={interpolate(p.z, [-400, 400], [0.3, 1])}
                            />
                        );
                    })}
                </g>
            </svg>

            {/* Overlay Vignette untuk kesan modern */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle, transparent 20%, rgba(3, 7, 18, 0.8) 100%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Grain Effect Subtle */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                background: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};