import React from 'react';
import {
    AbsoluteFill,
    interpolate,
    useCurrentFrame,
    useVideoConfig,
    Easing,
} from 'remotion';

const COLORS = [
    '#FF3D71', // Vibrant Pink
    '#3366FF', // Royal Blue
    '#00D68F', // Emerald Green
    '#FFAA00', // Amber
    '#8A2BE2', // Violet
];

// Path SVG untuk kepingan puzzle geometris kompleks
const PUZZLE_PATH = "M80,40 C80,20 100,20 100,40 C100,60 120,60 120,80 C120,100 100,100 100,120 C100,140 80,140 80,120 C60,120 60,140 40,140 C20,140 20,120 40,120 C40,100 20,100 20,80 C20,60 40,60 40,40 C40,20 60,20 60,40 C60,60 80,60 80,40 Z";

const PuzzleLayer: React.FC<{
    index: number;
    scale: number;
    opacity: number;
    color: string;
}> = ({ scale, opacity, color }) => {
    return (
        <div
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `scale(${scale})`,
                opacity: opacity,
            }}
        >
            <svg
                viewBox="0 0 160 160"
                style={{
                    width: '800px',
                    height: '800px',
                    filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.3))',
                }}
            >
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.8 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0.3 }} />
                    </linearGradient>
                </defs>
                <path
                    d={PUZZLE_PATH}
                    fill={`url(#grad-${color})`}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1"
                    style={{
                        backdropFilter: 'blur(10px)',
                    }}
                />
                {/* Detail Tekstur Internal */}
                <circle cx="80" cy="80" r="10" fill="rgba(255,255,255,0.2)" />
                <path
                    d="M60,80 L100,80 M80,60 L80,100"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="0.5"
                />
            </svg>
        </div>
    );
};

export const InfinitePuzzleZoom: React.FC = () => {
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();

    // Siklus zoom: Setiap 2 detik (120 frame) satu kepingan puzzle membesar 
    // hingga ukurannya sama dengan kepingan di atasnya.
    const cycleFrames = 120;
    const progress = (frame % cycleFrames) / cycleFrames;

    // Kita merender beberapa lapisan sekaligus
    const layers = [0, 1, 2, 3, 4];

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#0a0a0a',
                overflow: 'hidden',
                perspective: '1000px',
            }}
        >
            {/* Efek Bokeh Background */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
                    filter: 'blur(20px)',
                    opacity: 0.5,
                }}
            />

            {layers.map((i) => {
                // Kalkulasi skala eksponensial untuk smooth infinite zoom
                // Skala dasar adalah 4x lipat antar lapisan
                const layerProgress = i - progress;
                const scale = Math.pow(4, -layerProgress);

                // Fade in kepingan yang baru muncul di tengah, 
                // Fade out kepingan yang sudah terlalu besar
                const opacity = interpolate(
                    layerProgress,
                    [3, 2.5, 0, -0.5],
                    [0, 1, 1, 0],
                    { extrapolateRight: 'clamp' }
                );

                // Rotasi perlahan untuk kedalaman visual
                const rotation = interpolate(frame, [0, durationInFrames], [0, 20]);

                const colorIndex = (Math.floor(frame / cycleFrames) + (4 - i)) % COLORS.length;

                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            transform: `rotateZ(${rotation}deg)`,
                        }}
                    >
                        <PuzzleLayer
                            index={i}
                            scale={scale}
                            opacity={opacity}
                            color={COLORS[colorIndex]}
                        />
                    </div>
                );
            })}

            {/* Overlay Pencahayaan (Vignette & Glow) */}
            <AbsoluteFill
                style={{
                    background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};