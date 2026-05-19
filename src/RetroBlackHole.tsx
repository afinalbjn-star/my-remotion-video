import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
    random,
} from 'remotion';

/**
 * 10 Warna Retro Pop yang kontras dan cerah
 */
const RETRO_COLORS = [
    '#FF1D58', // Pink kemerahan
    '#F75990', // Pink muda
    '#FFF685', // Kuning terang
    '#00DDFF', // Cyan
    '#0049B7', // Biru tua
    '#FF8C00', // Orange
    '#7FFF00', // Chartreuse (Hijau Neon)
    '#9370DB', // Ungu
    '#FF1493', // Deep Pink
    '#00CED1', // Turquoise
];

export const RetroBlackHole: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();

    // Progress loop setiap 10 detik (600 frame pada 60fps)
    const loopFrames = 600;
    const progress = (frame % loopFrames) / loopFrames;

    // Jumlah tumpahan cat (blobs)
    const numBlobs = 60;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {/* 
                Gooey Filter Container: 
                Menggunakan filter blur dan kontras tinggi untuk menciptakan efek 
                tumpahan cat yang menyatu (seperti metaballs).
            */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    filter: 'blur(30px) contrast(30) brightness(1.2)',
                    backgroundColor: '#000',
                }}
            >
                {Array.from({ length: numBlobs }).map((_, i) => {
                    // Variasi acak per blob agar tumpahan terlihat organik
                    const seed = i * 123.45;
                    const offset = i / numBlobs;
                    const p = (progress + offset) % 1;

                    // Efek tersedot: Mengecil drastis ke arah pusat
                    const scale = interpolate(p, [0, 1], [12, 0], {
                        easing: Easing.bezier(0.4, 0, 1, 1),
                    });

                    // Putaran spiral
                    const rotation = interpolate(p, [0, 1], [0, 720]);

                    // Variasi bentuk tumpahan cat yang berubah-ubah (wobble)
                    const wobble = Math.sin(frame * 0.05 + seed) * 10;
                    // Amplitude wobble meningkat saat mendekati pusat (p mendekati 1)
                    const wobbleAmplitude = interpolate(p, [0, 0.5, 1], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) * 20;
                    const dynamicWobble = Math.sin(frame * 0.05 + seed) * (10 + wobbleAmplitude);
                    const borderRadius = `${40 + wobble}% ${60 - wobble}% ${50 + wobble}% ${50 - wobble}% / ${55 - wobble}% ${45 + wobble}% ${65 - wobble}% ${35 + wobble}%`;

                    // Efek distorsi riak air (ripple)
                    // Ini akan menambahkan sedikit pergeseran radial yang bergelombang
                    const rippleWave = Math.sin(p * Math.PI * 8 + frame * 0.1 + seed); // Gelombang berdasarkan progres, waktu, dan seed
                    const rippleMagnitude = interpolate(p, [0, 0.5, 1], [0, 40, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }); // Magnitudo riak maksimal di tengah proses penyerapan

                    // Hitung arah radial berdasarkan rotasi saat ini untuk riak spiral
                    const currentAngleRad = (rotation * Math.PI) / 180;
                    const rippleX = Math.cos(currentAngleRad) * rippleWave * rippleMagnitude;
                    const rippleY = Math.sin(currentAngleRad) * rippleWave * rippleMagnitude;

                    // Transparansi hanya di awal muncul agar tidak patah
                    const opacity = interpolate(p, [0, 0.05], [0, 1], { extrapolateRight: 'clamp' });
                    const color = RETRO_COLORS[i % RETRO_COLORS.length];
                    // Ukuran dasar blob
                    const blobSize = width * 0.8;

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: blobSize,
                                height: blobSize,
                                backgroundColor: color,
                                borderRadius,
                                transform: `translate(${rippleX}px, ${rippleY}px) rotate(${rotation}deg) scale(${scale})`, // Terapkan translasi riak
                                opacity,
                                // Memberikan kesan volume pada cat
                                boxShadow: `inset -20px -20px 60px rgba(0,0,0,0.3), 0 0 40px ${color}`,
                            }}
                        />
                    );
                })}
            </div>

            {/* 
                Overlay Grain/Noise untuk tekstur retro tambahan 
                agar tidak terlihat terlalu digital/bersih
            */}
            <AbsoluteFill style={{
                pointerEvents: 'none',
                opacity: 0.15,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />

            {/* Pusat Black Hole (Singularity) yang lebih pekat */}
            <div style={{
                position: 'absolute',
                width: 400,
                height: 400,
                backgroundColor: 'black',
                borderRadius: '50%',
                left: width / 2 - 200,
                top: height / 2 - 200,
                boxShadow: '0 0 300px 150px black, inset 0 0 100px #000',
                zIndex: 100,
            }} />
        </AbsoluteFill>
    );
};