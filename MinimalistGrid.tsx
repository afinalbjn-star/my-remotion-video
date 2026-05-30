import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
} from 'remotion';

export const MinimalistGrid: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Pengaturan Hexagon (Matematika Grid Lebah)
    const r = 100; // Radius/panjang sisi hexagon
    const w = Math.sqrt(3) * r; // Lebar unit pattern
    const rowH = 1.5 * r; // Tinggi satu baris hexagon

    const neonColor = '#00f2ff';
    const bgColor = '#05070a'; // Lebih gelap agar lebih tenang

    // Progress gerakan sejauh satu lebar unit (w) untuk looping sempurna
    const moveDist = interpolate(
        frame,
        [0, durationInFrames],
        [0, w]
    );

    const numRows = Math.ceil(height / rowH) + 2;

    return (
        <AbsoluteFill style={{ backgroundColor: bgColor }}>
            <svg width={width} height={height} style={{ position: 'absolute' }}>
                <defs>
                    {/* Efek Neon Glow */}
                    <filter id="neonGlowGrid" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur1" />
                        <feGaussianBlur stdDeviation="8" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur2" />
                            <feMergeNode in="blur1" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Definisi Pola Hexagon */}
                    <pattern
                        id="gridPattern"
                        width={w}
                        height={rowH}
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d={`M 0 ${r / 2} L ${w / 2} 0 L ${w} ${r / 2} M ${w} ${r / 2} v ${r} M 0 ${r / 2} v ${r}`}
                            fill="none"
                            stroke={neonColor}
                            strokeWidth="2"
                            strokeOpacity="0.6"
                        />
                    </pattern>
                </defs>

                {/* Looping untuk membuat baris-baris yang bergerak berselingan */}
                {Array.from({ length: numRows }).map((_, i) => {
                    const rowIdx = i - 1;
                    const isEven = rowIdx % 2 === 0;
                    const direction = isEven ? -1 : 1;
                    // Offset horizontal untuk posisi hexagon yang zigzag (staggered)
                    const xOffset = isEven ? 0 : w / 2;
                    const tx = xOffset + (moveDist * direction);
                    const ty = rowIdx * rowH;

                    return (
                        <g key={i} style={{ transform: `translate(${tx}px, ${ty}px)` }}>
                            <rect
                                x={-w}
                                width={width + w * 2}
                                height={rowH}
                                fill="url(#gridPattern)"
                                filter="url(#neonGlowGrid)"
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Overlay Gradient untuk kedalaman visual di tepian */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle, transparent 40%, rgba(15, 17, 21, 0.8) 100%)',
                pointerEvents: 'none'
            }} />
        </AbsoluteFill>
    );
};