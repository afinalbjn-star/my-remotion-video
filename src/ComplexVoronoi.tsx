import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

interface QuantumNode {
    id: number;
    seedX: number;
    seedY: number;
    orbitX: number;
    orbitY: number;
    freqX: number;
    freqY: number;
    phase: number;
    energyBias: number;
    baseHue: number;
}

export const ComplexVoronoi: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const totalNodes = 42; // Jumlah node untuk kompleksitas jaringan ideal
    const nodesRef = useRef<QuantumNode[]>([]);

    // Generator struktur jaringan berbasis loop matematis harmonis
    if (nodesRef.current.length === 0) {
        const nodes: QuantumNode[] = [];
        for (let i = 0; i < totalNodes; i++) {
            nodes.push({
                id: i,
                seedX: Math.random() * width,
                seedY: Math.random() * height,
                orbitX: Math.random() * 300 + 100,
                orbitY: Math.random() * 300 + 100,
                // Frekuensi integer konstan untuk menjamin seamless loop pada frame f=0 dan f=600
                freqX: [1, 2, 3][Math.floor(Math.random() * 3)],
                freqY: [1, 2, 3][Math.floor(Math.random() * 3)],
                phase: Math.random() * Math.PI * 2,
                energyBias: Math.random() * 0.6 + 0.4,
                baseHue: Math.floor(Math.random() * 60) + 190, // Palet sinematik: Cyans, Blues, Purples
            });
        }
        nodesRef.current = nodes;
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Bersihkan canvas dengan latar belakang deep techno void
        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, width, height);

        const t = (frame / durationInFrames) * Math.PI * 2;

        // Calculate dynamic multi-dimensional trajectories
        const activePoints = nodesRef.current.map((node) => {
            // Modulasi Lissajous Curve untuk mensimulasikan pergerakan fluida/jaringan saraf
            const x = node.seedX + Math.sin(t * node.freqX + node.phase) * node.orbitX;
            const y = node.seedY + Math.cos(t * node.freqY + node.phase) * node.orbitY;

            // Dinamika denyut energi sel (biomimetic pulsation)
            const pulse = Math.sin(t * 4 + node.phase) * 0.15 + 0.85;

            return {
                ...node,
                x,
                y,
                radius: 180 * node.energyBias * pulse,
            };
        });

        // Sub-sampling Grid tingkat tinggi untuk visualisasi Shading Medan Jarak (Distance Field)
        const resScale = 6;
        const gw = Math.ceil(width / resScale);
        const gh = Math.ceil(height / resScale);

        for (let y = 0; y < gh; y++) {
            for (let x = 0; x < gw; x++) {
                const px = x * resScale;
                const py = y * resScale;

                let d1 = Infinity; // Jarak ke titik terdekat pertama
                let d2 = Infinity; // Jarak ke titik terdekat kedua
                let c1: typeof activePoints[0] | null = null;

                // Evaluasi struktur Euclidean multi-node
                for (let i = 0; i < activePoints.length; i++) {
                    const p = activePoints[i];
                    const dx = px - p.x;
                    const dy = py - p.y;
                    const d = dx * dx + dy * dy; // Kuadrat jarak murni

                    if (d < d1) {
                        d2 = d1;
                        d1 = d;
                        c1 = p;
                    } else if (d < d2) {
                        d2 = d;
                    }
                }

                if (c1) {
                    // Normalisasi jarak asli
                    const dist1 = Math.sqrt(d1);
                    const dist2 = Math.sqrt(d2);

                    // Matematika perbatasan sel Voronoi (F2 - F1) untuk mendeteksi kontur membran biologis
                    const borderFactor = dist2 - dist1;

                    // Hitung pencahayaan volumetrik di dalam sel (Internal Volumetric Glow)
                    const glow = Math.max(0, 1 - dist1 / c1.radius);
                    const intensity = Math.pow(glow, 2.5) * 0.45;

                    // Kalkulasi fusi warna gelap berbasis medan energi quantum
                    const l = Math.floor(4 + intensity * 22);
                    const s = Math.floor(40 + borderFactor * 0.05);

                    // Efek visual interpolasi pembatas organik halus
                    if (borderFactor > 1.5 && borderFactor < 14) {
                        ctx.fillStyle = `hsl(${c1.baseHue}, ${s}%, ${l + 3}%)`;
                    } else {
                        ctx.fillStyle = `hsl(${c1.baseHue}, ${s}%, ${l}%)`;
                    }

                    ctx.fillRect(px, py, resScale, resScale);
                }
            }
        }

        // --- STRUKTUR GRAPHS LEVEL DUA: Jaringan Delaunay & Node Glow Efek ---

        // Mengaktifkan blending mode screen untuk tumpukan cahaya neon fusi sains
        ctx.globalCompositeOperation = "screen";

        // Loop untuk menggambar Triangulasi Delaunay Kompleks dengan teknik Gradasi Linier Multi-titik
        for (let i = 0; i < activePoints.length; i++) {
            const p1 = activePoints[i];

            // Sortir jarak inter-node secara real-time
            const targets = activePoints
                .map((p, idx) => ({ index: idx, d: Math.hypot(p.x - p1.x, p.y - p1.y), x: p.x, y: p.y, hue: p.baseHue }))
                .filter((item) => item.index !== i)
                .sort((a, b) => a.d - b.d);

            // Hubungkan ke 4 tetangga terdekat secara simultan untuk kepadatan jaring siber tingkat tinggi
            for (let j = 0; j < Math.min(4, targets.length); j++) {
                const p2 = targets[j];

                const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                grad.addColorStop(0, `rgba(6, 182, 212, ${0.25 * (1 - p2.d / 1200)})`); // Cyan neon core
                grad.addColorStop(0.5, `rgba(139, 92, 246, ${0.15 * (1 - p2.d / 1200)})`); // Hyper violet border
                grad.addColorStop(1, "rgba(255, 255, 255, 0)");

                ctx.strokeStyle = grad;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }

        // Gambar Inti Cahaya Kuantum (Quantum Core Synapses) pada setiap koordinat jangkar
        activePoints.forEach((p) => {
            // Outer Glow Membran
            const radialGlow = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 45);
            radialGlow.addColorStop(0, `rgba(255, 255, 255, 0.7)`);
            radialGlow.addColorStop(0.2, `hsla(${p.baseHue}, 90%, 60%, 0.4)`);
            radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

            ctx.fillStyle = radialGlow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 45, 0, Math.PI * 2);
            ctx.fill();

            // Core Node Tajam
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Reset composite mode ke default
        ctx.globalCompositeOperation = "source-over";

    }, [frame, width, height, durationInFrames]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ backgroundColor: "#010307" }}
        />
    );
};