import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const MoireMonolith: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Bersihkan Canvas dengan latar belakang Void ultra-dark
        ctx.fillStyle = "#0a0a0c";
        ctx.fillRect(0, 0, width, height);

        // Konfigurasi Grid Garis
        const lineSpacing = 8; // Jarak antar garis (dioptimalkan untuk visual 4K)
        const totalLines = Math.ceil(width / lineSpacing) + 20;

        // Fase waktu untuk seamless loop (0 sampai 2*PI)
        const t = (frame / durationInFrames) * Math.PI * 2;

        // Modulasi rotasi melingkar halus untuk Layer Interaksi (Moiré Generator)
        const baseRotation = Math.sin(t) * 0.025; // Rotasi sangat kecil (sekitar 1.4 derajat)
        // Dinamika pernapasan Monolit pusat berbasis fungsi gelombang
        const pulseFactor = Math.sin(t) * 40;

        // 2. LAYER 1: Gambar Background Grid Statis (#141416)
        ctx.save();
        ctx.strokeStyle = "#141416";
        ctx.lineWidth = 1.5;
        for (let i = -10; i < totalLines; i++) {
            const x = i * lineSpacing;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        ctx.restore();

        // 3. LAYER 2 & 3: Monolit & Layer Interaksi Bergerak dengan Chromatic Aberration
        const colors = [
            { stroke: "rgba(255, 45, 85, 0.85)", offset: -1.5 },  // Red Channel
            { stroke: "rgba(255, 255, 255, 0.9)", offset: 0.0 },  // White Channel
            { stroke: "rgba(0, 242, 254, 0.85)", offset: 1.5 },   // Blue Channel
        ];

        colors.forEach((channel) => {
            ctx.save();

            // Terapkan efek pergeseran channel warna (Chromatic Aberration)
            ctx.translate(channel.offset, 0);

            // Atur titik pusat transformasi di tengah layar
            ctx.translate(width / 2, height / 2);
            ctx.rotate(baseRotation);
            ctx.translate(-width / 2, -height / 2);

            ctx.strokeStyle = channel.stroke;
            ctx.lineWidth = 1.8;

            // Definisi Geometri Monolit Tengah (SDF Kotak Vertikal)
            const monolithWidth = 700;
            const monolithHeight = 1500;
            const monolithLeft = (width - monolithWidth) / 2;
            const monolithRight = monolithLeft + monolithWidth;
            const monolithTop = (height - monolithHeight) / 2;
            const monolithBottom = monolithTop + monolithHeight;

            for (let i = -50; i < totalLines + 50; i++) {
                // Logika Pergerakan Garis Konstan dengan Operator Modulo (%) agar Seamless Loop
                const shiftX = (frame / durationInFrames) * lineSpacing;
                const xPosition = (i * lineSpacing) + (shiftX % lineSpacing);

                ctx.beginPath();

                // Gambar garis vertikal per segmen piksel untuk mengaplikasikan SDF Distortion
                const segmentSize = 10;
                let firstSegment = true;

                for (let y = 0; y <= height; y += segmentSize) {
                    let currentX = xPosition;

                    // Cek apakah koordinat saat ini berada di dalam area Monolit
                    if (currentX > monolithLeft && currentX < monolithRight && y > monolithTop && y < monolithBottom) {

                        // Hitung jarak normalisasi ke tepi monolit untuk kehalusan transisi
                        const distX = Math.min(currentX - monolithLeft, monolithRight - currentX) / (monolithWidth / 2);
                        const distY = Math.min(y - monolithTop, monolithBottom - y) / (monolithHeight / 2);
                        const edgeInfluence = Math.pow(distX * distY, 0.5);

                        // Terapkan Distorsi Spasial
                        const wave = Math.sin((y * 0.004) + t) * (60 + pulseFactor);
                        currentX += wave * edgeInfluence;
                    }

                    if (firstSegment) {
                        ctx.moveTo(currentX, y);
                        firstSegment = false;
                    } else {
                        ctx.lineTo(currentX, y);
                    }
                }
                ctx.stroke();
            }
            ctx.restore();
        });

    }, [frame, width, height, durationInFrames]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#010307"
            }}
        />
    );
};