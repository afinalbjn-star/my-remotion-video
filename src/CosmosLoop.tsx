import { useCurrentFrame, useVideoConfig, random } from "remotion";
import React, { useEffect, useRef, useMemo } from "react";

// Konfigurasi warna sesuai gambar (Biru tua, Neon Cyan, Ungu, dan Putih Terang di pusat)
const COLORS = [
    "#0a1128", // Deep blue
    "#1e3f8a", // Royal blue
    "#00f5d4", // Neon Cyan / Turquoise
    "#7b2cbf", // Purple
    "#ffffff", // Core white
    "#ff0054", // Vivid Pink
    "#fee440", // Bright Yellow
    "#9b5de5", // Medium Purple
];

interface Particle {
    x: number;
    y: number;
    angle: number;
    distance: number;
    baseSize: number; // Ukuran dasar partikel
    color: string;
    speedFactor: number;
    twinklePhase: number; // Fase untuk efek kelap-kelip
}

export const CosmosLoop: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, fps, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const numParticles = 20000; // Meningkatkan jumlah partikel secara drastis untuk menutupi layar
    const centerX = width / 2;
    const centerY = height / 2;

    // Inisialisasi partikel secara deterministik (Seamless & Stable)
    const particles = useMemo(() => {
        const pts: Particle[] = [];
        for (let i = 0; i < numParticles; i++) {
            const seed = `particle-${i}`;
            const armAngle = (i % 3) * ((2 * Math.PI) / 3);
            const distFactor = random(`${seed}-dist`);

            // Distribusi lebih menyebar ke seluruh layar (Power factor lebih rendah agar tidak terlalu menumpuk di tengah)
            const maxDist = Math.sqrt(width * width + height * height) * 0.6;
            const distance = Math.pow(distFactor, 0.8) * maxDist;

            const angle = armAngle + distance * 0.005 + (random(`${seed}-angle`) - 0.5) * 0.3;

            let color = COLORS[Math.floor(random(`${seed}-col`) * (COLORS.length - 1)) + 1];
            if (distance < width * 0.08) color = COLORS[4];
            else if (distance < width * 0.25) color = COLORS[2];
            else if (random(`${seed}-purple`) > 0.7) color = COLORS[3];

            pts.push({
                x: 0, y: 0,
                angle,
                distance,
                baseSize: random(`${seed}-size`) * 3 + 0.5, // Ukuran dasar partikel
                color,
                // Menggunakan variasi kecepatan bulat (1x atau 2x lipat) agar tetap seamless
                speedFactor: random(`${seed}-speed`) > 0.8 ? 2 : 1,
                twinklePhase: random(`${seed}-twinkle`) * Math.PI * 2, // Fase unik untuk kelap-kelip
            });
        }
        return pts;
    }, [width]);

    // Mengelompokkan partikel berdasarkan warna untuk optimasi performa Canvas
    const particlesByColor = useMemo(() => {
        const groups: Record<string, Particle[]> = {};
        COLORS.forEach(c => { groups[c] = []; });
        particles.forEach(p => {
            groups[p.color].push(p);
        });
        return groups;
    }, [particles]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Bersihkan canvas dengan background hitam pekat khas luar angkasa
        ctx.fillStyle = "#020208";
        ctx.fillRect(0, 0, width, height);

        // Hitung progress animasi untuk Seamless Loop (0 hingga 2*PI)
        const loopProgress = (frame / durationInFrames) * Math.PI * 2;

        // OPTIMASI: Matikan shadowBlur global untuk ribuan partikel agar tidak lag/patah
        // Kita akan memberikan efek cahaya menggunakan gradasi pada core saja.
        ctx.shadowBlur = 0;

        // Render partikel secara berkelompok (Batching)
        Object.entries(particlesByColor).forEach(([color, group]) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            group.forEach((p) => {
                const currentAngle = p.angle + loopProgress * p.speedFactor;
                const x = centerX + Math.cos(currentAngle) * p.distance;
                const y = centerY + Math.sin(currentAngle) * p.distance;

                // Hitung skala kelap-kelip (twinkle) yang seamless
                const twinkleScale = 0.7 + 0.3 * Math.sin(loopProgress * 8 + p.twinklePhase); // Berdenyut antara 0.7x dan 1.0x
                const currentSize = p.baseSize * twinkleScale;

                // Gunakan moveTo untuk menghindari garis penghubung antar arc dalam satu path
                ctx.moveTo(x + currentSize, y);
                ctx.arc(x, y, currentSize, 0, Math.PI * 2);
            });
            ctx.fill();
        });

        // Render Bright Core dengan Multi-layer Gradient (Tanpa ShadowBlur untuk performa)
        const coreRadius = width * 0.06;

        // Layer 1: Outer soft glow
        const outerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 2.5);
        outerGlow.addColorStop(0, "rgba(0, 245, 212, 0.3)");
        outerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerGlow;
        ctx.fillRect(centerX - coreRadius * 2.5, centerY - coreRadius * 2.5, coreRadius * 5, coreRadius * 5);

        // Layer 2: Inner bright core
        const innerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
        innerGlow.addColorStop(0, "white");
        innerGlow.addColorStop(0.4, "rgba(255, 255, 255, 0.8)");
        innerGlow.addColorStop(1, "rgba(0, 245, 212, 0)");
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();

    }, [frame, width, height, durationInFrames, centerX, centerY, particlesByColor]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};