import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';

const PARTICLE_COUNT = 1500;
const TRAIL_LENGTH = 25; // Jumlah titik per jejak garis

export const FlowFields: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Inisialisasi posisi partikel yang stabil
    const particles = useMemo(() => {
        return new Array(PARTICLE_COUNT).fill(0).map((_, i) => ({
            x: random(`x-${i}`) * width,
            y: random(`y-${i}`) * height,
            speed: random(`speed-${i}`) * 2 + 1,
            seed: random(`seed-${i}`) * 100,
            color: i % 2 === 0 ? '#4facfe' : '#bc13fe',
        }));
    }, [width, height]);

    // Fungsi matematika untuk menghitung aliran "angin" (pseudo-noise)
    const getAngle = useCallback((x: number, y: number, f: number) => {
        const time = (f / durationInFrames) * Math.PI * 2;
        return (
            Math.sin(x * 0.001 + time) * 2 +
            Math.cos(y * 0.001 - time) * 2 +
            Math.sin((x + y) * 0.0005) * 5
        );
    }, [durationInFrames]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        particles.forEach((p) => {
            ctx.beginPath();
            ctx.strokeStyle = p.color;

            let lastX = p.x;
            let lastY = p.y;

            // Gambar jejak (trail) untuk frame saat ini
            // Dalam Remotion, kita menghitung mundur dari frame sekarang untuk membuat trail
            for (let j = 0; j < TRAIL_LENGTH; j++) {
                const targetFrame = frame - j;
                if (targetFrame < 0) break;

                // Kalkulasi posisi partikel pada frame tertentu secara prosedural
                // Agar performa tetap terjaga, kita gunakan simulasi langkah mundur
                const angle = getAngle(lastX, lastY, targetFrame);

                const nextX = lastX - Math.cos(angle) * p.speed;
                const nextY = lastY - Math.sin(angle) * p.speed;

                ctx.moveTo(lastX, lastY);
                ctx.lineTo(nextX, nextY);

                // Buat garis semakin tipis dan memudar di ujung jejak
                const alpha = (1 - j / TRAIL_LENGTH) * 0.5;
                ctx.globalAlpha = alpha;
                ctx.lineWidth = (1 - j / TRAIL_LENGTH) * 4;

                lastX = nextX;
                lastY = nextY;

                // Re-wrap jika keluar layar
                if (lastX < 0) lastX = width;
                if (lastX > width) lastX = 0;
                if (lastY < 0) lastY = height;
                if (lastY > height) lastY = 0;
            }
            ctx.stroke();
        });

        // Overlay glow effect
        ctx.globalAlpha = 0.1;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#4facfe';
    }, [frame, width, height, particles, getAngle]);

    return (
        <AbsoluteFill style={{ backgroundColor: '#050005' }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />
            {/* Overlay gradasi gelap di pinggir untuk fokus */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 300px rgba(0,0,0,0.8)',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};