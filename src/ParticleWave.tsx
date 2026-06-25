import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const ParticleWave: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background hitam pekat
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#030804'; // Hitam dengan tint hijau sangat gelap
        ctx.fillRect(0, 0, width, height);

        // KUNCI SEAMLESS LOOP:
        // Nilai ini akan berjalan tepat dari 0.0 di awal hingga 1.0 di akhir video.
        const loopProgress = frame / durationInFrames;

        // Dikalikan Math.PI * 2 (360 derajat) agar putaran gelombang tepat kembali ke titik awal.
        const timeAngle = loopProgress * Math.PI * 2;

        // KEPADATAN EKSTREM
        const cols = 320; // Jumlah titik ke samping
        const rows = 180; // Kedalaman ke belakang
        const spacing = 12; // Jarak antar titik dipersempit

        for (let z = 5; z < rows; z++) {
            for (let x = 0; x < cols; x++) {
                const gridX = (x - cols / 2) * spacing;
                const gridZ = z * spacing;

                // Matematika Gelombang dengan animasi berdasarkan timeAngle
                // timeAngle * 2 membuat gelombang tertentu bergerak dua kali lipat, tapi tetap seamless
                const wave1 = Math.sin(x * 0.08 + z * 0.04 + timeAngle) * 60;
                const wave2 = Math.cos(x * 0.06 - z * 0.05 + timeAngle * 2) * 40;
                const y = wave1 + wave2;

                // Proyeksi Kamera 3D ke 2D
                const fov = 900;
                const distance = fov + gridZ;
                const scale = fov / distance;

                const screenX = width / 2 + gridX * scale;
                const screenY = height / 2 + (y + 100) * scale - (gridZ * 0.5);

                // Ukuran titik diperkecil karena jumlahnya sangat banyak
                const size = Math.max(0.2, 1.4 * scale);

                // Transparansi memudar perlahan di kejauhan (Depth of Field)
                const opacity = Math.max(0, Math.min(1, scale * 2.5 - 0.2));

                // WARNA HIJAU NEON
                // Normalisasi koordinat Y untuk menentukan terang/gelapnya hijau
                const normalizedY = Math.max(0, Math.min(1, (y + 100) / 200));

                // Warna hijau (G) dominan, dengan sedikit warna biru (B) untuk kesan digital/neon
                const colorG = Math.floor(100 + normalizedY * 155); // Rentang 100 - 255
                const colorB = Math.floor(colorG * 0.25); // Sedikit sentuhan cyan/biru

                ctx.beginPath();
                ctx.arc(screenX, screenY, size, 0, Math.PI * 2);

                ctx.fillStyle = `rgba(0, ${colorG}, ${colorB}, ${opacity})`;
                ctx.fill();
            }
        }
    }, [frame, width, height, durationInFrames]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};