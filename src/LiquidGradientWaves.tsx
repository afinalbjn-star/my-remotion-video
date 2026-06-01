import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from 'remotion';

const LiquidGradientWaves: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();

    // Progress loop dari 0 sampai 1 secara linear sepanjang durasi komposisi
    const progress = frame / durationInFrames;

    // Mengunci konfigurasi 310 garis secara statis dengan useMemo agar struktur tidak teracak tiap frame
    const lines = useMemo(() => {
        const totalLines = 1500; // Jumlah pita ditingkatkan untuk kepadatan maksimal tanpa celah
        return Array.from({ length: totalLines }).map((_, i) => {
            // Menyebarkan posisi dasar pita secara merata dari atas ke bawah layar
            const baseY = (i / totalLines - 0.5) * height * 1.2;
            const seedY = baseY + Math.sin(i * 0.45) * 60;

            const frequency = 2 + (i % 5) * 0.6;
            const amplitude = 35 + (i % 8) * 12;
            const speedOffset = (i * Math.PI) / 50;

            // Pewarnaan Palet Cyberpunk Neon (Deep Purple, Hot Magenta, & Electric Cyan)
            const ratio = i / totalLines;
            let color = 'rgba(69, 243, 255, 0.16)'; // Peningkatan opasitas dasar
            if (ratio < 0.35) {
                color = `rgba(147, 51, 234, ${0.12 + ratio * 0.1})`; // Pendaran Ungu lebih kuat
            } else if (ratio < 0.7) {
                color = `rgba(236, 72, 153, ${0.15 + (ratio - 0.35) * 0.12})`; // Magenta lebih kontras
            } else {
                color = `rgba(6, 182, 212, ${0.12 + (1 - ratio) * 0.15})`; // Cyan lebih berpendar
            }

            return {
                seedY,
                frequency,
                amplitude,
                speedOffset,
                color,
                strokeWidth: 3.5 + (i % 5) * 2.5 // Tali pita dipertebal signifikan
            };
        });
    }, []);

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#07080d', // Dark cyber night background
                overflow: 'hidden',
            }}
        >
            {/* Efek Ambient Glow / Cahaya Pijar di Latar Belakang */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, rgba(0,0,0,0) 70%)',
                    filter: 'blur(80px)',
                    mixBlendMode: 'screen',
                }}
            />

            {/* SVG Canvas untuk merender 300+ Garis secara simultan */}
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    mixBlendMode: 'screen', // Menghasilkan efek tumpukan neon menyala (glowing)
                }}
            >
                {lines.map((line, index) => {
                    // Rahasia Seamless Loop: Mengubah progress linear menjadi gerakan melingkar 2 * Math.PI
                    const angle = progress * 2 * Math.PI;

                    // Nilai koordinat sirkular penggerak gelombang cair
                    const loopX = Math.cos(angle + line.speedOffset);
                    const loopY = Math.sin(angle + line.speedOffset);

                    // Pembuatan titik koordinat horizontal sepanjang resolusi layar
                    const points: string[] = [];
                    const resolution = 60; // Resolusi ditingkatkan agar garis tebal tetap smooth/mulus
                    const step = width / (resolution - 1);

                    for (let xIdx = 0; xIdx < resolution; xIdx++) {
                        const posX = xIdx * step;

                        // Rumus interferensi gelombang ganda (Double Wave Interference)
                        const waveFactor = Math.sin((xIdx / resolution) * line.frequency * Math.PI + loopX * 1.5);
                        const waveFactorAlt = Math.cos((xIdx / resolution) * 3 + loopY * 1.2);

                        // Akumulasi Y-axis untuk efek pergerakan cairan meliuk-liuk lambat
                        const posY =
                            height / 2 +
                            line.seedY +
                            waveFactor * line.amplitude +
                            waveFactorAlt * (line.amplitude * 0.4);

                        points.push(`${posX},${posY}`);
                    }

                    // Satukan koordinat menjadi instruksi path SVG linier
                    const pathData = `M ${points.join(' L ')}`;

                    return (
                        <path
                            key={index}
                            d={pathData}
                            fill="none"
                            stroke={line.color}
                            strokeWidth={line.strokeWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                // Denyut opacity mikro agar anyaman garis terlihat lebih hidup/terarah
                                opacity: interpolate(Math.sin(angle + index * 0.1), [-1, 1], [0.6, 1]),
                            }}
                        />
                    );
                })}
            </svg>
        </AbsoluteFill>
    );
};

export default LiquidGradientWaves;