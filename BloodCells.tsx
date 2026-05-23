import React, { useMemo } from 'react';
import {
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    AbsoluteFill,
} from 'remotion';

const CELL_COUNT = 50;

const BloodCell: React.FC<{ seed: number }> = ({ seed }) => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();


    // Fungsi pseudo-random sederhana agar posisi tetap konsisten berdasarkan seed
    const random = (s: number) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
    };

    // Variabel variasi unik per sel
    const rX = useMemo(() => random(seed * 1.1) * width, [seed, width]);
    const rY = useMemo(() => random(seed * 2.2) * height, [seed, height]);
    const size = useMemo(() => 150 + random(seed * 3.3) * 200, [seed]);
    const speedOffset = useMemo(() => random(seed * 4.4) * durationInFrames, [seed, durationInFrames]);
    const rotationSeed = useMemo(() => random(seed * 5.5) * 360, [seed]);

    // Logika Aliran sederhana menggunakan modulo agar seamless loop
    const progression = ((frame + speedOffset) % durationInFrames) / durationInFrames;

    // Animasi Kedalaman (Z-Axis)
    const scale = interpolate(progression, [0, 1], [0.1, 3]);

    // Opacity dengan fade yang lebih halus
    const opacity = interpolate(progression, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);

    // Gerakan horizontal sederhana (Drift)
    const posX = interpolate(progression, [0, 1], [rX - 250, rX + 250]);

    // Depth of Field (Blur berdasarkan jarak)
    const blur = interpolate(progression, [0, 0.4, 1], [8, 0, 12]);

    return (
        <div
            style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size}px`,
                left: `${posX}px`,
                top: `${rY}px`,
                backgroundColor: '#b30000',
                borderRadius: '50%',
                // Efek visual sel darah merah biconcave
                boxShadow: `
					inset 20px 20px 60px rgba(0,0,0,0.7),
					inset -20px -20px 60px rgba(255,50,50,0.4),
					0 0 40px rgba(150,0,0,0.3)
				`,
                opacity,
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotationSeed + progression * 360}deg)`,
                filter: `blur(${blur}px)`,
            }}
        >
            {/* Efek cekungan tengah (Biconcave) */}
            <div style={{
                position: 'absolute',
                top: '25%',
                left: '25%',
                width: '50%',
                height: '50%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.6) 0%, transparent 70%)',
                boxShadow: '0 0 10px rgba(0,0,0,0.4)',
            }} />
        </div>
    );
};

export const BloodStream: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0000' }}>
            {new Array(CELL_COUNT).fill(0).map((_, i) => (
                <BloodCell key={i} seed={i} />
            ))}

            {/* Overlay gradient pembuluh darah (Vignette) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 20%, rgba(50, 0, 0, 0.9) 100%)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};