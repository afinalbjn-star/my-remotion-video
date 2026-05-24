import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    Easing,
} from 'remotion';

const CIRCLE_COUNT = 5;
const PASTEL_COLORS = [
    '#FFB7B2', // Pastel Pink
    '#FFDAC1', // Pastel Orange
    '#E2F0CB', // Pastel Greenish Yellow
    '#B5EAD7', // Pastel Mint
    '#C7CEEA', // Pastel Periwinkle
];

const LoadingCircle: React.FC<{ index: number }> = ({ index }) => {
    const frame = useCurrentFrame();
    const { width, height, durationInFrames } = useVideoConfig();

    // Pengaturan Durasi (900 frame / 3 gerakan = 300 frame per segmen)
    // Segmen 1: 0-300 (Wave), Segmen 2: 300-600 (Orbit), Segmen 3: 600-900 (Pulse)
    const section = durationInFrames / 3;

    const posX = useMemo(() => {
        // Gerakan 1: Wave (Horizontal spacing)
        const waveX = (width / 2) + (index - 2) * 250;

        // Gerakan 2: Orbit (Circle calculation)
        const angle = (frame * 0.04) + (index * (Math.PI * 2) / CIRCLE_COUNT);
        const radius = 400;
        const orbitX = (width / 2) + Math.cos(angle) * radius;

        // Gerakan 3: Pulse (Convergence to center)
        const pulseX = width / 2;

        // Interpolasi antar posisi agar transisi smooth
        if (frame < section) {
            // Transisi dari Wave ke Orbit di akhir section
            return interpolate(frame, [section - 50, section], [waveX, orbitX], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.42, 0, 0.58, 1),
            });
        } else if (frame < section * 2) {
            // Transisi dari Orbit ke Pulse
            return interpolate(frame, [section * 2 - 50, section * 2], [orbitX, pulseX], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.42, 0, 0.58, 1),
            });
        } else {
            // Transisi dari Pulse kembali ke Wave (untuk seamless loop)
            return interpolate(frame, [durationInFrames - 50, durationInFrames], [pulseX, waveX], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.42, 0, 0.58, 1),
            });
        }
    }, [frame, index, width, section, durationInFrames]);

    const posY = useMemo(() => {
        // Gerakan 1: Wave (Vertical Sine)
        const waveY = (height / 2) + Math.sin((frame * 0.1) + (index * 0.5)) * 150;

        // Gerakan 2: Orbit
        const angle = (frame * 0.04) + (index * (Math.PI * 2) / CIRCLE_COUNT);
        const radius = 400;
        const orbitY = (height / 2) + Math.sin(angle) * radius;

        // Gerakan 3: Pulse
        const pulseY = height / 2;

        if (frame < section) {
            return interpolate(frame, [section - 50, section], [waveY, orbitY], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            });
        } else if (frame < section * 2) {
            return interpolate(frame, [section * 2 - 50, section * 2], [orbitY, pulseY], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            });
        } else {
            return interpolate(frame, [durationInFrames - 50, durationInFrames], [pulseY, (height / 2) + Math.sin(0 + (index * 0.5)) * 150], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
            });
        }
    }, [frame, index, height, section, durationInFrames]);

    const scale = useMemo(() => {
        if (frame < section * 2) return 1;
        // Efek denyut jantung pada gerakan ke-3
        return interpolate(
            Math.sin(frame * 0.15),
            [-1, 1],
            [0.8, 1.3]
        );
    }, [frame, section]);

    return (
        <div
            style={{
                position: 'absolute',
                left: posX,
                top: posY,
                width: 300,
                height: 300,
                backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length],
                borderRadius: '50%',
                transform: `translate(-50%, -50%) scale(${scale})`,
                boxShadow: `0 0 60px ${PASTEL_COLORS[index % PASTEL_COLORS.length]}88`,
                border: '4px solid rgba(255, 255, 255, 0.3)',
            }}
        />
    );
};

export const PastelLoading: React.FC = () => {
    return (
        <AbsoluteFill
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {new Array(CIRCLE_COUNT).fill(0).map((_, i) => (
                <LoadingCircle key={i} index={i} />
            ))}
        </AbsoluteFill>
    );
};