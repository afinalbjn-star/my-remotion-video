import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { LiquidFilterProps } from '../types';

export const LiquidFilter: React.FC<LiquidFilterProps> = ({
    baseFrequencyX,
    baseFrequencyY,
    numOctaves,
    scale,
    seed,
}) => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // KUNCI SEAMLESS LOOP: Menggunakan fungsi Sinus dan Cosinus (Trigonometri)
    // Dengan memetakan frame ke lingkaran penuh (0 hingga 2*PI), 
    // nilai awal (frame 0) akan sama persis dengan nilai akhir (durationInFrames).
    const totalProgress = (frame / durationInFrames) * Math.PI * 2;

    // Evolusi pergerakan gelombang cair secara sirkular yang lebih halus
    // Kita perkecil amplitudonya agar frekuensi tidak menyentuh angka nol/negatif
    const offsetX = Math.sin(totalProgress) * 0.002;
    const offsetY = Math.cos(totalProgress) * 0.002;

    // Penyesuaian dinamis frekuensi dasar berdasarkan pergerakan lingkaran
    const dynamicFreqX = baseFrequencyX + offsetX;
    const dynamicFreqY = baseFrequencyY + offsetY;

    return (
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
                <filter id="liquid-wave-filter" x="-20%" y="-20%" width="140%" height="140%">
                    {/* 1. Menghasilkan noise fraktal berbasis awan/cairan */}
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency={`${dynamicFreqX} ${dynamicFreqY}`}
                        numOctaves={numOctaves}
                        seed={seed}
                        result="noise"
                    />
                    {/* 2. Menggunakan noise untuk mendistorsi gambar asli */}
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale={scale}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="displacement"
                    />
                </filter>
            </defs>
        </svg>
    );
};