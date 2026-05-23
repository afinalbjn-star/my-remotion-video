import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    random,
    Easing,
} from 'remotion';

const PACKET_COUNT = 150;

const PACKET_COLORS = [
    '#00f3ff', // Cyan
    '#9d00ff', // Purple
    '#ff007f', // Magenta
    '#39ff14', // Neon Green
    '#ff9e00', // Orange
    '#fbff00', // Yellow
];

const DataPacket: React.FC<{ seed: number }> = ({ seed }) => {
    const frame = useCurrentFrame();
    const { durationInFrames, width, height } = useVideoConfig();

    const randomVal = (s: string) => random(seed + s);

    // Variabel posisi unik
    const rX = useMemo(() => (randomVal('x') - 0.5) * width * 3, [seed, width]);
    const rY = useMemo(() => (randomVal('y') - 0.5) * height * 3, [seed, height]);
    const size = useMemo(() => 40 + randomVal('size') * 100, [seed]);

    // Agar seamless looping, multiplier harus bilangan bulat (integer)
    const speedMultiplier = useMemo(() => Math.floor(randomVal('speed') * 3) + 1, [seed]);

    // Logika Loop Seamless
    const progression = ((frame * speedMultiplier + (seed * 123)) % durationInFrames) / durationInFrames;

    // Animasi 3D Tunnel
    const scale = interpolate(progression, [0, 1], [0, 8], { easing: Easing.in(Easing.quad) });
    const opacity = interpolate(progression, [0, 0.1, 0.7, 1], [0, 1, 1, 0]);

    // Gerakan menyebar dari tengah (Tunnel effect)
    const posX = (width / 2) + (rX * progression);
    const posY = (height / 2) + (rY * progression);

    const color = PACKET_COLORS[seed % PACKET_COLORS.length];

    return (
        <div
            style={{
                position: 'absolute',
                width: `${size}px`,
                height: `${size * 0.6}px`,
                left: `${posX}px`,
                top: `${posY}px`,
                backgroundColor: 'transparent',
                border: `2px solid ${color}`,
                boxShadow: `0 0 20px ${color}, inset 0 0 10px ${color}`,
                opacity,
                transform: `translate(-50%, -50%) scale(${scale}) rotateX(45deg) rotateZ(${frame + seed}deg)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: color,
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                overflow: 'hidden',
            }}
        >
            {/* Konten Data (Biner) di dalam paket */}
            <div style={{ opacity: 0.5 }}>
                {Math.floor(randomVal('bin') * 10000).toString(2).slice(0, 4)}
            </div>
        </div>
    );
};

export const CyberFlow: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: '#001b3a', overflow: 'hidden' }}>
            {/* 2. Aliran Data Packets */}
            {new Array(PACKET_COUNT).fill(0).map((_, i) => (
                <DataPacket key={i} seed={i} />
            ))}
        </AbsoluteFill>
    );
};