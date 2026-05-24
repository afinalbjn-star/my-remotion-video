import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
} from 'remotion';

// Palet warna Pastel (6 Warna)
const COLORS = [
    '#FFB7B2', // Pastel Pink
    '#FFDAC1', // Pastel Orange
    '#E2F0CB', // Pastel Greenish Yellow
    '#B5EAD7', // Pastel Mint
    '#C7CEEA', // Pastel Periwinkle
    '#A2D2FF', // Pastel Sky Blue
];

const SHAPE_TYPES = ['circle', 'square', 'triangle'];

interface GeometricObjectProps {
    seed: number;
    sf: number;
}

const GeometricObject: React.FC<GeometricObjectProps> = ({ seed, sf }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Properti unik per objek berdasarkan seed
    const config = useMemo(() => {
        const type = SHAPE_TYPES[Math.floor(random(seed) * SHAPE_TYPES.length)];
        const color = COLORS[Math.floor(random(seed + 1) * COLORS.length)];
        const size = (200 + random(seed + 2) * 350) * sf; // Ukuran diperbesar

        return {
            type,
            color,
            size,
            startX: random(seed + 3) * width,
            startY: random(seed + 4) * height,
            // Kecepatan gerakan dan rotasi yang lambat
            rotCycles: Math.floor(random(seed + 6) * 2) + 1,
            rotDirection: random(seed + 10) > 0.5 ? 1 : -1,
            offset: random(seed + 7) * durationInFrames,
            // Amplitudo gerakan melayang (drift)
            driftX: (random(seed + 8) - 0.5) * 400 * sf,
            driftY: (random(seed + 9) - 0.5) * 400 * sf,
        };
    }, [seed, sf, width, height, durationInFrames]);

    // Progress loop seamless
    const t = ((frame + config.offset) % durationInFrames) / durationInFrames;
    const wave = Math.sin(t * Math.PI * 2);

    // 1. Kedalaman bidang (Z-Axis Simulation)
    // Objek akan bergerak "maju-mundur" dalam ruang imajiner
    const zProgress = Math.sin(t * Math.PI * 2);

    // Skala berubah berdasarkan kedalaman
    const scale = interpolate(zProgress, [-1, 1], [0.5, 1.5]);

    // Blur dinamis: Paling tajam saat zProgress berada di tengah (0), 
    // dan buram saat terlalu jauh (-1) atau terlalu dekat (1).
    const blur = interpolate(Math.abs(zProgress), [0, 1], [0, 25 * sf]);

    // Opacity sedikit berkurang saat menjauh
    const opacity = interpolate(zProgress, [-1, 1], [0.3, 0.8]);

    // 2. Gerakan Melayang (Organic Floating)
    const currentX = config.startX + wave * config.driftX;
    const currentY = config.startY + Math.cos(t * Math.PI * 2) * config.driftY;

    // 3. Rotasi Lambat
    const rotation = t * 360 * config.rotCycles * config.rotDirection;

    const renderShape = () => {
        const commonStyle: React.CSSProperties = {
            width: config.size,
            height: config.size,
            backgroundColor: config.color,
            boxShadow: `0 20px 60px rgba(0,0,0,0.1)`,
        };

        if (config.type === 'circle') {
            return <div style={{ ...commonStyle, borderRadius: '50%' }} />;
        }
        if (config.type === 'triangle') {
            return (
                <div style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${config.size / 2}px solid transparent`,
                    borderRight: `${config.size / 2}px solid transparent`,
                    borderBottom: `${config.size}px solid ${config.color}`,
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.1))`,
                }} />
            );
        }
        return <div style={commonStyle} />; // Square
    };

    return (
        <div
            style={{
                position: 'absolute',
                left: currentX,
                top: currentY,
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                filter: `blur(${blur}px)`,
                opacity,
                willChange: 'transform, filter',
            }}
        >
            {renderShape()}
        </div>
    );
};

export const FloatingGeometricDepth: React.FC = () => {
    const { width, height } = useVideoConfig();
    const sf = height / 2160; // Scale factor untuk resolusi 4K

    // Jumlah objek yang cukup untuk mengisi layar tanpa terlihat sesak
    const objects = useMemo(() => {
        return new Array(25).fill(0).map((_, i) => i);
    }, []);

    return (
        <AbsoluteFill style={{ backgroundColor: '#fffafa', overflow: 'hidden' }}>
            {/* Latar belakang gradient lembut */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #fff1f2 100%)',
                }}
            />

            {/* Layer Objek */}
            {objects.map((seed) => (
                <GeometricObject key={seed} seed={seed} sf={sf} />
            ))}

            {/* Overlay Grain untuk tekstur yang lebih "clean" tapi berdimensi */}
            <AbsoluteFill style={{
                pointerEvents: 'none',
                opacity: 0.2,
                mixBlendMode: 'overlay',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }} />

            {/* Vignette halus untuk memusatkan fokus */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, transparent 40%, rgba(203, 213, 225, 0.4) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};