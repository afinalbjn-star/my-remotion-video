import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
} from 'remotion';
import { noise2D } from '@remotion/noise';

const CELL_COUNT = 40;

const Erythrocyte: React.FC<{ seed: number }> = ({ seed }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    const config = useMemo(() => {
        return {
            size: 180 + random(seed) * 140,
            yBase: random(seed + 1) * height,
            // Offset progress awal agar sel tersebar merata
            initialProgress: random(seed + 2),
            // Jumlah putaran rotasi (harus integer agar seamless)
            rotations: Math.floor(random(seed + 3) * 3) + 1,
            // Amplitudo deformasi
            deformIntensity: 0.1 + random(seed + 4) * 0.1,
            // Frekuensi deformasi (integer per loop agar seamless)
            deformCycles: Math.floor(random(seed + 5) * 4) + 2,
            driftAmplitude: 40 + random(seed + 5) * 60,
            opacity: 0.7 + random(seed + 6) * 0.3,
            // Variasi bentuk agar tidak bulat sempurna (organic blobs)
            blobSeed: random(seed + 7),
            // Kekuatan turbulensi unik per sel
            turbulenceStrength: 20 + random(seed + 8) * 40,
        };
    }, [seed, height]);

    // Perhitungan posisi X untuk Seamless Loop
    // Menggunakan progress 0 ke 1 yang diulang
    const margin = config.size * 2;
    const rawProgress = (frame / durationInFrames + config.initialProgress) % 1;
    const currentX = interpolate(rawProgress, [0, 1], [width + margin, -margin]);

    // Jalur Gerak Turbulensi (Seamless)
    // Mengambil sampel noise dalam lingkaran agar frame awal dan akhir menyambung
    const t = (frame / durationInFrames) * Math.PI * 2;
    const noiseSampleX = Math.cos(t);
    const noiseSampleY = Math.sin(t);

    const turbulenceX = noise2D(seed, noiseSampleX, noiseSampleY) * config.turbulenceStrength;
    const turbulenceY = noise2D(seed + 100, noiseSampleX, noiseSampleY) * config.turbulenceStrength;

    // Animasi Deformabilitas Seamless
    // Menggunakan Math.PI * 2 memastikan titik awal dan akhir sama
    const deformPulse = Math.sin((frame / durationInFrames) * Math.PI * 2 * config.deformCycles + seed);

    // Deformasi Skala
    const scaleX = 1 + (deformPulse * config.deformIntensity);
    const scaleY = 1 - (deformPulse * config.deformIntensity * 0.5);

    // Variasi Border Radius untuk efek "Squishy"
    const b1 = interpolate(deformPulse, [-1, 1], [45, 55]);
    const b2 = interpolate(deformPulse, [-1, 1], [55, 45]);
    const borderRadius = `${b1}% ${b2}% ${b1}% ${b2}% / ${b2}% ${b1}% ${b2}% ${b1}%`;

    // Gerakan melayang vertikal Seamless
    const drift = Math.sin((frame / durationInFrames) * Math.PI * 2 + seed) * config.driftAmplitude;

    // Rotasi Seamless
    const rotation = (frame / durationInFrames) * 360 * config.rotations;

    return (
        <div
            style={{
                position: 'absolute',
                left: currentX + turbulenceX,
                top: config.yBase + drift + turbulenceY,
                width: config.size,
                height: config.size,
                opacity: config.opacity,
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
                // Warna dasar eritrosit dengan kedalaman 3D
                background: 'radial-gradient(circle at 35% 35%, #ff4d4d 0%, #b30000 50%, #4d0000 100%)',
                borderRadius,
                boxShadow: `
                    inset -10px -10px ${config.size * 0.2}px rgba(0,0,0,0.6),
                    inset 10px 10px ${config.size * 0.2}px rgba(255,255,255,0.1),
                    0 20px 50px rgba(0,0,0,0.5)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                willChange: 'transform',
                border: '1px solid rgba(139, 0, 0, 0.3)',
            }}
        >
            {/* Efek cekungan di tengah (Biconcave center) */}
            <div style={{
                width: '45%',
                height: '45%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,0,0,0.5) 0%, transparent 80%)',
                boxShadow: `
                    inset 0 0 20px rgba(0,0,0,0.8),
                    0 0 15px rgba(0,0,0,0.2)
                `,
                filter: 'blur(2px)',
            }} />

            {/* Specular Highlight (Pantulan Cahaya) */}
            <div style={{
                position: 'absolute',
                top: '15%',
                left: '15%',
                width: '25%',
                height: '20%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                borderRadius: '50% 20% 50% 20%',
                filter: 'blur(3px)',
            }} />
        </div>
    );
};

export const BloodCellFlow: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Efek denyut jantung seamless (2 kali denyut per loop)
    const pulse = 1 + Math.sin((frame / durationInFrames) * Math.PI * 2 * 2) * 0.03;

    return (
        <AbsoluteFill style={{
            backgroundColor: '#2a0202',
            overflow: 'hidden'
        }}>
            {/* Background dengan tekstur pembuluh darah */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, #4d0202 0%, #1a0101 100%)',
                transform: `scale(${pulse})`,
            }} />

            {/* Partikel Plasma / Detail kecil di latar belakang */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(255,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '100px 100px',
                opacity: 0.2,
            }} />

            {/* Layer Sel Darah Merah */}
            {new Array(CELL_COUNT).fill(0).map((_, i) => (
                <Erythrocyte key={i} seed={i * 12.34} />
            ))}

            {/* Efek Vignette dan Atmosfer kabur */}
            <AbsoluteFill style={{
                background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
                // Gunakan box-shadow besar sebagai alternatif blur jika layar masih putih
                boxShadow: 'inset 0 0 200px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
            }} />
        </AbsoluteFill>
    );
};