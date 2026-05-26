import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const NUM_BALLS = 5;

// Palet warna Retro Pop Art yang berubah setiap 5 detik
const COLOR_SETS = [
    ['#ff0055', '#00ffcc', '#ffff00', '#ffaa00', '#cc00ff'], // Neon Vibrant (0-5s)
    ['#3300ff', '#ff3300', '#00ff33', '#ffcc00', '#ff00ff'], // Primary Pop (5-10s)
    ['#00ffff', '#ff0080', '#80ff00', '#ff8000', '#ffffff'], // Cyber Retro (10-15s)
];

const Sphere: React.FC<{
    color: string,
    x: number,
    y: number,
    size: number,
    zIndex: number
}> = ({ color, x, y, size, zIndex }) => {
    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: y,
                width: size,
                height: size,
                backgroundColor: color,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex,
                // Efek 3D menggunakan Radial Gradient
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${color} 40%, #000000 100%)`,
                boxShadow: `
                    ${size * 0.05}px ${size * 0.1}px ${size * 0.2}px rgba(0,0,0,0.5),
                    inset -${size * 0.05}px -${size * 0.05}px ${size * 0.1}px rgba(0,0,0,0.6)
                `,
            }}
        >
            {/* Pantulan cahaya tajam di permukaan */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: '15%',
                height: '15%',
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: '50%',
                filter: 'blur(5px)',
            }} />
        </div>
    );
};

export const RetroPopLoadingBackground: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const phaseFrames = 300; // 5 detik @ 60fps
    const currentPhase = Math.floor(frame / phaseFrames) % 3;

    // Interpolasi warna untuk transisi antar fase yang mulus
    const getBallColor = (index: number) => {
        const set1 = COLOR_SETS[currentPhase];
        const set2 = COLOR_SETS[(currentPhase + 1) % 3];

        // Transisi warna diperhalus menjadi 60 frame
        const transition = interpolate(frame % phaseFrames, [240, 300], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.quad),
        });

        const c1 = set1[index];
        const c2 = set2[index];

        // Menggunakan interpolasi warna hex secara manual atau blend sederhana
        // Untuk pop art, kita gunakan blend opacity jika ingin halus, atau tetap cut tapi di titik easing nol
        return transition > 0.5 ? c2 : c1;
    };

    const spheres = new Array(NUM_BALLS).fill(0).map((_, i) => {
        const sphereSize = 500;

        // Pattern 1: Circular (Loops perfectly over 15s)
        const p1Rotation = (frame / durationInFrames) * Math.PI * 2 * 3;
        const p1Angle = (i / NUM_BALLS) * Math.PI * 2 + p1Rotation;
        const x1 = width / 2 + Math.cos(p1Angle) * 600;
        const y1 = height / 2 + Math.sin(p1Angle) * 600;
        const s1 = interpolate(Math.sin(p1Angle), [-1, 1], [0.8, 1.2]);

        // Pattern 2: Wave (Loops perfectly over 15s)
        const x2 = width / 2 + (i - (NUM_BALLS - 1) / 2) * 700;
        const p2Wave = Math.sin((frame / durationInFrames) * Math.PI * 12 + i * 0.8);
        const y2 = height / 2 + p2Wave * 300;
        const s2 = interpolate(p2Wave, [-1, 1], [0.9, 1.1]);

        // Pattern 3: Accordion (Loops perfectly over 15s)
        const p3Move = Math.sin((frame / durationInFrames) * Math.PI * 6);
        const side = i % 2 === 0 ? 1 : -1;
        const x3 = width / 2 + (side * p3Move * 1400 * (i + 1)) / NUM_BALLS;
        const y3 = height / 2;
        const s3 = interpolate(Math.abs(p3Move), [0, 1], [1, 0.7]);

        // Jendela transisi diperlebar (60 frame) dan Easing diperhalus
        const t1 = interpolate(frame, [240, 300], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.quad),
        });
        const t2 = interpolate(frame, [540, 600], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.quad),
        });
        const t3 = interpolate(frame, [840, 900], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.inOut(Easing.quad),
        });

        let x, y, scale;
        if (frame <= 300) {
            x = interpolate(t1, [0, 1], [x1, x2]);
            y = interpolate(t1, [0, 1], [y1, y2]);
            scale = interpolate(t1, [0, 1], [s1, s2]);
        } else if (frame <= 600) {
            x = interpolate(t2, [0, 1], [x2, x3]);
            y = interpolate(t2, [0, 1], [y2, y3]);
            scale = interpolate(t2, [0, 1], [s2, s3]);
        } else {
            x = interpolate(t3, [0, 1], [x3, x1]);
            y = interpolate(t3, [0, 1], [y3, y1]);
            scale = interpolate(t3, [0, 1], [s3, s1]);
        }

        return {
            x,
            y,
            size: sphereSize * scale,
            color: getBallColor(i),
            zIndex: Math.round(scale * 100),
        };
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
            {/* Latar Belakang Retro Grid */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(0, 255, 255, 0.1) 2px, transparent 2px),
                    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 2px, transparent 2px)
                `,
                backgroundSize: '100px 100px',
                perspective: '1000px',
                transform: 'rotateX(60deg) translateY(-200px)',
                opacity: 0.3,
            }} />

            {/* Halftone Pattern Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                opacity: 0.2,
                pointerEvents: 'none',
            }} />

            {/* Rendering Bola */}
            {spheres.sort((a, b) => a.zIndex - b.zIndex).map((s, i) => (
                <Sphere
                    key={i}
                    x={s.x}
                    y={s.y}
                    size={s.size}
                    color={s.color}
                    zIndex={s.zIndex}
                />
            ))}

            {/* Post-processing: Grain/Noise */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                pointerEvents: 'none',
                background: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
            }} />

            {/* Vignette Pop Art */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.8) 100%)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};