import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';

const NUM_RINGS = 100; // Menambah ring agar kelokan terowongan lebih halus dan padat
const POINTS_PER_RING = 14;
const TUNNEL_LENGTH = 10000; // Terowongan lebih panjang untuk kedalaman visual maksimal
const FOCAL_LENGTH = 350; // FOV ultra-wide agar kamera benar-benar terasa berada di dalam tabung
const CONNECTION_DISTANCE = 2200; // Jarak koneksi plexus ditingkatkan seiring dengan radius

export const PlexusTunnel: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Membuat data titik statis berdasarkan seed
    const points = useMemo(() => {
        const tempPoints = [];
        for (let r = 0; r < NUM_RINGS; r++) {
            for (let p = 0; p < POINTS_PER_RING; p++) {
                const seed = r * POINTS_PER_RING + p;
                tempPoints.push({
                    ringIndex: r,
                    angle: (p / POINTS_PER_RING) * Math.PI * 2 + (random(seed) * 0.5),
                    radius: 2500 + random(seed + 0.1) * 1200, // Radius jauh lebih besar agar dinding tabung memenuhi layar 4K
                    zOffset: (r / NUM_RINGS) * TUNNEL_LENGTH,
                    seed,
                    pIndex: p,
                });
            }
        }
        return tempPoints;
    }, []);

    // Fungsi jalur terowongan (Path) untuk simulasi belokan
    // Harus menggunakan nilai yang kembali ke asal pada TUNNEL_LENGTH agar seamless
    const getPath = useMemo(() => (zWorld: number) => {
        const x = Math.sin((zWorld / TUNNEL_LENGTH) * Math.PI * 2) * 1600; // Belokan horizontal lebih dramatis
        const y = Math.cos((zWorld / TUNNEL_LENGTH) * Math.PI * 4) * 800; // Belokan vertikal
        return { x, y };
    }, []);

    // Animasi pergerakan Z untuk seamless looping
    const speed = TUNNEL_LENGTH / durationInFrames;
    const currentZOffset = frame * speed;

    // Proyeksi 3D ke 2D
    const projectedPoints = points.map((p) => {
        // Menghitung posisi Z relatif terhadap kamera (maju terus menerus)
        const worldZ = p.zOffset;
        let relativeZ = (worldZ - currentZOffset) % TUNNEL_LENGTH;
        if (relativeZ < 0) relativeZ += TUNNEL_LENGTH;

        // Menghitung offset jalur: posisi ring dikurangi posisi kamera
        const camPath = getPath(currentZOffset);
        const pointPath = getPath(worldZ);
        const relPathX = pointPath.x - camPath.x;
        const relPathY = pointPath.y - camPath.y;

        // Rotasi terowongan sistematis (seamless)
        const globalRotation = (frame / durationInFrames) * Math.PI * 2 * 0.15;

        // Posisi 3D
        const angle = p.angle + globalRotation;
        const x3d = Math.cos(angle) * p.radius + relPathX;
        const y3d = Math.sin(angle) * p.radius + relPathY;

        // Rumus proyeksi perspektif
        const scale = FOCAL_LENGTH / (FOCAL_LENGTH + relativeZ + 1);
        const x2d = width / 2 + x3d * scale;
        const y2d = height / 2 + y3d * scale;

        // Hitung opasitas berdasarkan jarak (Z)
        // Fading halus di kejauhan dan saat mendekati kamera untuk transisi mulus
        const fadeDistance = 1500;
        const opacity = relativeZ > TUNNEL_LENGTH - fadeDistance
            ? (TUNNEL_LENGTH - relativeZ) / fadeDistance
            : relativeZ < 300 ? relativeZ / 300 : 1;

        return {
            x: x2d,
            y: y2d,
            z: relativeZ,
            opacity,
            id: p.seed,
            ringIndex: p.ringIndex,
            pIndex: p.pIndex
        };
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#00050a' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Menggambar Garis Plexus */}
                {projectedPoints.map((p1, i) => (
                    projectedPoints.slice(i + 1, i + 60).map((p2) => {
                        // Optimasi: Hanya hubungkan jika berada di ring yang berdekatan
                        const ringDiff = Math.abs(p1.ringIndex - p2.ringIndex);
                        if (ringDiff > 2) return null;

                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const distSq = dx * dx + dy * dy;

                        const screenDistLimit = CONNECTION_DISTANCE * (FOCAL_LENGTH / (FOCAL_LENGTH + p1.z + 1));

                        // Batas jarak Z antar simpul untuk ditarik garis
                        if (distSq < screenDistLimit * screenDistLimit && Math.abs(p1.z - p2.z) < 600) {
                            const dist = Math.sqrt(distSq);
                            const lineOpacity = Math.min(p1.opacity, p2.opacity) * (1 - (dist / screenDistLimit) * 0.8);

                            return (
                                <line
                                    key={`${p1.id}-${p2.id}`}
                                    x1={p1.x}
                                    y1={p1.y}
                                    x2={p2.x}
                                    y2={p2.y}
                                    stroke="#7dd3fc"
                                    strokeWidth={2 * p1.opacity}
                                    strokeOpacity={lineOpacity * 0.5}
                                />
                            );
                        }
                        return null;
                    })
                ))}

                {/* Menggambar Simpul (Nodes) */}
                {projectedPoints.map((p) => (
                    <circle
                        key={p.id}
                        cx={p.x}
                        cy={p.y}
                        r={9 * p.opacity} // Memperbesar simpul agar lebih dominan di layar
                        fill="#f0f9ff"
                        fillOpacity={p.opacity}
                        filter="url(#glow)"
                    />
                ))}
            </svg>
        </AbsoluteFill>
    );
};