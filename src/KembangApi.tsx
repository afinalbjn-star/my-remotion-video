import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';

const PARTICLE_COUNT = 450;

const Spark: React.FC<{ index: number }> = ({ index }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Menggunakan index sebagai seed agar pergerakan tetap konsisten (deterministik)
    const seed = index * 55.55;
    const x = random(seed) * width;

    // Menentukan apakah partikel ini "Tajam/Utuh" atau "Blur/Bercahaya"
    const isSharp = random(seed + 7) > 0.4; // 60% partikel akan terlihat utuh

    // Ukuran diperbesar secara signifikan (15px sampai 50px)
    const size = isSharp ? (random(seed + 3) * 20 + 10) : (random(seed + 3) * 35 + 15);

    const opacityBase = random(seed + 4) * 0.5 + 0.5;

    // Agar kedipan juga seamless, frekuensi harus selaras dengan durasi video
    const flickerCycles = Math.floor(random(seed + 5) * 10) + 5;
    const flickerSpeed = (flickerCycles * 2 * Math.PI) / durationInFrames;

    // Logika Seamless Loop yang disempurnakan:
    const loopHeight = height + 600;
    const initialY = random(seed + 1) * loopHeight; // Posisi Y awal acak

    // Variasi kecepatan jatuh yang santai dan SEAMLESS (harus angka bulat agar looping video mulus)
    // 1 = Paling lambat (15 detik sekali jalan), 2 = Sedang, 3 = Cepat
    const numLoops = Math.floor(random(seed + 2) * 3) + 1;
    const progress = frame / durationInFrames;
    const yPos = (initialY + progress * loopHeight * numLoops) % loopHeight;

    // Efek memudar di tepi layar agar transisi masuk/keluar tidak tajam
    const fadeArea = 400;
    const edgeFade = yPos < fadeArea
        ? yPos / fadeArea
        : yPos > loopHeight - fadeArea
            ? (loopHeight - yPos) / fadeArea
            : 1;

    // Efek pendaran cahaya
    const flicker = Math.sin(frame * flickerSpeed) * 0.3 + 0.7;
    const opacity = opacityBase * flicker * edgeFade;

    return (
        <div
            style={{
                position: 'absolute',
                left: x,
                top: yPos - 400, // Mulai dari atas layar
                width: size,
                height: size,
                backgroundColor: '#FFD700', // Kuning Emas
                borderRadius: '50%',
                // Logika filter: Jika tajam, hanya gunakan shadow tipis. Jika tidak, gunakan blur.
                filter: isSharp
                    ? `drop-shadow(0 0 ${size / 4}px rgba(234, 179, 8, 0.8))`
                    : `blur(${size / 6}px) drop-shadow(0 0 ${size * 1.2}px #EAB308)`,
                opacity: opacity,
            }}
        />
    );
};

export const KembangApi: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#020617' }}>
            {/* Gradasi Biru Tua untuk kedalaman latar belakang */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)', opacity: 0.6 }} />

            {new Array(PARTICLE_COUNT).fill(0).map((_, i) => (
                <Spark key={i} index={i} />
            ))}
        </AbsoluteFill>
    );
};